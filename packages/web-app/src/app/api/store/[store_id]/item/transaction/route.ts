import { BackendAPI } from '@/api/backendApi/main';
import { Item, Prisma, Transaction, TransactionStatus } from '@prisma/client';
import { ApiResponse, listItemWithTransactionApi } from 'api-generator';
import { customDayjs } from 'common';

//商品マスタベースで取引の統計情報を取得したい時のAPI
export const GET = BackendAPI.create(
  listItemWithTransactionApi,
  async (API, { params, query }) => {
    let whereQuery: Prisma.Sql = Prisma.sql`Transaction.status = ${TransactionStatus.completed} AND Transaction.store_id = ${params.store_id}`;
    const transactionWhereInput: Array<Prisma.TransactionWhereInput> = [
      {
        status: TransactionStatus.completed,
        store_id: params.store_id,
      },
    ];

    let tagJoinQuery: Prisma.Sql = Prisma.sql``;

    //クエリパラメータを見ていく
    for (const prop in query) {
      const key = prop as keyof typeof query;
      const value = query[key];

      switch (key) {
        case 'transaction_kind':
          whereQuery = Prisma.sql`
          ${whereQuery} AND Transaction.transaction_kind = ${value}
          `;
          break;

        case 'item_id':
          whereQuery = Prisma.sql`
          ${whereQuery} AND Item.id = ${value}
          `;
          break;

        case 'customer_id':
          whereQuery = Prisma.sql`
          ${whereQuery} AND Transaction.customer_id = ${value}
          `;

          transactionWhereInput.push({
            customer_id: Number(value),
          });
          break;

        case 'display_name':
        case 'rarity':
        case 'cardnumber': {
          if (!query[key]) break;
          const fieldQuery = Prisma.sql([key]);

          whereQuery = Prisma.sql`
          ${whereQuery} AND Item.${fieldQuery} LIKE ${`%${value}%`}
          `;
          break;
        }
        case 'expansion': {
          if (!query[key]) break;
          const fieldQuery = Prisma.sql([key]);

          whereQuery = Prisma.sql`
          ${whereQuery} AND Item.${fieldQuery} LIKE ${`%${value}%`}
          `;
          break;
        }

        case 'genre_id':
          if (!query[key]) break;

          whereQuery = Prisma.sql`
          ${whereQuery} AND Item.genre_id = ${query[key]}
          `;
          break;

        case 'category_id':
          if (!query[key]) break;

          whereQuery = Prisma.sql`
          ${whereQuery} AND Item.category_id = ${query[key]}
          `;
          break;

        // case 'productsTagName':
        //   if (!query[key]) break;

        //   tagJoinQuery = Prisma.sql`
        //   INNER JOIN Product_Tag ON Product.id = Product_Tag.product_id
        //   INNER JOIN Tag ON Product_Tag.tag_id = Tag.id
        //   `;

        //   whereQuery = Prisma.sql`
        //   ${whereQuery} AND Tag.display_name = ${query[key]}
        //   `;
        //   break;

        case 'transactionFinishedAtGte': {
          const targetDay = customDayjs(value as Date)
            .tz()
            .format('YYYY-MM-DD HH:mm:ss');

          whereQuery = Prisma.sql`
            ${whereQuery} AND Transaction.finished_at >= ${targetDay}
            `;

          transactionWhereInput.push({
            finished_at: {
              gte: query[key],
            },
          });
          break;
        }

        case 'transactionFinishedAtLt': {
          const targetDay = customDayjs(value as Date)
            .tz()
            .format('YYYY-MM-DD HH:mm:ss');

          whereQuery = Prisma.sql`
            ${whereQuery} AND Transaction.finished_at < ${targetDay}
            `;

          transactionWhereInput.push({
            finished_at: {
              lt: query[key],
            },
          });
          break;
        }
      }
    }

    const selectRes = await API.db.$queryRaw<
      Array<
        Item & {
          transaction_id: Transaction['id'];
          transaction_kind: Transaction['transaction_kind'];
          transactionCount: number;
          transactionTotalPrice: number;
          transactionProductsCount: number;
        }
      >
    >`
    SELECT
      Item.*,
      Transaction.id AS transaction_id,
      Transaction.transaction_kind AS transaction_kind,
      SUM(
        CASE WHEN Transaction.is_return = 0 THEN 1 ELSE 0 END
      ) AS transactionCount,
      SUM(
       (CASE WHEN Transaction.is_return = 0 THEN 1 ELSE -1 END) * Transaction_Cart.total_unit_price * Transaction_Cart.item_count
      ) AS transactionTotalPrice,
      SUM(
        (CASE WHEN Transaction.is_return = 0 THEN 1 ELSE -1 END) * Transaction_Cart.item_count
      ) AS transactionProductsCount
    FROM Item
    INNER JOIN Product ON Item.id = Product.item_id
    INNER JOIN Transaction_Cart ON Product.id = Transaction_Cart.product_id
    INNER JOIN Transaction ON Transaction_Cart.transaction_id = Transaction.id
    ${tagJoinQuery}
    WHERE
    ${whereQuery}
    GROUP BY Item.id,Transaction.transaction_kind
    ${API.orderByQueryRaw}
    ${API.limitQueryRaw}
    `;

    //合計件数取得
    let summary: ApiResponse<typeof listItemWithTransactionApi>['summary'] =
      undefined;
    if (query.includesSummary) {
      const summaryInfo = await API.db.$queryRaw<
        Array<{
          totalCount: number;
          totalBuyPrice: number;
          totalSellPrice: number;
        }>
      >`
        SELECT
          COUNT(DISTINCT Item.id, Transaction.transaction_kind) AS totalCount,
          SUM(CASE WHEN Transaction.transaction_kind = 'sell' THEN
           (CASE WHEN Transaction.is_return = 0 THEN 1 ELSE -1 END) * Transaction_Cart.total_unit_price * Transaction_Cart.item_count ELSE 0 END
          ) AS totalSellPrice,
          SUM(CASE WHEN Transaction.transaction_kind = 'buy' THEN
           (CASE WHEN Transaction.is_return = 0 THEN 1 ELSE -1 END) * Transaction_Cart.total_unit_price * Transaction_Cart.item_count ELSE 0 END
          ) AS totalBuyPrice
        FROM Item
        INNER JOIN Product ON Item.id = Product.item_id
        INNER JOIN Transaction_Cart ON Product.id = Transaction_Cart.product_id
        INNER JOIN Transaction ON Transaction_Cart.transaction_id = Transaction.id
        ${tagJoinQuery}
        WHERE
        ${whereQuery}`;

      summary = {
        totalCount: Number(summaryInfo[0].totalCount),
        totalBuyPrice: Number(summaryInfo[0].totalBuyPrice),
        totalSellPrice: Number(summaryInfo[0].totalSellPrice),
      };
    }

    //整形していく
    const items: ApiResponse<typeof listItemWithTransactionApi>['items'] =
      selectRes.map((item) => ({
        item: {
          ...item,
          transaction_id: undefined,
          transaction_kind: undefined,
          transactionCount: undefined,
          transactionTotalPrice: undefined,
          transactionProductsCount: undefined,
        },
        item_id: item.id,
        transaction_kind: item.transaction_kind,
        transactionStats: {
          transactionCount: Number(item.transactionCount),
          transactionTotalPrice: Number(item.transactionTotalPrice),
          transactionProductsCount: Number(item.transactionProductsCount),
        },
      }));

    //includesTransactions
    if (query.includesTransactions) {
      await Promise.all(
        items.map(async (item) => {
          //この商品マスタ、取引種類で取引カート一覧を取得していく
          const transactionCarts = await API.db.transaction_Cart.findMany({
            where: {
              transaction: {
                AND: transactionWhereInput,
                transaction_kind: item.transaction_kind,
                is_return: false,
              },
              product: {
                item_id: item.item_id,
              },
            },
            select: {
              item_count: true,
              total_unit_price: true,
              total_discount_price: true,
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
              transaction: {
                select: {
                  id: true,
                  finished_at: true,
                  payment_method: true,
                },
              },
            },
          });

          item.transactions = transactionCarts;
        }),
      );
    }

    return {
      items,
      summary,
    };
  },
);
