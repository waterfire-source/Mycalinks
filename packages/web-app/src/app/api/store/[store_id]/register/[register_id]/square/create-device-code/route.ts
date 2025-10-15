import { BackendAPI } from '@/api/backendApi/main';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiSquareService } from '@/api/backendApi/services/square/main';
import { createSquareTerminalDeviceCode } from '@/app/api/store/[store_id]/register/def';

// 端末コード発行
export const POST = BackendAPI.defineApi(
  createSquareTerminalDeviceCode,
  async (API, { params }) => {
    //このCorporationを取得
    const thisCorpInfo = API.resources.corporation;

    if (!thisCorpInfo) throw new ApiError('notExist');

    const squareService = new BackendApiSquareService(API);
    await squareService.grantToken();

    //ロケーションを取得する
    const locationId = API.resources.store?.square_location_id;

    if (!locationId)
      throw new ApiError({
        status: 400,
        messageText: 'この店舗はまだSquareのロケーションと紐づけられていません',
      });

    squareService.config.locationId = locationId;

    //端末コードを発行する
    const createRes = await squareService.createDeviceCode(params);

    return createRes;
  },
);
