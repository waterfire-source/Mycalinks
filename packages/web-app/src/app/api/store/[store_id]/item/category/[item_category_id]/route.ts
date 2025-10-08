import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { deleteItemCategoryApi } from 'api-generator';
import { customDayjs } from 'common';

//商品種別削除
export const DELETE = BackendAPI.create(
  deleteItemCategoryApi,
  async (API, { params }) => {
    const { store_id, item_category_id } = params;

    //現在の情報を取得する
    const currentInfo = await API.db.item_Category.findUnique({
      where: {
        store_id,
        id: item_category_id,
        handle: null, //自動生成コンディションについては削除できないようにする
      },
    });

    if (!currentInfo) throw new ApiError('notExist');

    await API.transaction(async (tx) => {
      //このコンディションの選択肢がついている在庫は全て論理削除する
      await tx.product.updateMany({
        where: {
          store_id: Number(store_id),
          condition_option: {
            item_category_id,
          },
        },
        data: {
          deleted: true,
        },
      });

      //商品種別を論理削除する
      await tx.item_Category.update({
        where: {
          id: currentInfo.id,
        },
        data: {
          deleted: true,
          display_name: `${currentInfo.display_name}_削除済み_${customDayjs()
            .tz()
            .format('YYYYMMDD')}`,
        },
      });
    });
  },
);
