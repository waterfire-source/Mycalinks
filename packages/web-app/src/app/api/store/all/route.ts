// 法人内の全ての店舗を取得

import { BackendAPI } from '@/api/backendApi/main';
import { getAllStoreApi } from 'api-generator';

export const GET = BackendAPI.create(getAllStoreApi, async (API) => {
  const selectRes = await API.db.store.findMany({
    where: {
      accounts: {
        every: {
          account: {
            linked_corporation_id: API.resources.corporation!.id,
          },
        },
      },
    },
    select: {
      id: true,
      display_name: true,
    },
  });

  return {
    stores: selectRes,
  };
});
