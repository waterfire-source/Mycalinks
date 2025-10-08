//EC全出品

import { BackendAPI } from '@/api/backendApi/main';
import { ApiError } from '@/api/backendApi/error/apiError';
import { publishAllProductsToEcApi } from 'api-generator';
import { ItemTask, TaskManager } from 'backend-core';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';

//全出品
export const POST = BackendAPI.create(
  publishAllProductsToEcApi,
  async (API, { params }) => {
    //一応EC設定が有効になっているか確認
    if (!API.resources.store!.ec_setting)
      throw new ApiError({
        status: 500,
        messageText: 'EC設定が入っていません',
      });

    //対象在庫を全て取得

    //一旦アクティブ商品だけ
    const allTargetProducts = await API.db.product.findManyExists({
      where: {
        store_id: params.store_id,
        is_active: true,
      },
      select: {
        id: true,
        stock_number: true,
        pos_reserved_stock_number: true,
        ec_stock_number: true,
      },
    });

    //タスクを作っていく
    const tasks: ItemTask.UpdateProductData[] = [];

    for (const product of allTargetProducts) {
      const thisTask: ItemTask.UpdateProductData = {
        id: product.id,
      };

      thisTask.mycalinks_ec_enabled = true;

      //[TODO] 他のECも

      //出品できる最大の在庫数を確認
      const productService = new BackendApiProductService(API, product.id);
      const ecStockNumberMargin =
        productService.core.checkEcStockNumberIsValid(product);

      //出品できる個数があるならフル出品をかける
      if (ecStockNumberMargin > 0) {
        thisTask.ecPublishToMaximum = true;
      }

      tasks.push(thisTask);
    }

    //タスクを送信
    if (tasks.length) {
      const taskManager = new TaskManager({
        targetWorker: 'product',
        kind: 'updateProduct',
      });

      await taskManager.publish({
        body: tasks,
        service: API,
        processDescription: 'すべての商品を出品します',
      });
    }

    return { ok: 'すべての商品を出品するリクエストを送信しました' };
  },
);
