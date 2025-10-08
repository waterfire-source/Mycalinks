import { AdvertisementAPI } from '@/api/frontend/advertisement/api';
import { CustomError, customFetch, METHOD } from '@/api/implement';
import {
  AppAdvertisementVirtualStatus,
  createOrUpdateAppAdvertisementDef,
  getAppAdvertisementDef,
} from '@/app/api/store/[store_id]/app-advertisement/def';

export const advertisementImplement = () => {
  return {
    getAppAdvertisement: async (
      request: AdvertisementAPI['getAppAdvertisement']['request'],
    ): Promise<AdvertisementAPI['getAppAdvertisement']['response']> => {
      const params: typeof getAppAdvertisementDef.request.query = {
        id: request.id,
        virtualStatus: request.virtualStatus as AppAdvertisementVirtualStatus,
        kind: request.kind,
      };
      const res = await customFetch({
        method: METHOD.GET,
        url: `/api/store/${request.storeId}/app-advertisement`,
        params,
      })();
      if (res instanceof CustomError) throw res;
      return res;
    },

    createOrUpdateAppAdvertisement: async (
      request: AdvertisementAPI['createOrUpdateAppAdvertisement']['request'],
    ): Promise<
      AdvertisementAPI['createOrUpdateAppAdvertisement']['response']
    > => {
      const body: typeof createOrUpdateAppAdvertisementDef.request.body = {
        id: request.id,
        display_name: request.displayName,
        on_pause: request.onPause,
        asDraft: request.asDraft,
        kind: request.kind,
        start_at: request.startAt,
        end_at: request.endAt,
        thumbnail_image_url: request.thumbnailImageUrl,
        data_type: request.dataType,
        data_text: request.dataText,
        data_images: request.dataImages.map((image) => ({
          image_url: image.imageUrl,
        })),
      };
      const res = await customFetch({
        method: METHOD.POST,
        url: `/api/store/${request.storeId}/app-advertisement`,
        body,
      })();
      if (res instanceof CustomError) throw res;
      return res;
    },
    deleteAppAdvertisement: async (
      request: AdvertisementAPI['deleteAppAdvertisement']['request'],
    ): Promise<AdvertisementAPI['deleteAppAdvertisement']['response']> => {
      const res = await customFetch({
        method: METHOD.DELETE,
        url: `/api/store/${request.storeId}/app-advertisement/${request.appAdvertisementId}`,
      })();
      if (res instanceof CustomError) throw res;
      return res;
    },
  };
};
