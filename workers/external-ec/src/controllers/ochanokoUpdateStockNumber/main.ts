import {
  BackendCoreOchanokoService,
  TaskCallback,
  workerDefs,
} from 'backend-core';

//おちゃのこの在庫変動
export const ochanokoUpdateStockNumberController: TaskCallback<
  typeof workerDefs.externalEc.kinds.ochanokoUpdateStockNumber.body
> = async (task) => {
  const thisBody = task.body;

  const ochanokoService = new BackendCoreOchanokoService();
  task.give(ochanokoService);

  await ochanokoService.grantToken();

  //アップデートする
  const res = await ochanokoService.client.updateStockNumber(
    thisBody.map((t) => ({
      id: t.data.ochanoko_product_id,
      stock: t.data.stock_number,
    })),
  );

  console.log(res, 'おちゃのこの在庫変動');
};
