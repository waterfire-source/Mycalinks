//OAuth同意画面のURLを取得（state付き）

import { BackendAPI } from '@/api/backendApi/main';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiSquareService } from '@/api/backendApi/services/square/main';
import { getSquareOAuthUrlApi } from 'api-generator';

// 同意画面URL取得
export const GET = BackendAPI.create(
  getSquareOAuthUrlApi,
  async (API, { query }) => {
    //このCorporationを取得
    const thisCorpInfo = API.resources.corporation;

    const { succeedCallbackUrl, failedCallbackUrl } = query;

    if (!thisCorpInfo) throw new ApiError('notExist');

    //すでにsquare_availableになっていた場合、エラー
    if (thisCorpInfo.square_available)
      throw new ApiError(getSquareOAuthUrlApi.error.alreadyAvailable);

    //発行する
    const squareClient = new BackendApiSquareService(API);
    const authUrlInfo = squareClient.generateOAuthUrl();

    //stateクッキーをセット
    API.setCookies.push({
      key: BackendApiSquareService.config.oAuthStateKey,
      value: authUrlInfo.state,
      expire: Date.now() + 300000,
    });

    if (succeedCallbackUrl) {
      API.setCookies.push({
        key: BackendApiSquareService.config.succeedCallbackUrl,
        value: succeedCallbackUrl,
        expire: Date.now() + 300000,
      });
    }

    if (failedCallbackUrl) {
      API.setCookies.push({
        key: BackendApiSquareService.config.failedCallbackUrl,
        value: failedCallbackUrl,
        expire: Date.now() + 300000,
      });
    }

    return {
      url: authUrlInfo.url,
    };
  },
);
