import { BackendAPI } from '@/api/backendApi/main';
import { updateAllStoreAppAdvertisementsApi } from 'api-generator';
import { BackendAppAdvertisementModel } from '@/api/backendApi/model/appAdvertisement';

//全ストアアプリ広告ステータス更新API
export const POST = BackendAPI.create(
  updateAllStoreAppAdvertisementsApi,
  async (API) => {
    const model = new BackendAppAdvertisementModel(API);
    await model.updateAllStoreAdvertisementStatus();
  },
);
