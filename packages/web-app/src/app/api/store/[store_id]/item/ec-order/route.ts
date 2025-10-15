import { BackendAPI } from '@/api/backendApi/main';
import { EcOrderStatus, Prisma } from '@prisma/client';
import { listItemWithEcOrder } from '@/app/api/store/[store_id]/item/def';
import { listItemWithEcOrderApi } from 'api-generator';
import { customDayjs } from 'common';

//商品マスタベースでのEC注文履歴取得
export const GET = BackendAPI.create(
  listItemWithEcOrderApi,
  async (API, { params, query }) => {
    let whereQuery: Prisma.Sql = Prisma.sql`
      Ec_Order.status = ${EcOrderStatus.COMPLETED}
      AND Ec_Order_Cart_Store.store_id = ${params.store_id}
    `;
    const orderWhereInput: Array<Prisma.Ec_OrderWhereInput> = [
      {
        status: EcOrderStatus.COMPLETED,
        cart_stores: {
          some: {
            store_id: params.store_id,
          },
        },
      },
    ];

    // クエリパラメータを見ていく
    for (const prop in query) {
      const key = prop as keyof typeof query;
      const value = query[key];

      switch (key) {
        case 'item_id':
          whereQuery = Prisma.sql`${whereQuery} AND Item.id = ${value}`;
          break;

        case 'display_name':
          if (!value) break;
          whereQuery = Prisma.sql`${whereQuery} AND (Item.display_name LIKE ${`%${value}%`} OR (Item.keyword LIKE ${`%${value}%`}))`;
          break;

        case 'rarity':
          if (!value) break;
          whereQuery = Prisma.sql`${whereQuery} AND Item.rarity = ${value}`;
          break;

        case 'cardnumber':
          if (!value) break;
          whereQuery = Prisma.sql`${whereQuery} AND Item.cardnumber LIKE ${`%${value}%`}`;
          break;

        case 'genre_id':
          if (!value) break;
          whereQuery = Prisma.sql`${whereQuery} AND Item.genre_id = ${value}`;
          break;

        case 'orderCreatedAtGte': {
          if (!value) break;

          const targetDay = customDayjs(value as Date)
            .tz()
            .format('YYYY-MM-DD HH:mm:ss');

          whereQuery = Prisma.sql`${whereQuery} AND Ec_Order.ordered_at >= ${targetDay}`;
          orderWhereInput.push({
            ordered_at: { gte: value as Date },
          });
          break;
        }

        case 'orderCreatedAtLt': {
          if (!value) break;

          const targetDay = customDayjs(value as Date)
            .tz()
            .format('YYYY-MM-DD HH:mm:ss');

          whereQuery = Prisma.sql`${whereQuery} AND Ec_Order.ordered_at < ${targetDay}`;
          orderWhereInput.push({
            ordered_at: { lt: value as Date },
          });
          break;
        }
      }
    }

    const selectRes = await API.db.$queryRaw<
      Array<
        (typeof listItemWithEcOrder.response.items)[number]['item'] & {
          total_order_count: number;
          total_item_count: number;
          total_price: number;
        }
      > & {
        summary?: (typeof listItemWithEcOrder.response)['summary'];
      }
    >`
      SELECT
        Item.*,
        COUNT(DISTINCT Ec_Order.id) AS total_order_count,
        SUM(Ec_Order_Cart_Store_Product.item_count) AS total_item_count,
        SUM(Ec_Order_Cart_Store_Product.item_count * Ec_Order_Cart_Store_Product.total_unit_price) AS total_price
      FROM Item
      INNER JOIN Product ON Item.id = Product.item_id
      INNER JOIN Ec_Order_Cart_Store_Product ON Product.id = Ec_Order_Cart_Store_Product.product_id
      INNER JOIN Ec_Order_Cart_Store ON Ec_Order_Cart_Store_Product.order_id = Ec_Order_Cart_Store.order_id AND Ec_Order_Cart_Store_Product.store_id = Ec_Order_Cart_Store.store_id
      INNER JOIN Ec_Order ON Ec_Order_Cart_Store.order_id = Ec_Order.id
      WHERE
      ${whereQuery}
      GROUP BY Item.id
      ${API.orderByQueryRaw}
      ${API.limitQueryRaw}
    `;

    //合計件数取得
    let summary: typeof listItemWithEcOrder.response.summary = undefined;
    if (query.includesSummary) {
      const summaryInfo = await API.db.$queryRaw<
        Array<{
          totalCount: number;
          totalBuyPrice: number;
          totalSellPrice: number;
        }>
      >`
        SELECT
          COUNT(DISTINCT Item.id) AS totalCount,
          SUM(Ec_Order_Cart_Store_Product.item_count * Ec_Order_Cart_Store_Product.total_unit_price) AS totalSellPrice
        FROM Item
        INNER JOIN Product ON Item.id = Product.item_id
        INNER JOIN Ec_Order_Cart_Store_Product ON Product.id = Ec_Order_Cart_Store_Product.product_id
        INNER JOIN Ec_Order_Cart_Store ON Ec_Order_Cart_Store_Product.order_id = Ec_Order_Cart_Store.order_id AND Ec_Order_Cart_Store_Product.store_id = Ec_Order_Cart_Store.store_id
        INNER JOIN Ec_Order ON Ec_Order_Cart_Store.order_id = Ec_Order.id
        WHERE
        ${whereQuery}
        GROUP BY Item.id
        ${API.limitQueryRaw}
      `;
      summary = {
        totalCount: summaryInfo.reduce(
          (sum, item) => sum + Number(item.totalCount),
          0,
        ),
        totalSellPrice: summaryInfo.reduce(
          (sum, item) => sum + Number(item.totalSellPrice),
          0,
        ),
      };
    }

    // 整形処理
    const items: typeof listItemWithEcOrder.response.items = selectRes.map(
      (item) => ({
        item,
        item_id: item.id,
        ecOrderStats: {
          ecOrderCount: Number(item.total_order_count),
          ecOrderItemCount: Number(item.total_item_count),
          ecOrderTotalPrice: Number(item.total_price),
        },
      }),
    );

    if (query.includesEcOrders) {
      await Promise.all(
        items.map(async (entry) => {
          const cartProducts =
            await API.db.ec_Order_Cart_Store_Product.findMany({
              where: {
                product: {
                  item_id: entry.item_id,
                },
                order_store: {
                  order: {
                    AND: orderWhereInput,
                  },
                },
              },
              select: {
                item_count: true,
                total_unit_price: true,
                product: {
                  select: {
                    id: true,
                    condition_option: {
                      select: {
                        id: true,
                        display_name: true,
                      },
                    },
                  },
                },
                order_store: {
                  select: {
                    order: {
                      select: {
                        id: true,
                        ordered_at: true,
                      },
                    },
                  },
                },
              },
            });

          entry.ecOrderCartStoreProducts = cartProducts.map((p) => ({
            order_store: {
              order: {
                id: p.order_store.order.id,
                ordered_at: p.order_store.order.ordered_at,
              },
            },
            product: {
              id: p.product.id,
              condition_option: p.product.condition_option
                ? {
                    id: p.product.condition_option.id,
                    display_name: p.product.condition_option.display_name,
                  }
                : null,
            },
            item_count: p.item_count,
            total_unit_price: p.total_unit_price,
          }));
        }),
      );
    }

    return {
      items,
      summary,
    };
  },
);
