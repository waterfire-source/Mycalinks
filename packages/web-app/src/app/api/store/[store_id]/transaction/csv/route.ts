import { BackendAPI } from '@/api/backendApi/main';

import { mycaPosCommonConstants } from '@/constants/mycapos';
import { BackendApiFileService } from '@/api/backendApi/services/file/main';
import { BackendApiCsvService } from '@/api/backendApi/services/csv/main';
import { BackendApiTransactionService } from '@/api/backendApi/services/transaction/main';
import { customDayjs } from 'common';
import { getTransactionCsvApi } from 'api-generator';
const { displayNameDict: displayNameDictRow } = mycaPosCommonConstants;

//在庫一覧のCSVをダウンロードする
export const GET = BackendAPI.create(
  getTransactionCsvApi,
  async (API, { params, query }) => {
    const { target_day_gte, target_day_lte, transaction_types } = query;

    const csvService = new BackendApiCsvService(API);
    const fileService = new BackendApiFileService(API);
    const transactionModel = new BackendApiTransactionService(API);

    //ストリーミング書き出しを実施
    const uploadRes = await fileService.uploadCsvToS3({
      dirKind: 'transaction',
      writer: async (passThrough) => {
        csvService.core.passThrough = passThrough;
        const chunkSize = 500;
        let skip = 0;
        let hasMore = true;

        while (hasMore) {
          // transaction_typesパラメータに基づくフィルタ条件を構築
          let whereCondition: any = {
            store_id: params.store_id,
            status: 'completed',
            finished_at: {
              gte: customDayjs(target_day_gte).utc().toDate(),
              lte: customDayjs(target_day_lte).utc().toDate(),
            },
          };

          if (transaction_types) {
            if (transaction_types === 'sell') {
              whereCondition.transaction_kind = 'sell';
              whereCondition.is_return = false;
            } else if (transaction_types === 'buy') {
              whereCondition.transaction_kind = 'buy';
              whereCondition.is_return = false;
            } else if (transaction_types === 'return') {
              whereCondition.is_return = true;
            }
            // 'all'の場合は追加の条件なし
          }

          const allTransactionsRaw = await API.db.transaction.findMany({
            where: whereCondition,
            select: {
              id: true,
              transaction_kind: true,
              total_price: true,
              payment_method: true,
              finished_at: true,
              original_transaction_id: true,
              point_discount_price: true,
              point_amount: true,
              is_return: true,
              return_transactions: true,
            },
            orderBy: {
              finished_at: 'desc',
            },
            take: chunkSize,
            skip,
          });

          skip += chunkSize;
          if (allTransactionsRaw.length < chunkSize) {
            hasMore = false;
          }

          const displayNameDict: Record<string, string> = {};

          for (const prop in displayNameDictRow.transaction) {
            //取得したカラムのうちcsvに含めないものを指定
            if (prop !== 'status' && prop !== 'return_transactions') {
              const item =
                displayNameDictRow.transaction[
                  prop as keyof typeof displayNameDictRow.transaction
                ];
              if (item && typeof item === 'object' && 'label' in item) {
                displayNameDict[prop] = item.label;
              }
            }
          }

          //CSVファイルを作成
          await csvService.core.maker(
            allTransactionsRaw.map((t) => {
              const jaData = transactionModel.core.toJa(t);
              return jaData;
            }) as Array<typeof csvService.core.dataRecord>,
            false,
            displayNameDict,
          );

          console.log(`${allTransactionsRaw.length}件のデータを書き出しました`);
        }
      },
    });

    return { data: { fileUrl: uploadRes } };
  },
);
