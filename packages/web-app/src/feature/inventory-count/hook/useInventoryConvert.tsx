import { ShelfProduct } from '@/app/auth/(dashboard)/inventory-count/[inventoryId]/[shelfId]/page';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { InventoryProductAPIData } from '@/feature/inventory-count/hook/useInventoryProducts';
import { InventoryProductRequest } from '@/feature/inventory-count/hook/useUpdateInventory';
import { useProducts } from '@/feature/products/hooks/useProducts';
import { useWholesalePrice } from '@/feature/products/hooks/useWholesalePrice';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useInventoryConvert = () => {
  const { listProductsByProductIDs } = useProducts();
  const { store } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const { fetchWholesalePrice } = useWholesalePrice();
  const { setAlertState } = useAlert();

  const APIResponseDataToShelfProducts = async (
    APIData: InventoryProductAPIData[],
    shelfId: number,
  ): Promise<ShelfProduct[]> => {
    setIsLoading(true);
    try {
      const productIds = APIData.map((data) => data.product_id);
      if (!productIds.length) return [];
      const products =
        (await listProductsByProductIDs(store.id, productIds)) || [];

      return APIData.flatMap((data) => {
        const itemCountInOtherShelf = APIData.filter(
          (product) => product.shelf_id !== shelfId,
        )
          .filter((product) => product.product_id === data.product_id)
          .reduce((prev, current) => {
            return prev + current.item_count;
          }, 0);

        const targetProduct = products.find((p) => p.id === data.product_id);
        if (!targetProduct) return [];

        return {
          ...targetProduct,
          shelf_item_id: uuidv4(),
          shelf_id: shelfId,
          shelf_name: data.shelf_name || '',
          item_count: data.item_count,
          item_count_in_other_shelf: itemCountInOtherShelf,
        };
      });
    } finally {
      setIsLoading(false);
    }
  };

  const shelfProductsToAPIRequestData = async (
    shelfProducts: ShelfProduct[],
    staffId: number,
  ): Promise<InventoryProductRequest> => {
    setIsLoading(true);
    try {
      const data = await Promise.all(
        shelfProducts.map(async (product, i) => {
          // 理論在庫が実際の在庫数を超えている場合
          const isOverStock = product.item_count > product.stock_number;
          const wholesalePrice = await fetchWholesalePrice(
            product.id,
            isOverStock ? product.stock_number : product.item_count,
            true,
          );

          let totalWholesalePrice = wholesalePrice?.totalWholesalePrice ?? 0;
          if (isOverStock) {
            // 在庫数を超えた分は最後の仕入れ値を使う。0→1の時は仕入れ値は０でok
            const lastWholesalePrice =
              wholesalePrice?.originalWholesalePrices[
                wholesalePrice?.originalWholesalePrices.length - 1
              ]?.unit_price ?? 0;
            totalWholesalePrice +=
              lastWholesalePrice * (product.item_count - product.stock_number);
          }

          return {
            shelf_id: product.shelf_id,
            product_id: product.id,
            item_count: product.item_count,
            staff_account_id: staffId,
            input_total_wholesale_price: totalWholesalePrice,
          };
        }),
      );

      return data;
    } catch {
      setAlertState({
        message: '仕入れ値の取得に失敗しました',
        severity: 'error',
      });
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const APIResponseDataToAPIRequestData = (
    APIResData: InventoryProductAPIData[],
    staffId: number,
  ): InventoryProductRequest => {
    return APIResData.map((data) => ({
      shelf_id: data.shelf_id,
      product_id: data.product_id,
      item_count: data.item_count,
      staff_account_id: staffId,
      input_total_wholesale_price: data.input_total_wholesale_price,
    }));
  };

  return {
    APIResponseDataToShelfProducts,
    shelfProductsToAPIRequestData,
    APIResponseDataToAPIRequestData,
    isLoading,
  };
};
