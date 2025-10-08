'use client';

import { CustomError, createClientAPI } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { ProductScanButton } from '@/feature/products/components/ProductScanButton';
import { usePurchaseCartContext } from '@/contexts/PurchaseCartContext';
import { PurchaseCartItem } from '@/feature/purchase/hooks/usePurchaseCart';

export const ProductScanButtonContainer = () => {
  const { store } = useStore();
  const { addProducts } = usePurchaseCartContext();
  const { setAlertState } = useAlert();

  const handleScanSearch = async (code: string) => {
    const clientAPI = createClientAPI();
    const response = await clientAPI.product.listProducts({
      storeID: store.id,
      code: BigInt(code),
    });

    if (response instanceof CustomError) {
      setAlertState({ message: response.message, severity: 'error' });
      return;
    }
    if (response.products.length === 1) {
      const item = response.products[0];
      const newProduct: Omit<PurchaseCartItem, 'variants'> = {
        productId: item.id,
        imageUrl: item.image_url ?? '',
        displayName: item.display_name,
        conditionName: item.condition_option_display_name ?? '',
        isBuyOnly: item.is_buy_only,
        stockNumber: item.stock_number ?? 0,
        originalPurchasePrice: item.buy_price ?? 0,
        originalSpecificPurchasePrice: item.specific_buy_price ?? 0,
        infinite_stock: item.item_infinite_stock,
      };

      await addProducts({
        newProduct: newProduct,
        itemCount: 1,
        unitPrice: item.specific_buy_price ?? item.buy_price ?? 0,
      });
    } else {
      setAlertState({
        message: '商品が見つかりませんでした。',
        severity: 'error',
      });
    }
  };

  return (
    <ProductScanButton
      handleScanSearch={handleScanSearch}
      isShowInputField={false}
    />
  );
};
