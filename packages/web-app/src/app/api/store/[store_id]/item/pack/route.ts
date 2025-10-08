import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiItemService } from '@/api/backendApi/services/item/main';
import { createAllItemsFromPackDef } from '@/app/api/store/[store_id]/item/def';
import { TaskSourceKind } from '@prisma/client';
import { TaskManager, workerDefs } from 'backend-core';

//バンドル商品マスタを登録するAPI
export const POST = BackendAPI.defineApi(
  createAllItemsFromPackDef,
  async (API, { body }) => {
    const { myca_pack_id } = body;

    //このパックが存在するか調べる
    const itemService = new BackendApiItemService(API);
    const { itemQueries, thisPackInfo } =
      await itemService.core.getPackItemQuery(myca_pack_id);

    //アイテムクエリがからの場合はエラー
    if (!itemQueries.length)
      throw new ApiError({
        status: 400,
        messageText: `すでにこのボックス内の全てのカードが登録されています`,
      });

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
          kind: 'packInfo',
          mycaPackId: myca_pack_id,
          mycaPackName: thisPackInfo[0].pack ?? '不明',
        },
      ],
      processDescription: `パック:${thisPackInfo[0].pack} の商品を登録します`,
    });
  },
);
