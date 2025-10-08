import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';

export interface ProductItem {
  id: number;
  imageUrl?: string | null;
  displayName: string | null;
  packName?: string | null;
  expansion?: string | null;
  rarity?: string | null;
  cardnumber?: string | null;
  products: BackendItemAPI[0]['response']['200']['items'][0]['products'];
}

export const formatApiResponseToProductItem = (
  apiData: BackendItemAPI[0]['response']['200']['items'][0],
): ProductItem => {
  return {
    id: apiData.id,
    imageUrl: apiData.image_url || null,
    displayName: apiData.display_name || null,
    packName: apiData.pack_name || null,
    expansion: apiData.expansion || null,
    rarity: apiData.rarity || null,
    cardnumber: apiData.cardnumber || null,
    products: apiData.products.map((product) => ({
      ...product,
    })),
  };
};
