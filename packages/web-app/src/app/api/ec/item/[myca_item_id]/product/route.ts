import { BackendAPI } from '@/api/backendApi/main';
import { ConditionOptionHandle, Prisma, SpecialtyHandle } from '@prisma/client';
import { ApiResponse, getEcProductApi } from 'api-generator';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiEcShippingService } from '@/api/backendApi/services/ec/shipping/main';
import { ecConstants } from 'common';

//EC在庫取得API
export const GET = BackendAPI.create(
  getEcProductApi,
  async (API, { query, params }) => {
    const whereInput: Array<Prisma.ProductWhereInput> = [];

    //クエリパラメータを見ていく
    for (const prop in query) {
      const key = prop as keyof typeof query;
      const value = query[key];

      switch (key) {
        case 'conditionOption':
          whereInput.push({
            condition_option: {
              handle: value as ConditionOptionHandle,
            },
          });
          break;

        case 'specialty': {
          // カンマ区切り対応
          const values =
            typeof value === 'string'
              ? value
                  .split(',')
                  .map((v) => v.trim())
                  .filter(Boolean)
              : [];
          if (values.length > 0) {
            whereInput.push({
              specialty: {
                handle: {
                  in: values as SpecialtyHandle[],
                },
              },
            });
          }
          break;
        }

        case 'hasStock':
          whereInput.push({
            ec_stock_number: {
              gt: 0,
            },
          });
          break;
      }
    }

    const mycaAppService = new BackendApiMycaAppService(API);

    const [selectRes, mycaItem] = await Promise.all([
      API.db.product.findMany({
        where: {
          AND: whereInput,
          mycalinks_ec_enabled: true,
          deleted: false,
          item: {
            myca_item_id: params.myca_item_id,
            OR: [
              {
                release_at: null,
              },
              {
                release_at: {
                  lte: new Date(),
                },
              },
            ],
          },
          store: {
            mycalinks_ec_enabled: true,
          },
          condition_option: {
            handle: {
              in: [
                ...Object.keys(ecConstants.ecConditionOptionHandleDict),
              ] as ConditionOptionHandle[],
            },
          },
          actual_ec_sell_price: {
            gt: 0,
          },
        },
        select: {
          id: true,
          ec_stock_number: true,
          actual_ec_sell_price: true,
          condition_option: {
            select: {
              handle: true,
            },
          },
          specialty: {
            select: {
              handle: true,
            },
          },
          store: {
            select: {
              id: true,
              display_name: true,
              ec_setting: {
                select: {
                  enable_same_day_shipping: true,
                  same_day_limit_hour: true,
                  shipping_days: true,
                  free_shipping_price: true,
                },
              },
              shipping_methods: {
                include: {
                  regions: true,
                  weights: {
                    include: {
                      regions: true,
                    },
                  },
                },
              },
            },
          },
          images: {
            select: {
              image_url: true,
              description: true,
              order_number: true,
            },
          },
          description: true,
        },
      }),
      mycaAppService.core.item.getAllDetail(
        {
          id: params.myca_item_id,
        },
        {
          detail: 1,
        },
      ),
    ]);

    if (!mycaItem.length)
      throw new ApiError({
        status: 404,
        messageText: 'Mycaアイテム情報が見つかりませんでした',
      });

    //送料無料かどうか
    //@ts-expect-error becuase of because of
    const result = (await Promise.all(
      selectRes.map(async (p) => {
        const shippingMethods = p.store.shipping_methods;

        try {
          await Promise.all(
            shippingMethods.map(async (s) => {
              const shippingModel = new BackendApiEcShippingService(API, s.id);
              shippingModel.core.targetObject = s;
              if (
                await shippingModel.core.judgeFreeShipping({
                  totalPrice: p.actual_ec_sell_price!,
                  freeShippingPrice:
                    p.store.ec_setting?.free_shipping_price ?? undefined,
                })
              )
                throw true;
            }),
          );

          if (p.store.ec_setting) {
            //@ts-expect-error becuase of because of
            p.store.ec_setting.free_shipping = false;
          }
        } catch (e) {
          if (e == true) {
            if (p.store.ec_setting) {
              //@ts-expect-error becuase of because of
              p.store.ec_setting.free_shipping = true;
            }
          } else {
            throw e;
          }
        }

        //@ts-expect-error becuase of because of
        p.store.shipping_methods = undefined;

        if (p.images) {
          p.images.sort((a, b) => a.order_number - b.order_number);
        }

        return p;
      }),
    )) as ApiResponse<typeof getEcProductApi>['products'];

    return {
      mycaItem: mycaItem[0],
      products: result,
    };
  },
);
