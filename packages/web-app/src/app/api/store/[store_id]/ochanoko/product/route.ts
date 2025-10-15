// おちゃのこ在庫作成用のCSV作成

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { createOchanokoProductCsvApi } from 'api-generator';
import { BackendCoreOchanokoService } from 'backend-core';

export const POST = BackendAPI.create(
  createOchanokoProductCsvApi,
  async (API, { body }) => {
    const ochanokoService = new BackendCoreOchanokoService();
    API.give(ochanokoService);

    //おちゃのこネットが有効なのか調べる
    try {
      await ochanokoService.grantToken();
    } catch (e) {
      throw new ApiError({
        status: 400,
        messageText: `このストアでおちゃのこは利用できません/していません`,
      });
    }

    const createZipRes = await ochanokoService.createProductCsvZip(
      body.productIds,
    );

    return {
      fileUrl: createZipRes.fileUrl,
      chunkCount: createZipRes.chunkCount,
    };
  },
);
