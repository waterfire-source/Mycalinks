// 予約を作成する

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { ConditionOptionHandle, Prisma, Reservation } from '@prisma/client';
import {
  ApiResponse,
  createReservationApi,
  getReservationApi,
} from 'api-generator';

//予約作成
export const POST = BackendAPI.create(
  createReservationApi,
  async (API, { params, body }) => {
    const { store_id } = params;

    let {
      product_id,
      limit_count,
      limit_count_per_user,
      start_at,
      end_at,
      deposit_price,
      remaining_price,
      description,
    } = body;

    //この在庫が予約用として適切かどうかを判断する
    const thisProductInfo = await API.db.product.findUniqueExists({
      where: {
        id: product_id,
        store_id,
        condition_option: {
          handle: ConditionOptionHandle.O1_BRAND_NEW, //新品状態じゃ無いといけない
        },
        // reservations: {
        //   //今予約で取り扱っているやつはダメ
        //   none: {
        //     status: {
        //       not: ReservationStatus.FINISHED,
        //     },
        //   },
        // },
      },
    });

    if (!thisProductInfo) {
      throw new ApiError({
        status: 400,
        messageText: '予約用の在庫として不適切です',
      });
    }

    //予約を作成していく
    const createRes = await API.db.reservation.create({
      data: {
        store_id,
        product_id,
        limit_count,
        limit_count_per_user,
        start_at,
        end_at,
        deposit_price,
        remaining_price,
        description,
      },
    });

    return createRes;
  },
);

// 予約取得

export const GET = BackendAPI.create(
  getReservationApi,
  async (API, { params, query }) => {
    const whereInput: Array<Prisma.ReservationWhereInput> = [];

    // クエリパラメータを見ていく
    await API.processQueryParams((key, value) => {
      switch (key) {
        case 'id':
          whereInput.push({
            [key]: value as Reservation['id'],
          });
          break;
        case 'status':
          whereInput.push({
            [key]: value as Reservation['status'],
          });
          break;
        case 'product_display_name':
          whereInput.push({
            product: {
              display_name: {
                contains: value as string,
              },
            },
          });
          break;
      }
    });

    //並び替え
    const orderBy: Array<Prisma.ReservationOrderByWithRelationInput> = [];
    API.orderByQuery.forEach((e) => {
      Object.entries(e).forEach(([key, value]) => {
        switch (key) {
          case 'release_date':
            orderBy.push({
              product: {
                item: {
                  release_date: value,
                },
              },
            });
            break;

          case 'product_display_name':
            orderBy.push({
              product: {
                display_name: value,
              },
            });
            break;
        }
      });
    });

    const [selectRes, totalCount] = await Promise.all([
      API.db.reservation.findMany({
        where: {
          AND: whereInput,
          store_id: params.store_id,
        },
        include: {
          product: {
            include: {
              specialty: {
                select: {
                  display_name: true,
                },
              },
              item: true,
              condition_option: {
                select: {
                  display_name: true,
                },
              },
            },
          },
        },
        orderBy,
      }),
      query.includesSummary
        ? API.db.reservation.count({
            where: {
              AND: whereInput,
              store_id: params.store_id,
            },
          })
        : 0,
    ]);

    selectRes.forEach((res) => {
      const productService = new BackendApiProductService(API);
      //@ts-expect-error because of
      res.product.displayNameWithMeta =
        productService.core.getProductNameWithMeta(res.product);
    });

    return {
      reservations: selectRes as unknown as ApiResponse<
        typeof getReservationApi
      >['reservations'],
      summary: {
        totalCount,
      },
    };
  },
);
