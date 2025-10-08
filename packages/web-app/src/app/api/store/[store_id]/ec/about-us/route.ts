//EC ショップについての登録
// ECのショップについてを編集

import { BackendAPI } from '@/api/backendApi/main';
import { ApiResponse, editEcAboutUsApi } from 'api-generator';

export const POST = BackendAPI.create(
  editEcAboutUsApi,
  async (API, { params, body }) => {
    const { store_id } = params;

    const {
      shop_pr,
      images,
      about_shipping,
      about_shipping_fee,
      cancel_policy,
      return_policy,
    } = body;

    const upsertRes = await API.db.ec_About_Us.upsert({
      where: {
        store_id,
      },
      create: {
        store_id,
        shop_pr,
        images,
        about_shipping,
        about_shipping_fee,
        cancel_policy,
        return_policy,
      },
      update: {
        shop_pr,
        images,
        about_shipping,
        about_shipping_fee,
        cancel_policy,
        return_policy,
      },
    });

    return upsertRes as ApiResponse<typeof editEcAboutUsApi>;
  },
);
