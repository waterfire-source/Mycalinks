// 取引カート取得

import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { Prisma, TransactionKind, TransactionStatus } from '@prisma/client';
import { getTransactionCartApi } from 'api-generator';
import { BackendCoreProductService } from 'backend-core';

export const GET = BackendAPI.create(
  getTransactionCartApi,
  async (API, { params, query }) => {
    const whereInput: Array<Prisma.Transaction_CartWhereInput> = [];

    // クエリパラメータを見ていく
    await API.processQueryParams((key, value) => {
      switch (key) {
        case 'product_display_name': {
          const productService = new BackendApiProductService(API);
          whereInput.push({
            product: productService.getDisplayNameSearchQuery(value as string),
          });
          break;
        }

        case 'consignment_client_id': {
          whereInput.push({
            product: {
              consignment_client_id: value as number,
            },
          });
          break;
        }

        case 'finishedAtStart': {
          whereInput.push({
            transaction: {
              finished_at: {
                gte: value as Date,
              },
            },
          });
          break;
        }

        case 'finishedAtEnd': {
          whereInput.push({
            transaction: {
              finished_at: {
                lt: value as Date,
              },
            },
          });
          break;
        }
      }
    });

    whereInput.push({
      transaction: {
        store_id: params.store_id,
        status: TransactionStatus.completed,
      },
    });

    const [transactionCarts, totalCount, infoForSales] = await Promise.all([
      API.db.transaction_Cart.findMany({
        where: {
          AND: structuredClone(whereInput),
        },
        include: {
          transaction: {
            select: {
              id: true,
              finished_at: true,
              transaction_kind: true,
              payment_method: true,
            },
          },
          product: {
            select: {
              ...BackendCoreProductService.withMetaField,
              image_url: true,
            },
          },
        },
      }),
      query.includesSummary
        ? API.db.transaction_Cart.count({
            where: {
              AND: structuredClone(whereInput),
            },
          })
        : 0,
      query.includesSales
        ? API.db.transaction_Cart.findMany({
            where: {
              AND: structuredClone(whereInput),
              transaction: {
                transaction_kind: TransactionKind.sell,
              },
            },
            select: {
              transaction: {
                select: {
                  is_return: true,
                  transaction_kind: true,
                },
              },
              item_count: true,
              total_sale_unit_price: true,
              consignment_sale_unit_price: true,
              consignment_commission_unit_price: true,
            },
          })
        : null,
    ]);

    //メタ情報をくっつけるやつ
    transactionCarts.forEach((cart) => {
      const productService = new BackendApiProductService(API);
      //@ts-expect-error displayNameWithMetaがない
      cart.product.displayNameWithMeta =
        productService.core.getProductNameWithMeta(cart.product);
    });

    let sales: {
      total_sale_price: number;
      total_consignment_commission_price: number;
    } = {
      total_sale_price: 0,
      total_consignment_commission_price: 0,
    };

    if (infoForSales) {
      sales = infoForSales.reduce((acc, curr) => {
        const factor = curr.transaction.is_return ? -1 : 1;

        acc.total_sale_price +=
          factor * (curr.total_sale_unit_price ?? 0) * (curr.item_count ?? 0);
        acc.total_consignment_commission_price +=
          factor *
          (curr.consignment_commission_unit_price ?? 0) *
          (curr.item_count ?? 0);

        return acc;
      }, sales);
    }

    return {
      transactionCarts,
      summary: {
        totalCount,
      },
      sales,
    };
  },
);
