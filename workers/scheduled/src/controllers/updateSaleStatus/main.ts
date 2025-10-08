import { BackendCoreSaleService, TaskCallback, workerDefs } from 'backend-core';

//セールステータス更新
export const updateSaleStatusController: TaskCallback<
  typeof workerDefs.scheduled.kinds.updateSaleStatus.body
> = async (task) => {
  const saleService = new BackendCoreSaleService();
  task.give(saleService);

  await saleService.updateStatus({});
};
