import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiDepartmentService } from '@/api/backendApi/services/department/main';
import { BackendApiItemService } from '@/api/backendApi/services/item/main';
import { ItemCategoryHandle, TaskSourceKind } from '@prisma/client';
import { importAllItemsFromAppByGenreApi } from 'api-generator';
import { TaskManager, workerDefs } from 'backend-core';

//指定ジャンルのアイテムをアプリの方からインポートしてくる
export const POST = BackendAPI.create(
  importAllItemsFromAppByGenreApi,
  async (API, { params, body }) => {
    const { store_id, item_genre_id } = params;
    const { targetCategoryHandles } = body;

    let displaytypeQuery: Record<string, string> = {};

    //CARD / BOX のみ受け付ける
    if (targetCategoryHandles) {
      if (
        !targetCategoryHandles.every((h) =>
          (
            [
              ItemCategoryHandle.CARD,
              ItemCategoryHandle.BOX,
            ] as ItemCategoryHandle[]
          ).includes(h!),
        )
      )
        throw new ApiError({
          status: 400,
          messageText: 'CARDかBOXのどちらかを指定してください',
        });

      //2つ指定か0だったら全てのカテゴリを対象にする
      if (targetCategoryHandles.length === 1) {
        if (targetCategoryHandles[0] === ItemCategoryHandle.CARD) {
          displaytypeQuery = { displaytype1: '%カード%' };
        } else if (targetCategoryHandles[0] === ItemCategoryHandle.BOX) {
          displaytypeQuery = { displaytype1: '%ボックス%' };
        }
      }
    }

    const currentInfo = await API.db.item_Genre.findUnique({
      where: {
        store_id,
        id: item_genre_id,
        handle: {
          //アプリのジャンルのみ受け付ける
          not: null,
        },
      },
    });

    if (!currentInfo) throw new ApiError('notExist');

    const departmentModel = new BackendApiDepartmentService(API);

    //このdepartmentIdのアイテムを全てフェッチする
    const itemModel = new BackendApiItemService(API);
    const createItemQueryRes = await itemModel.core.createQueryFromMycaApp({
      genreId: params.item_genre_id,
      props: {
        ...displaytypeQuery,
      },
    });
    const itemQueries = createItemQueryRes.itemQueries;

    //タスクをプッシュする
    const taskManager = new TaskManager({
      targetWorker: 'item',
      kind: 'createItem',
    });

    await taskManager.publish<typeof workerDefs.item.kinds.createItem.body>({
      body: itemQueries,
      service: API,
      source: TaskSourceKind.API,
      metadata: [
        {
          kind: 'genreInfo',
          genreId: currentInfo.id,
          genreName: currentInfo.display_name,
        },
      ],
      processDescription: `ジャンル:${currentInfo.display_name} のアイテムをMycalinksアプリから全てインポートします`,
    });
  },
);
