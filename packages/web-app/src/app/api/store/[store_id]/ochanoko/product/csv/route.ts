//おちゃのこの管理画面から出力したCSVをインポートする

import { apiRole, BackendAPI, ResponseMsgKind } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { TaskSourceKind } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiFileService } from '@/api/backendApi/services/file/main';
import { BackendApiCsvService } from '@/api/backendApi/services/csv/main';
import { ItemTask, TaskManager } from 'backend-core';

//商品マスタ関連のCSVの処理
export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const fileService = new BackendApiFileService(API);
    const fileData = fileService.getFileData('file');

    if (!fileData || fileData.extension != '.csv')
      return API.status(400).response({
        msgContent: ResponseMsgKind.notEnoughData,
      });

    const { store_id } = API.params;

    //CSVの内容をシンプルにパースする
    const csvService = new BackendApiCsvService(API);
    const parsed = csvService.readFile('file');

    const updateProductTasks: Array<ItemTask.UpdateProductData> = [];

    for (const row of parsed) {
      const ochanokoProductId = Number(row[0]);
      const posProductId = Number(row[2]);

      if (!ochanokoProductId || !posProductId) {
        continue;
      }

      //存在確認
      const posProductInfo = await API.db.product.findUnique({
        where: {
          store_id: Number(store_id),
          id: posProductId,
          deleted: false,
        },
      });

      if (!posProductInfo) {
        throw new ApiError({
          status: 400,
          messageText: `存在しない在庫: ${posProductId} を指定しています`,
        });
      }

      updateProductTasks.push({
        id: posProductInfo.id,
        ochanoko_product_id: ochanokoProductId,
        ochanoko_ec_enabled: true,
      });
    }

    if (updateProductTasks.length > 0) {
      const taskManager = new TaskManager({
        targetWorker: 'product',
        kind: 'updateProduct',
      });

      await taskManager.publish({
        body: updateProductTasks,
        service: API,
        source: TaskSourceKind.API,
        processDescription: 'おちゃのこのCSVをインポートします',
      });
    }

    return API.status(200).response({
      msgContent: '処理が開始されました',
    });
  },
);
