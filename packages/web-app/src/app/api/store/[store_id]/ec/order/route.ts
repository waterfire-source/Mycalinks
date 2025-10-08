import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiEcOrderService } from '@/api/backendApi/services/ec/order/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { ApiResponse, getEcOrderByStoreApi } from 'api-generator';
import {
  Ec_Order,
  Ec_Order_Cart_Store,
  EcOrderCartStoreStatus,
  EcOrderStatus,
  Item_Genre,
  Prisma,
} from '@prisma/client';

//ストア用ECオーダー取得API
export const GET = BackendAPI.create(
  getEcOrderByStoreApi,
  async (API, { query, params }) => {
    const whereInput: Array<Prisma.Ec_Order_Cart_StoreWhereInput> = [];

    const orderInput: Array<Prisma.Ec_Order_Cart_StoreOrderByWithRelationInput> =
      [];

    //オーダーを見ていく
    API.orderByQuery.forEach((each) => {
      Object.entries(each).forEach(([prop, mode]) => {
        switch (prop) {
          case 'ordered_at':
            orderInput.push({
              order: {
                ordered_at: mode,
              },
            });
            break;
        }
      });
    });

    //クエリパラメータを見ていく
    for (const prop in query) {
      const key = prop as keyof typeof query;
      const value = query[key];

      switch (key) {
        case 'id':
          whereInput.push({
            order: {
              id: value as Ec_Order['id'],
            },
          });
          break;

        case 'status':
          whereInput.push({
            status: value as Ec_Order_Cart_Store['status'],
          });
          break;

        case 'platform':
          whereInput.push({
            order: {
              platform: value as Ec_Order['platform'],
            },
          });
          break;

        case 'order_payment_method':
          whereInput.push({
            order: {
              payment_method: value as Ec_Order['payment_method'],
            },
          });
          break;

        case 'shipping_method_id':
          whereInput.push({
            shipping_method_id:
              value as Ec_Order_Cart_Store['shipping_method_id'],
          });
          break;

        case 'ordered_at_gte':
          whereInput.push({
            order: {
              ordered_at: {
                gte: value as Date,
              },
            },
          });
          break;

        case 'ordered_at_lt':
          whereInput.push({
            order: {
              ordered_at: {
                lt: value as Date,
              },
            },
          });
          break;

        case 'product_display_name':
          whereInput.push({
            products: {
              some: {
                product: {
                  display_name: {
                    contains: value as string,
                  },
                },
              },
            },
          });
          break;

        case 'genre_id':
          whereInput.push({
            products: {
              some: {
                product: {
                  item: {
                    genre_id: value as Item_Genre['id'],
                  },
                },
              },
            },
          });
          break;
      }
    }

    const orderModel = new BackendApiEcOrderService(API);

    const storeOrders = await API.db.ec_Order_Cart_Store.findMany({
      where: {
        AND: whereInput,
        status: {
          not: EcOrderCartStoreStatus.DRAFT, //下書きのものは取得できない
        },
        store_id: params.store_id,
        order: {
          status: {
            not: EcOrderStatus.DRAFT,
          },
        },
      },
      ...orderModel.core.field.ecOrderCartStore,
      orderBy: orderInput,
      ...API.limitQuery,
    });

    let summary: ApiResponse<typeof getEcOrderByStoreApi>['summary'] =
      undefined;

    if (query.includesSummary) {
      const totalCount = await API.db.ec_Order_Cart_Store.count({
        where: {
          AND: whereInput,
          status: {
            not: EcOrderCartStoreStatus.DRAFT, //下書きのものは取得できない
          },
          store_id: params.store_id,
          order: {
            status: {
              not: EcOrderStatus.DRAFT,
            },
          },
        },
      });

      summary = {
        totalCount,
      };
    }

    storeOrders.forEach((o) => {
      o.products.forEach((p) => {
        const productModel = new BackendApiProductService(API);
        //@ts-expect-error becuase of because of
        p.displayNameWithMeta = productModel.core.getProductNameWithMeta(
          p.product,
        );
      });
    });

    return { storeOrders, summary };
  },
);
