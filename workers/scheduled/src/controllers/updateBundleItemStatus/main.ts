import { BackendCoreItemService, TaskCallback, workerDefs } from 'backend-core';

//バンドル商品ステータス更新
export const updateBundleItemStatusController: TaskCallback<
  typeof workerDefs.scheduled.kinds.updateBundleItemStatus.body
> = async (task) => {
  const itemService = new BackendCoreItemService();
  task.give(itemService);

  await itemService.bundle.updateStatus({});
};
