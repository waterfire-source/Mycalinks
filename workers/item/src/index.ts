import { TaskManager } from 'backend-core';
import { createItemController } from './controllers/createItem/main';
import { addConditionOptionController } from './controllers/addConditionOption/main';
import { updateItemController } from './controllers/updateItem/main';
import { updateMycaItemController } from './controllers/updateMycaItem/main';

const taskManager = new TaskManager({
  targetWorker: 'item',
});

taskManager.subscribe({
  createItem: createItemController, //商品マスタ登録
  addConditionOption: addConditionOptionController, //状態選択肢追加
  updateItem: updateItemController, //商品マスタ更新
  updateMycaItem: updateMycaItemController, //myca商品マスタ更新
});
