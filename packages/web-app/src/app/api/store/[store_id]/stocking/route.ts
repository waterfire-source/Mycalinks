import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { Prisma, Stocking, StockingStatus } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { listStockingApi } from 'api-generator';
import { customDayjs } from 'common';

//入荷の登録を行うAPI
//IDを指定することで変更ができる
export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: ['list_stocking'], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id } = API.params;

    const {
      id, //IDを指定して更新

      planned_date, //予定仕入れ日時
      supplier_id, //仕入れ先のID
      // staff_account_id, //担当者ID

      stocking_products, //仕入れの商品定義
    } = API.body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    let stockingInfo: Stocking | null = null;

    stockingInfo = await API.transaction(async (tx) => {
      if (API.statusNum == 400) throw new ApiError('notEnough');

      let currentStockingInfo: Stocking | null = null;

      if (id) {
        currentStockingInfo = await tx.stocking.findUnique({
          where: {
            store_id: Number(store_id),
            id,
            status: StockingStatus.NOT_YET, //まだ完了してないものだけ編集できる
          },
        });

        if (!currentStockingInfo) throw new ApiError('notExist');

        //productsが入っているなら、一度既存のものを削除
        if (stocking_products) {
          await tx.stocking_Product.deleteMany({
            where: {
              stocking_id: id,
            },
          });
        }
      } else {
        //指定されていない場合、ちゃんと情報が足りてるか確認
        API.checkField(
          ['supplier_id', 'planned_date', 'stocking_products'],
          true,
        );
      }

      //作成する
      const updateResult = await tx.stocking.upsert({
        where: {
          id: Number(id || 0),
        },
        update: {
          planned_date: planned_date
            ? customDayjs.tz(planned_date).toDate()
            : undefined,
          supplier_id,
          staff_account_id,
          stocking_products: {
            //仕入れる商品の定義
            create: (stocking_products || []).map((each: any) => ({
              product_id: each.product_id,
              planned_item_count: each.planned_item_count,
              unit_price: each.unit_price, //DBで保持する時はrawな値で
              unit_price_without_tax: each.unit_price_without_tax,
            })),
          },
        },
        create: {
          store_id: parseInt(store_id),
          //ステータスはdefault値を使う
          planned_date: new Date(planned_date),
          supplier_id,
          staff_account_id,
          stocking_products: {
            //仕入れる商品の定義
            create: (stocking_products || []).map((each: any) => ({
              product_id: each.product_id,
              planned_item_count: each.planned_item_count,
              unit_price: each.unit_price,
              unit_price_without_tax: each.unit_price_without_tax,
            })),
          },
        },
      });

      return updateResult;
    });

    return API.status(id ? 200 : 201).response({
      data: { id: stockingInfo.id },
    });
  },
);

//条件を指定して、入荷の情報を取得するAPI
export const GET = BackendAPI.create(listStockingApi, async (API) => {
  const whereQuery: Prisma.StockingWhereInput[] = [];

  Object.entries(API.query).forEach(([prop, value]: any) => {
    switch (prop) {
      case 'id':
        whereQuery.push({ id: { in: [value] } });
        break;
      case 'status':
        whereQuery.push({
          status: value,
        });
        break;
      case 'staff_account_id':
        whereQuery.push({
          staff_account_id: Number(value),
        });
        break;
      case 'productName':
        whereQuery.push({
          stocking_products: {
            some: {
              product: {
                is: {
                  display_name: {
                    contains: value,
                  },
                },
              },
            },
          },
        });
        break;
      case 'gte':
        {
          console.log(value);
          whereQuery.push({
            planned_date: {
              gte: customDayjs.tz(value).toDate(),
            },
          });
        }
        break;
      case 'lte':
        whereQuery.push({
          planned_date: {
            lte: customDayjs.tz(value).toDate(),
          },
        });
        break;
    }
  });

  let result: any = [];
  let totalCount: number | undefined = undefined;

  const { store_id } = API.params;

  const whereConditions = {
    AND: [
      {
        store_id: parseInt(store_id || '0'),
      },
      ...whereQuery,
    ],
  };

  // 総件数を取得（includesSummaryが指定されている場合）
  if (API.query.includesSummary) {
    totalCount = await API.db.stocking.count({
      where: structuredClone(whereConditions),
    });
  }

  const selectResult = await API.db.stocking.findMany({
    where: structuredClone(whereConditions),
    orderBy: {
      planned_date: 'desc',
    },
    include: {
      store: {
        select: {
          display_name: true,
        },
      },
      supplier: {
        select: {
          display_name: true,
        },
      },
      from_store_shipment: {
        select: {
          id: true,
          store: {
            select: {
              display_name: true,
            },
          },
        },
      },
      stocking_products: {
        include: {
          product: {
            select: {
              display_name: true,
              specialty: {
                select: {
                  display_name: true,
                },
              },
              item: {
                select: {
                  rarity: true,
                  expansion: true,
                  cardnumber: true,
                },
              },
              image_url: true,
              actual_sell_price: true,
              condition_option: {
                select: {
                  display_name: true,
                },
              },
              management_number: true,
            },
          },
        },
      },
    },
    ...API.limitQuery,
  });

  selectResult.forEach((s) => {
    s.stocking_products.forEach((p) => {
      const productModel = new BackendApiProductService(API);
      //@ts-expect-error becuase of because of
      p.product.displayNameWithMeta = productModel.core.getProductNameWithMeta(
        p.product,
      );
    });
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  result = BackendAPI.useFlat(selectResult, {
    store__display_name: 'store_name',
    supplier__display_name: 'supplier_name',
    product__display_name: 'product_name',
    product__image_url: 'image_url',
    product__actual_sell_price: 'actual_sell_price',
    from_store_shipment__id: 'from_store_shipment_id',
    from_store_shipment__store__display_name: 'from_store_name',
  });

  return { data: result, totalCount: totalCount };
});
