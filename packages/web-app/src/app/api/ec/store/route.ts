// ECを利用しているストアの一覧を取得する

import { BackendAPI } from '@/api/backendApi/main';
import { getEcStoreApi } from 'api-generator';

export const GET = BackendAPI.create(getEcStoreApi, async (API) => {
  const stores = await API.db.store.findMany({
    where: {
      is_active: true,
      mycalinks_ec_enabled: true,
    },
    select: {
      id: true,
      display_name: true,
    },
  });

  return {
    stores,
  };
});
