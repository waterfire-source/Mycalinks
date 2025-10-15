import { useStore } from '@/contexts/StoreContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { useCallback, useState } from 'react';
import { CustomArrivalProductSearchType } from '@/app/auth/(dashboard)/arrival/register/page';
import { BackendStockingAPI } from '@/app/api/store/[store_id]/stocking/api';
import { useAlert } from '@/contexts/AlertContext';
import { v4 as uuidv4 } from 'uuid';

export const useFetchProducts = () => {
  const { store } = useStore();
  const clientAPI = createClientAPI();
  const { setAlertState } = useAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 商品情報
  const [products, setProducts] = useState<CustomArrivalProductSearchType[]>(
    [],
  );

  const fetchProducts = useCallback(
    async (foundStocking: BackendStockingAPI[5]['response']['200'][number]) => {
      setIsLoading(true);

      const productIds = foundStocking.stocking_products.map(
        (product) => product.product_id,
      );

      const res = await clientAPI.product.listProducts({
        storeID: store.id,
        id: productIds,
      });

      if (res instanceof CustomError) {
        console.error(res);
        setAlertState({
          message: '商品の取得に失敗しました',
          severity: 'error',
        });
        setIsLoading(false);
        return;
      }

      // 特価在庫は除外する
      const filteredProducts = res.products.filter(
        (product) => !product.is_special_price_product,
      );

      const mappedProducts = filteredProducts.flatMap(
        (product): CustomArrivalProductSearchType[] => {
          const matchedProducts = foundStocking.stocking_products.filter(
            (stockingProduct) => stockingProduct.product_id === product.id,
          );
          return matchedProducts.map((matched) => {
            const arrivalPrice =
              matched?.unit_price ?? matched?.unit_price_without_tax ?? 0;
            const arrivalCount = matched?.planned_item_count ?? 0;
            return {
              customId: uuidv4(),
              id: product.id,
              display_name: product.display_name,
              displayNameWithMeta: product.displayNameWithMeta,
              stock_number: product.stock_number,
              retail_price: product.retail_price,
              sell_price: product.actual_sell_price,
              buy_price: product.actual_buy_price,
              is_active: product.is_active,
              is_buy_only: product.is_buy_only,
              image_url: product.image_url,
              item_id: product.item_id,
              product_code: product.product_code,
              description: product.description,
              created_at: product.created_at,
              updated_at: product.updated_at,
              condition_option_display_name:
                product.condition_option_display_name,
              condition_option_id: product.condition_option_id,
              specialty_id: product.specialty_id,
              management_number: product.management_number,
              item_infinite_stock: product.item_infinite_stock,
              arrivalCount,
              arrivalPrice,
            };
          });
        },
      );

      setProducts(mappedProducts);
      setIsLoading(false);
      return res;
    },
    [clientAPI.product, setAlertState, store.id],
  );
  return { fetchProducts, isLoading, setProducts, products };
};
