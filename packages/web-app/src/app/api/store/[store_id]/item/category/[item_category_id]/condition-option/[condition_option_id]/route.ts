//状態選択肢削除機能はつかわなくなったためコメントアウト

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { deleteConditionOptionApi } from 'api-generator';

// //状態選択肢削除
export const DELETE = BackendAPI.create(
  deleteConditionOptionApi,
  async (API, { params }) => {
    const { store_id, item_category_id, condition_option_id } = params;

    //現在の情報を取得する
    const currentFromInfo =
      await API.db.item_Category_Condition_Option.findUnique({
        where: {
          item_category: {
            id: item_category_id,
            store_id,
          },
          id: condition_option_id,
          products: {
            //すべて論理削除されているか、在庫数が0じゃないといけない
            every: {
              OR: [
                {
                  stock_number: 0,
                },
                {
                  deleted: true,
                },
              ],
            },
          },
          deleted: false,
        },
      });

    if (!currentFromInfo)
      throw new ApiError(deleteConditionOptionApi.error.stillHasProducts);

    await API.transaction(async (tx) => {
      //状態選択肢を論理削除しつつ、紐づいている在庫も全て論理削除する
      await Promise.all([
        tx.item_Category_Condition_Option.update({
          where: {
            id: condition_option_id,
          },
          data: {
            deleted: true,
          },
        }),
        tx.product.updateMany({
          where: {
            condition_option_id,
            deleted: false,
          },
          data: {
            deleted: true,
          },
        }),
      ]);
    });
  },
);
