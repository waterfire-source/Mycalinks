//委託商品取得
// 委託在庫取得

import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiConsignmentService } from '@/api/backendApi/services/consignment/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { Prisma } from '@prisma/client';
import { getConsignmentProductApi } from 'api-generator';

export const GET = BackendAPI.create(
  getConsignmentProductApi,
  async (API, { params, query }) => {
    const whereInput: Array<Prisma.ProductWhereInput> = [];

    // クエリパラメータを見ていく
    await API.processQueryParams((key, value) => {
      if (!value) return;

      switch (key) {
        case 'genre_id':
        case 'category_id':
          whereInput.push({
            item: {
              [key]: value as number,
            },
          });
          break;

        case 'display_name': {
          //商品マスタと商品それぞれのdisplay_nameで検索

          const productService = new BackendApiProductService(API);
          whereInput.push(
            productService.getDisplayNameSearchQuery(value as string),
          );

          break;
        }

        case 'consignment_client_full_name':
          whereInput.push({
            consignment_client: {
              full_name: value as string,
            },
          });
          break;
      }
    });

    const orderByQuery: Prisma.ProductOrderByWithRelationInput[] =
      API.orderByQuery.map((e) => {
        const propName = Object.keys(e)[0];
        const mode = Object.values(e)[0];

        switch (propName) {
          case 'consignment_client_full_name':
            return {
              consignment_client: {
                full_name: mode,
              },
            };
          default:
            return e;
        }
      });

    const [selectRes, totalCount] = await Promise.all([
      API.db.product.findManyExists({
        where: {
          AND: whereInput,
          store_id: params.store_id,
          consignment_client_id: {
            not: null,
          },
          stock_number: {
            not: 0,
          },
        },
        ...API.limitQuery,
        orderBy: orderByQuery,
        include: {
          item: {
            select: {
              expansion: true,
              rarity: true,
              cardnumber: true,
            },
          },
          specialty: {
            select: {
              display_name: true,
            },
          },
          consignment_client: {
            select: {
              id: true,
              full_name: true,
            },
          },
        },
      }),
      query.includesSummary
        ? API.db.product.count({
            where: {
              AND: whereInput,
              store_id: params.store_id,
              consignment_client_id: {
                not: null,
              },
              stock_number: {
                not: 0,
              },
            },
          })
        : 0,
    ]);

    const products = await Promise.all(
      selectRes
        .map(async (p) => {
          const productService = new BackendApiProductService(API);
          const displayNameWithMeta =
            productService.core.getProductNameWithMeta(p);

          const consignmentService = new BackendApiConsignmentService(API);
          const transactionStats =
            await consignmentService.core.getTransactionStats({
              product_id: p.id,
            });

          return {
            ...p,
            displayNameWithMeta,
            totalSalePrice: transactionStats.totalSalePrice,
          };
        }),
    );

    return {
      products,
      summary: {
        totalCount,
      },
    };
  },
);
