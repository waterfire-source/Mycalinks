//出荷の作成/下書き更新
// 出荷の登録・更新

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { Prisma, StoreShipmentStatus } from '@prisma/client';
import {
  createOrUpdateStoreShipmentApi,
  getStoreShipmentApi,
} from 'api-generator';

export const POST = BackendAPI.create(
  createOrUpdateStoreShipmentApi,
  async (API, { params, body }) => {
    const { store_id } = params;

    const {
      id,
      to_store_id,
      shipment_date,
      description,
      total_wholesale_price,
      products,
    } = body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    //productsは100個まで
    if (products.length > 100) {
      throw new ApiError({
        status: 400,
        messageText: '1回の店舗間出荷で指定できる商品は100種類までです',
      });
    }

    if (id) {
      const alreadyInfo = await API.db.store_Shipment.findUnique({
        where: {
          id,
          store_id,
          status: StoreShipmentStatus.NOT_YET, //下書き限定
        },
      });

      if (!alreadyInfo) {
        throw new ApiError('notExist');
      }
    } else {
      //新規作成時必要なやつ
      API.checkField(['products', 'to_store_id', 'shipment_date'], true);

      //このストアIDが適切かどうかみる
      const toStoreInfo = await API.db.store.findUnique({
        where: {
          id: to_store_id,
          accounts: {
            every: {
              account: {
                linked_corporation_id: API.resources.corporation!.id,
              },
            },
          },
        },
        select: {
          id: true,
        },
      });

      if (!toStoreInfo) {
        throw new ApiError({
          status: 404,
          messageText: '指定された店舗が見つかりません',
        });
      }
    }

    //upsertだとなぜか更新時でもcreateが発火するので明確に分離する
    const txResult = await API.transaction(async (tx) => {
      let shipmentRecord;

      if (id) {
        // 編集モード：既存レコードをupdateで更新
        await tx.store_Shipment_Product.deleteMany({
          where: {
            store_shipment_id: id,
          },
        });

        shipmentRecord = await tx.store_Shipment.update({
          where: { id },
          data: {
            //指定されているカラムのみ更新
            ...(shipment_date !== undefined && { shipment_date }),
            ...(description !== undefined && { description }),
            ...(total_wholesale_price !== undefined && {
              total_wholesale_price,
            }),
            ...(to_store_id !== undefined && { to_store_id }),
            products: {
              create: products.map((e) => ({
                product_id: e.product_id,
                item_count: e.item_count,
              })),
            },
          },
          include: {
            products: {
              include: {
                product: {
                  select: {
                    id: true,
                    actual_sell_price: true,
                  },
                },
              },
            },
          },
        });
      } else {
        shipmentRecord = await tx.store_Shipment.create({
          data: {
            store_id,
            to_store_id: to_store_id!,
            shipment_date: shipment_date!,
            staff_account_id,
            description,
            total_wholesale_price,
            products: {
              create: products.map((e) => ({
                product_id: e.product_id,
                item_count: e.item_count,
              })),
            },
          },
          include: {
            products: {
              include: {
                product: {
                  select: {
                    id: true,
                    actual_sell_price: true,
                  },
                },
              },
            },
          },
        });
      }

      const upsertRes = shipmentRecord;

      const total_item_count = products.reduce(
        (acc, e) => acc + e.item_count,
        0,
      );
      const total_sale_price = upsertRes.products.reduce(
        (acc, e) => acc + e.item_count * e.product.actual_sell_price!,
        0,
      );

      const updateRes = await tx.store_Shipment.update({
        where: {
          id: upsertRes.id,
        },
        data: {
          total_item_count,
          total_sale_price,
        },
        include: {
          products: true,
        },
      });

      return updateRes;
    });

    return txResult;
  },
);
// 出荷の取得

export const GET = BackendAPI.create(
  getStoreShipmentApi,
  async (API, { params }) => {
    const whereInput: Array<Prisma.Store_ShipmentWhereInput> = [];

    // クエリパラメータを見ていく
    await API.processQueryParams((key, value) => {
      switch (key) {
        case 'id':
          whereInput.push({ [key]: value as number });
          break;
        case 'status':
          whereInput.push({
            [key]: value as StoreShipmentStatus,
          });
          break;
        case 'staff_account_id':
        case 'to_store_id':
          whereInput.push({
            [key]: value as number,
          });
          break;
        case 'shipment_date_gte':
          whereInput.push({
            shipment_date: { gte: value as Date },
          });
          break;
        case 'shipment_date_lt':
          whereInput.push({
            shipment_date: { lt: value as Date },
          });
          break;
        case 'name':
          whereInput.push({
            OR: [
              {
                products: {
                  some: {
                    product: {
                      display_name: {
                        contains: value as string,
                      },
                    },
                  },
                },
              },
              {
                to_store: {
                  display_name: {
                    contains: value as string,
                  },
                },
              },
            ],
          });
          break;
      }
    });

    const selectRes = await API.db.store_Shipment.findMany({
      where: {
        AND: whereInput,
        store_id: params.store_id,
      },
      include: {
        products: true,
      },
    });

    return {
      storeShipments: selectRes,
    };
  },
);
