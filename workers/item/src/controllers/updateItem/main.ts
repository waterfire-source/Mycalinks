import { BackendCoreItemService, TaskCallback, workerDefs } from 'backend-core';

//商品マスタ更新
export const updateItemController: TaskCallback<
  typeof workerDefs.item.kinds.updateItem.body
> = async (task) => {
  await task.processItems(async (each) => {
    const { id, ...updateData } = each;

    const thisItem = new BackendCoreItemService(id);
    task.give(thisItem);

    await thisItem.update(updateData);

    console.log('更新が完了');
  });
};
