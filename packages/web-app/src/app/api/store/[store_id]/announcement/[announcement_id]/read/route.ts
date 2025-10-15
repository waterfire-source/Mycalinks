// POSお知らせの既読をつける

import { BackendAPI } from '@/api/backendApi/main';
import { readAnnouncementApi } from 'api-generator';

export const POST = BackendAPI.create(
  readAnnouncementApi,
  async (API, { params }) => {
    const { store_id } = params;

    //既読をつける
    const upsertRes = await API.db.announcement_Store.upsert({
      where: {
        announcement_id_store_id: {
          announcement_id: params.announcement_id,
          store_id,
        },
      },
      create: {
        announcement_id: params.announcement_id,
        store_id,
        read: true,
      },
      update: {
        read: true,
      },
    });

    return upsertRes;
  },
);
