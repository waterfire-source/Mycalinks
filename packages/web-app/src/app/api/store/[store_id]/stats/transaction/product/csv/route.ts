// 過去の取引の詳細をCSVで取得する（古物台帳）

import { BackendAPI } from '@/api/backendApi/main';
import { getTransactionStatsProductCsvApi } from 'api-generator';
import { customDayjs } from 'common';
import { BackendApiCsvService } from '@/api/backendApi/services/csv/main';
import { BackendApiFileService } from '@/api/backendApi/services/file/main';
import {
  Fact_Transaction_Product,
  SummaryTransactionKind,
  Transaction,
  TransactionKind,
  TransactionStatus,
} from '@prisma/client';

//一旦買取用
export const GET = BackendAPI.create(
  getTransactionStatsProductCsvApi,
  async (API, { params, query }) => {
    const { target_day_gte, target_day_lte, category_id, genre_id } = query;

    const startDay = customDayjs(target_day_gte).tz().format('YYYY-MM-DD');
    const endDay = customDayjs(target_day_lte).tz().format('YYYY-MM-DD');

    // 統一WHERE句構築用のヘルパー関数
    const buildWhereClause = (options: {
      storeId: string | number;
      storeField: string;
      dateField?: string;
      startDate?: string;
      endDate?: string;
      singleDate?: string;
      categoryField: string;
      genreField: string;
      categoryId?: string | number;
      genreId?: string | number;
      additionalConditions?: string[];
    }): string => {
      const {
        storeId,
        storeField,
        dateField,
        startDate,
        endDate,
        singleDate,
        categoryField,
        genreField,
        categoryId,
        genreId,
        additionalConditions = [],
      } = options;

      let whereClause = `WHERE ${storeField} = ${storeId}`;

      // 日付条件
      if (dateField) {
        if (singleDate) {
          whereClause += ` AND DATE(${dateField}) = DATE('${singleDate}')`;
        } else if (startDate && endDate) {
          whereClause += ` AND DATE(${dateField}) >= DATE('${startDate}')`;
          whereClause += ` AND DATE(${dateField}) <= DATE('${endDate}')`;
        }
      }

      // 追加条件
      additionalConditions.forEach((condition) => {
        whereClause += ` AND ${condition}`;
      });

      // カテゴリ・ジャンル条件
      if (categoryId && genreId) {
        whereClause += ` AND ${categoryField} = ${categoryId} AND ${genreField} = ${genreId}`;
      } else if (categoryId) {
        whereClause += ` AND ${categoryField} = ${categoryId}`;
      } else if (genreId) {
        whereClause += ` AND ${genreField} = ${genreId}`;
      }

      return whereClause;
    };

    //dwhのfactレコードから取得していく
    const historyWhereClause = buildWhereClause({
      storeId: params.store_id,
      storeField: 'tf.store_id',
      dateField: 'tf.target_day',
      startDate: startDay,
      endDate: endDay,
      categoryField: 'tf.category_id',
      genreField: 'tf.genre_id',
      categoryId: category_id,
      genreId: genre_id,
    });

    let selectRes = await API.db.$queryRawUnsafe<
      {
        finished_at: Transaction['finished_at'];
        transaction_id: Fact_Transaction_Product['transaction_id'];
        transaction_kind: Fact_Transaction_Product['transaction_kind'];
        product_display_name: Fact_Transaction_Product['product_display_name'];
        expansion: Fact_Transaction_Product['expansion'];
        cardnumber: Fact_Transaction_Product['cardnumber'];
        rarity: Fact_Transaction_Product['rarity'];
        condition_option_display_name: Fact_Transaction_Product['condition_option_display_name'];
        item_count: Fact_Transaction_Product['item_count'];
        total_unit_price: Fact_Transaction_Product['total_unit_price'];
        wholesale_total_price: Fact_Transaction_Product['wholesale_total_price'];
        genre_display_name: Fact_Transaction_Product['genre_display_name'];
        category_display_name: Fact_Transaction_Product['category_display_name'];
      }[]
    >(`
    SELECT
      Transaction.finished_at,
      tf.transaction_id,
      tf.transaction_kind,
      tf.product_display_name,
      tf.expansion,
      tf.cardnumber,
      tf.rarity,
      tf.condition_option_display_name,
      tf.item_count,
      tf.total_unit_price,
      tf.wholesale_total_price,
      tf.genre_display_name,
      tf.category_display_name
    FROM Fact_Transaction_Product tf
    INNER JOIN Transaction ON Transaction.id = tf.transaction_id
    ${historyWhereClause}
    ORDER BY Transaction.finished_at ASC
    `);

    //今日も入ってたら今日の分を追加
    const includesToday =
      customDayjs(target_day_lte).tz().startOf('day').unix() >=
      customDayjs().tz().startOf('day').unix();

    if (includesToday) {
      const todayWhereClause = buildWhereClause({
        storeId: params.store_id,
        storeField: 'Transaction.store_id',
        dateField: 'Transaction.finished_at',
        singleDate: endDay,
        categoryField: 'Item.category_id',
        genreField: 'Item.genre_id',
        categoryId: category_id,
        genreId: genre_id,
        additionalConditions: [
          `Transaction.status = '${TransactionStatus.completed}'`,
        ],
      });

      const todayRes = await API.db.$queryRawUnsafe<typeof selectRes>(`
      SELECT
        Transaction.finished_at,
        tc.transaction_id,
        CASE WHEN Transaction.transaction_kind = '${TransactionKind.sell}' THEN '${SummaryTransactionKind.SELL}' ELSE '${SummaryTransactionKind.BUY}' END AS transaction_kind,
        Product.display_name AS product_display_name,
        Item.expansion,
        Item.cardnumber,
        Item.rarity,
        Item_Category_Condition_Option.display_name AS condition_option_display_name,
        CASE WHEN Transaction.is_return THEN -1 * tc.item_count ELSE tc.item_count END AS item_count,
        tc.total_unit_price,
        tc.wholesale_total_price,
        Item_Genre.display_name AS genre_display_name,
        Item_Category.display_name AS category_display_name
      FROM Transaction_Cart tc
      INNER JOIN Transaction ON Transaction.id = tc.transaction_id
      INNER JOIN Product ON Product.id = tc.product_id
      INNER JOIN Item ON Item.id = Product.item_id
      LEFT JOIN Item_Category_Condition_Option ON Item_Category_Condition_Option.id = Product.condition_option_id
      LEFT JOIN Item_Genre ON Item_Genre.id = Item.genre_id
      LEFT JOIN Item_Category ON Item_Category.id = Item.category_id
      ${todayWhereClause}
      ORDER BY Transaction.finished_at ASC
      `);

      selectRes = [...selectRes, ...todayRes];
    }

    // const

    // if (includesToday) {
    //   const todayRes = await API.db.$queryRaw<
    //     {
    //       finished_at: Transaction['finished_at'];
    //     }[]
    //   >`
    // }

    //一つずつラベリングしていく
    const transactionProducts = selectRes.map((p) => {
      return {
        取引日時: customDayjs(p.finished_at).tz().format('YYYY/MM/DD HH:mm:ss'),
        取引ID: p.transaction_id,
        取引種類:
          p.transaction_kind === SummaryTransactionKind.SELL ? '販売' : '買取',
        商品名: p.product_display_name,
        'エキスパンション+型番': `${p.expansion ?? ''} ${p.cardnumber ?? ''}`,
        レアリティ: p.rarity,
        状態: p.condition_option_display_name,
        取引点数: p.item_count,
        取引金額: p.item_count * p.total_unit_price!,
        仕入れ値: p.wholesale_total_price,
        ジャンル: p.genre_display_name,
        カテゴリ: p.category_display_name,
      };
    });

    const csvService = new BackendApiCsvService(API);
    const fileService = new BackendApiFileService(API);

    const uploadRes = await fileService.uploadCsvToS3({
      dirKind: 'transaction',
      writer: async (passThrough) => {
        csvService.core.passThrough = passThrough;

        //@ts-expect-error テンプレート管理外
        await csvService.core.maker(transactionProducts);
      },
    });

    return {
      fileUrl: uploadRes,
    };
  },
);
