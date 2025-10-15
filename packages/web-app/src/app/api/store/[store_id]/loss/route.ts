import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { Loss, ProductStockHistorySourceKind } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendLossAPI } from '@/app/api/store/[store_id]/loss/api';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';

//ロス登録を行うAPI
export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id } = API.params;

    const {
      datetime,
      reason, //テキストベース
      // staff_account_id,
      loss_genre_id,
      products, //[ { product_id,item_count,specificWholesalePrice } ]
    } = API.body as BackendLossAPI[0]['request']['body'];

    API.checkField(['products'], true);

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    let insertResult: Loss | null = null;

    //商品情報を取得する
    const productsInfo = await API.db.product.findMany({
      where: {
        id: {
          in: products.map((p: any) => p.product_id),
        },
      },
    });

    //合計値を算出する
    let summary: {
      totalCount: number;
      totalSellPrice: number;
    } = {
      totalCount: 0,
      totalSellPrice: 0,
    };

    summary = products.reduce((acc: typeof summary, p: any) => {
      const thisRecord = productsInfo.find((e) => e.id == p.product_id);

      if (!thisRecord) throw new ApiError('notExist');

      const sellPrice =
        thisRecord.specific_sell_price ?? thisRecord.sell_price ?? 0;

      acc.totalCount += p.item_count;
      acc.totalSellPrice += p.item_count * sellPrice;

      return acc;
    }, summary);

    const txResult = await API.transaction(
      async (tx) => {
        //ロス登録をしつつ、在庫変動を行う
        const lossInsertResult = await tx.loss.create({
          data: {
            store_id: parseInt(store_id || ''),
            datetime,
            reason,
            staff_account_id,
            loss_genre_id,
            total_item_count: summary.totalCount,
            total_sell_price: summary.totalSellPrice,
            products: {
              create: products.map((product: any) => ({
                product_id: product.product_id,
                item_count: product.item_count,
              })),
            },
          },
          include: {
            products: true,
          },
        });

        //それぞれのProductの在庫変動を行う
        //ここで該当商品の在庫数を調整する
        for (const {
          product_id,
          item_count,
          specificWholesalePrice,
        } of products) {
          //在庫調整を行う
          const thisProduct = new BackendApiProductService(API, product_id);

          const changeResult = await thisProduct.core.decreaseStock({
            source_kind: ProductStockHistorySourceKind.loss,
            source_id: lossInsertResult.id,
            decreaseCount: item_count,
            specificWholesalePrice,
            description: `ロス${lossInsertResult.id} 登録によって ${product_id}が${item_count}減少しました`,
          });
        }

        insertResult = lossInsertResult;
      },
      {
        maxWait: 5 * 1000, // default: 2000
        timeout: 6 * 60 * 1000, // タイムアウトは6分（決済が5分のため）
      },
    );

    return API.status(201).response({ data: insertResult });
  },
);
// ロスの情報を取得するAPI
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id } = API.params;

    const selectRes = await API.db.loss.findMany({
      where: {
        store_id: parseInt(store_id),
      },
      include: {
        staff_account: {
          select: {
            display_name: true,
          },
        },
        loss_genre: {
          select: {
            id: true,
            display_name: true,
          },
        },
        products: {
          select: {
            product_id: true,
            item_count: true,
            //以下追加
            product: {
              select: {
                id: true,
                image_url: true,
                product_code: true,
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
                condition_option: {
                  select: {
                    display_name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    selectRes.forEach((l) => {
      l.products.forEach((p) => {
        const productModel = new BackendApiProductService(API);
        //@ts-expect-error becuase of because of
        p.product.displayNameWithMeta = productModel.getProductNameWithMeta(
          p.product,
        );
      });
    });

    const result = BackendAPI.useFlat(selectRes);

    return API.status(200).response({ data: result });
  },
);
