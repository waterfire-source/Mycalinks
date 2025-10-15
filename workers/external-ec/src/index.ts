import { TaskManager } from 'backend-core';
import { ochanokoOrderController } from './controllers/ochanokoOrder/main';
import { ochanokoUpdatePriceController } from './controllers/ochanokoUpdatePrice/main';
import { ochanokoUpdateStockNumberController } from './controllers/ochanokoUpdateStockNumber/main';
import { shopifyOrderController } from './controllers/shopifyOrder/main';
import { shopifyUpdateStockNumberController } from './controllers/shopifyUpdateStockNumber/main';
import { shopifyUpdatePriceController } from './controllers/shopifyUpdatePrice/main';

const taskManager = new TaskManager({
  targetWorker: 'externalEc',
});

taskManager.subscribe({
  ochanokoOrder: ochanokoOrderController,
  ochanokoUpdateStockNumber: ochanokoUpdateStockNumberController,
  ochanokoUpdatePrice: ochanokoUpdatePriceController,
  shopifyOrder: shopifyOrderController,
  shopifyUpdateStockNumber: shopifyUpdateStockNumberController,
  shopifyUpdatePrice: shopifyUpdatePriceController,
});
