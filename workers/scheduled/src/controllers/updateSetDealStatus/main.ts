import {
  BackendCoreSetDealService,
  TaskCallback,
  workerDefs,
} from 'backend-core';

//セット販売ステータス更新
export const updateSetDealStatusController: TaskCallback<
  typeof workerDefs.scheduled.kinds.updateSetDealStatus.body
> = async (task) => {
  const setDealService = new BackendCoreSetDealService();
  task.give(setDealService);

  await setDealService.updateStatus({});
};
