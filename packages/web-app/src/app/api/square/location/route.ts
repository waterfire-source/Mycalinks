//OAuth同意画面のURLを取得（state付き）

import { BackendAPI } from '@/api/backendApi/main';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiSquareService } from '@/api/backendApi/services/square/main';
import { getSquareLocationsApi } from 'api-generator';

// ロケーション取得
export const GET = BackendAPI.create(getSquareLocationsApi, async (API) => {
  //このCorporationを取得
  const thisCorpInfo = API.resources.corporation;

  if (!thisCorpInfo) throw new ApiError('notExist');

  const squareService = new BackendApiSquareService(API);
  await squareService.grantToken();

  const squareLocations = await squareService.getLocations();

  if (
    !squareLocations ||
    !squareLocations.locations ||
    !squareLocations.locations.length
  )
    return {
      locations: [],
    };

  //この法人の店舗リストを取得
  const allStores = await API.db.store.findMany({
    where: {
      square_location_id: {
        not: null,
      },
      accounts: {
        some: {
          account_id: Number(API.user?.id),
        },
      },
    },
    select: {
      id: true,
      square_location_id: true,
    },
  });

  const locations = squareLocations.locations
    .filter((e) => e.id)
    .map((l) => ({
      id: l.id!,
      name: l.name || '',
      createdAt: l.createdAt || '',
      pos_store_id:
        allStores.find((e) => e.square_location_id == l.id)?.id ?? null,
    }));

  return {
    locations,
  };
});
