import {
  BackendCoreOchanokoService,
  TaskCallback,
  TaskManager,
} from 'backend-core';
import { workerDefs } from 'backend-core';

//おちゃのこの価格変動
export const ochanokoUpdatePriceController: TaskCallback<
  typeof workerDefs.externalEc.kinds.ochanokoUpdatePrice.body
> = async (task) => {
  const thisBody = task.body;

  const ochanokoService = new BackendCoreOchanokoService();
  task.give(ochanokoService);

  await ochanokoService.grantToken();

  //アップデートする
  const res = await ochanokoService.client.updatePrice(
    thisBody.map((t) => ({
      id: t.data.ochanoko_product_id,
      price: t.data.price,
    })),
  );

  console.log(res, 'おちゃのこの価格変動');
};
