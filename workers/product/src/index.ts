import { TaskManager } from 'backend-core';
import { updateProductController } from './controllers/updateProduct/main';
import { productStockingController } from './controllers/productStocking/main';

const taskManager = new TaskManager({
  targetWorker: 'product',
});

taskManager.subscribe({
  updateProduct: updateProductController, //在庫更新
  productStocking: productStockingController, //CSV仕入れ
});
