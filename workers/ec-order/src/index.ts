import { TaskManager } from 'backend-core';
import { paymentTimeoutController } from './controllers/paymentTimeout/main';

const taskManager = new TaskManager({
  targetWorker: 'ecOrder',
});

taskManager.subscribe({
  paymentTimeout: paymentTimeoutController, //支払いタイムアウト
});
