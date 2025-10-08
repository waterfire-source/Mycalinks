//配送方法作成更新
//配送方法取得API

import { BackendAPI } from '@/api/backendApi/main';
import { Prisma, Shipping_Method } from '@prisma/client';
import { ApiError } from '@/api/backendApi/error/apiError';
import {
  createOrUpdateShippingMethodApi,
  listShippingMethodApi,
} from 'api-generator';

//配送方法作成
export const POST = BackendAPI.create(
  createOrUpdateShippingMethodApi,
  async (API, { params, body }) => {
    //更新モードだったら
    let currentInfo: Shipping_Method | null = null;
    const {
      id,
      display_name,
      enabled_tracking,
      enabled_cash_on_delivery,
      order_number,
      is_store_pickup,
      regions,
      weights,
    } = body;

    if (id) {
      //存在するか確認
      currentInfo = await API.db.shipping_Method.findUnique({
        where: {
          store_id: params.store_id,
          id,
        },
      });

      if (!currentInfo) throw new ApiError('notExist');
    } else {
      //新規作成の場合、名前と追跡のやつと、regions or weightsが必要
      API.checkField(['display_name', 'enabled_tracking'], true);
      if (!regions && !weights)
        throw new ApiError({
          status: 400,
          messageText: '配送方法の新規作成時には名前や追跡情報が必要です',
        });
    }

    //店舗受け取りの場合、weightを指定しちゃいけないし、0円じゃないといけない
    if ((is_store_pickup ?? currentInfo?.is_store_pickup) === true) {
      if (weights) {
        throw new ApiError({
          status: 400,
          messageText:
            '店舗受け取りの配送方法には重量別送料を設定することはできません',
        });
      }

      if (regions) {
        if (regions.some((r) => r.fee !== 0)) {
          throw new ApiError({
            status: 400,
            messageText:
              '店舗受け取りの配送方法には地域別送料を0円にする必要があります',
          });
        }
      }
    }

    //どっちも指定してたらエラー
    if (regions && weights)
      throw new ApiError({
        status: 400,
        messageText: '地域別送料と重量別送料を同時に設定することはできません',
      });

    //upsertする
    const txRes = await API.transaction(async (tx) => {
      const upsertRes = await tx.shipping_Method.upsert({
        where: {
          id: id ?? 0,
        },
        create: {
          display_name: display_name!,
          enabled_tracking,
          enabled_cash_on_delivery,
          order_number,
          is_store_pickup,
          store: {
            connect: {
              id: params.store_id,
            },
          },
          ...(regions
            ? {
                regions: {
                  create: regions,
                },
              }
            : null),
        },
        update: {
          display_name,
          enabled_tracking,
          enabled_cash_on_delivery,
          order_number,
          is_store_pickup,
          ...(regions
            ? {
                regions: {
                  deleteMany: {},
                  create: regions,
                },
                weights: {
                  deleteMany: {},
                },
              }
            : null),
        },
        select: {
          id: true,
        },
      });

      //weightsを指定されている場合、対応する
      if (weights) {
        await tx.shipping_Region.deleteMany({
          where: {
            shipping_id: upsertRes.id,
          },
        });
        await tx.shipping_Method.update({
          where: {
            id: upsertRes.id,
          },
          data: {
            weights: {
              deleteMany: {},
              create: weights.map((w) => ({
                display_name: w.display_name,
                weight_gte: w.weight_gte,
                weight_lte: w.weight_lte,
                regions: {
                  create: w.regions.map((r) => ({
                    ...r,
                    shipping_id: upsertRes.id,
                  })),
                },
              })),
            },
          },
        });
      }

      return upsertRes;
    });

    return txRes;
  },
);

//配送方法取得
export const GET = BackendAPI.create(
  listShippingMethodApi,
  //@ts-expect-error becuase of because of
  async (API, { params, query }) => {
    const whereInput: Array<Prisma.Shipping_MethodWhereInput> = [];

    //クエリパラメータを見ていく
    for (const prop in query) {
      const key = prop as keyof typeof query;
      const value = query[key];

      switch (key) {
        case 'id':
          whereInput.push({
            id: value as number,
          });
          break;
      }
    }

    const selectRes = await API.db.shipping_Method.findMany({
      where: {
        store_id: params.store_id,
        deleted: false,
        AND: whereInput,
      },
      include: {
        ...(query.includesFeeDefs
          ? {
              regions: true,
              weights: {
                include: {
                  regions: true,
                },
              },
            }
          : null),
      },
    });

    return {
      shippingMethods: selectRes,
    };
  },
);
