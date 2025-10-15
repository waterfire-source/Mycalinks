import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';

export const getConditionDisplayName = (
  product:
    | BackendItemAPI[0]['response']['200']['items'][number]['products'][number]
    | BackendProductAPI[0]['response']['200']['products'][0],
) => {
  if (product.is_special_price_product) {
    return '特価在庫';
  }
  if (product.specialty_id) {
    return `${product.specialty__display_name} (${product.condition_option_display_name})`;
  }
  return product.condition_option_display_name;
};
