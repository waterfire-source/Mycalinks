//ECこのショップについて
// EC店舗の紹介文を取得

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { ApiResponse, getEcStoreAboutUsApi } from 'api-generator';

export const GET = BackendAPI.create(
  getEcStoreAboutUsApi,
  async (API, { params }) => {
    const { ec_store_id } = params;

    const aboutUsInfo = await API.db.ec_About_Us.findUnique({
      where: {
        store_id: ec_store_id,
      },
    });

    if (!aboutUsInfo) throw new ApiError('notExist');

    return aboutUsInfo as ApiResponse<typeof getEcStoreAboutUsApi>;
  },
);
