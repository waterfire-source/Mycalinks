import { BackendAPI } from '@/api/backendApi/main';
import { getItemMarketPriceHistoryApi } from 'api-generator';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { customDayjs } from 'common';

/**
 * 相場価格更新履歴取得のやつ
 */
export const GET = BackendAPI.create(
  getItemMarketPriceHistoryApi,
  async (API) => {
    const mycaAppClient = new BackendApiMycaAppService(API);

    const updatedHistory =
      await mycaAppClient.core.item.getMarketPriceUpdateHistory();

    //タイムゾーンをつけていく
    updatedHistory.forEach((each) => {
      each.uploaded_at = customDayjs.tz(each.uploaded_at).toDate();
    });

    return {
      updatedHistory,
    };
  },
);
