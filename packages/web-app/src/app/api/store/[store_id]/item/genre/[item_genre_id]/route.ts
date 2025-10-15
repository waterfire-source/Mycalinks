import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { Prisma } from '@prisma/client';
import { updateItemGenreApi } from 'api-generator';
import { customDayjs } from 'common';

//ジャンル変更・削除
export const PUT = BackendAPI.create(
  updateItemGenreApi,
  async (API, { params, body }) => {
    const { store_id, item_genre_id } = params;

    const {
      display_name,
      hidden,
      auto_update,
      deleted, //ここでtrueを指定することで削除できる
      order_number,
    } = body;

    const currentInfo = await API.db.item_Genre.findUnique({
      where: {
        store_id,
        id: item_genre_id,
      },
    });

    if (!currentInfo) throw new ApiError('notExist');

    //変更できる部門なのか確認

    //自動生成の場合、削除はできない
    if (currentInfo.handle) {
      if (deleted)
        throw new ApiError(updateItemGenreApi.error.cantDeleteSystemGenre);
    } else {
      //自動生成以外だと、auto_updateにできない
      if (auto_update)
        throw new ApiError(updateItemGenreApi.error.cantAutoUpdateSystemGenre);
    }

    const updateData: Prisma.Item_GenreUpdateInput = {
      display_name,
      hidden,
      auto_update,
      deleted,
      order_number,
    };

    //論理削除を指定されていた場合、名前を変更する
    if (deleted) {
      updateData.display_name = `${
        currentInfo.display_name
      }_削除済み_${customDayjs().tz().format('YYYYMMDD')}`;
    }

    //更新していく
    const updateRes = await API.db.item_Genre.update({
      where: {
        id: currentInfo.id,
      },
      data: updateData,
    });

    //新旧を比較して処理を行う

    //auto_updateがtrueになってたら
    if (
      currentInfo.auto_update != updateRes.auto_update &&
      updateRes.auto_update == true
    ) {
      //ここでMycaデータベースとの同期処理を書く
      //全て登録する（非同期）
      // (async () => {
      //   //店のステータスを変える
      //   const thisStore = new BackendStoreModel(API);
      //   await thisStore.setStatusMessage(
      //     thisStore.rule.statusMessageDict.registerItemFromApp.doing,
      //   );
      //   try {
      //     //このdepartmentIdのアイテムを全てフェッチする
      //     const itemModel = new BackendApiItemService(API);
      //     const createItemQueryRes = await itemModel.core.createQueryFromMycaApp({
      //       genreId: updateRes.id,
      //     });
      //     const itemQueries = createItemQueryRes.itemQueries;
      //     const departmentModel = new BackendApiDepartmentService(API);
      //     const cardConditionInfo =
      //       await departmentModel.core.createFixedItemCategory(
      //         ItemCategoryHandle.CARD,
      //       );
      //     const boxConditionInfo =
      //       await departmentModel.core.createFixedItemCategory(
      //         ItemCategoryHandle.BOX,
      //       );
      //     //全て登録する
      //     for (const each of itemQueries) {
      //       await API.transaction(async (tx) => {
      //         const insertResult = await tx.item.create({
      //           data: {
      //             ...each,
      //             store: {
      //               connect: {
      //                 id: Number(store_id),
      //               },
      //             },
      //           },
      //         });
      //         const thisItem = new BackendApiItemService(API, insertResult.id);
      //         const isCard = cardConditionInfo.id == each.category.connect?.id;
      //         await thisItem.core.createProducts({
      //           specificItemInfo: insertResult,
      //           specificConditionOptions: isCard
      //             ? cardConditionInfo.condition_options
      //             : boxConditionInfo.condition_options,
      //         });
      //       });
      //     }
      //     await thisStore.setStatusMessage(
      //       thisStore.rule.statusMessageDict.registerItemFromApp.finished,
      //     );
      //   } catch (e) {
      //     console.log(e);
      //     await thisStore.setStatusMessage(
      //       thisStore.rule.statusMessageDict.registerItemFromApp.error,
      //     );
      //   }
      // })();
    }

    return updateRes;
  },
);
