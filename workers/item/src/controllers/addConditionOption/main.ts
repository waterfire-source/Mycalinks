import { Item_Category_Condition_Option } from '@prisma/client';
import {
  BackendCoreError,
  BackendCoreItemService,
  TaskCallback,
  workerDefs,
} from 'backend-core';

//状態選択肢追加
export const addConditionOptionController: TaskCallback<
  typeof workerDefs.item.kinds.addConditionOption.body
> = async (task) => {
  //先に全ての商品マスタ情報を取得しておく
  const allItems = await task.db.item.findMany({
    where: {
      id: {
        in: task.body.map((e) => e.data.item_id),
      },
    },
    include: {
      category: true,
    },
  });

  await task.processItems(async (each) => {
    const thisItemInfo = allItems.find((e) => e.id === each.item_id);

    if (!thisItemInfo) {
      throw new BackendCoreError({
        internalMessage: '商品マスタが見つかりません',
      });
    }

    const thisItem = new BackendCoreItemService(thisItemInfo.id);
    task.give(thisItem);

    await thisItem.createProducts({
      specificConditionOptionId: each.condition_option_id,
      specificConditionOptions: [
        {
          id: each.condition_option_id,
        },
      ] as Array<Item_Category_Condition_Option>,
      specificItemInfo: thisItemInfo,
    });
  });
};
