'use client';

import React, { useState } from 'react';
import { ProductScanButton } from '@/feature/products/components/ProductScanButton';
import { CustomError, createClientAPI } from '@/api/implement';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { useStore } from '@/contexts/StoreContext';
import { useAlert } from '@/contexts/AlertContext';
import { TransactionCartItem } from '@/feature/purchaseReception/hooks/useTransactionCart';
import { MultipleProductModal } from '@/feature/products/components/MultipleProductModal';

interface PurchaseProductScanButtonContainerProps {
  transactionId: number;
  addToCart: (
    item: Omit<TransactionCartItem, 'cart_item_id'>,
  ) => Promise<void> | void;
}

export const PurchaseProductScanButtonContainer: React.FC<
  PurchaseProductScanButtonContainerProps
> = ({ addToCart }) => {
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const [isMultipleProductModalOpen, setIsMultipleProductModalOpen] =
    useState(false);
  const [productsForModal, setProductsForModal] = useState<
    BackendProductAPI[0]['response']['200']['products']
  >([]);

  const processProductForCart = (
    product: BackendProductAPI[0]['response']['200']['products'][0],
  ): Omit<TransactionCartItem, 'cart_item_id'> | null => {
    return {
      item_count: 1,
      unit_price: product.specific_buy_price ?? product.buy_price ?? 0,
      discount_price: 0,
      rarity: product.item_rarity ?? null,
      expansion: product.item_expansion ?? null,
      cardnumber: product.item_cardnumber ?? null,
      productGenreName: '',
      productCategoryName: '',
      product_details: {
        id: product.id,
        display_name: product.display_name,
        displayNameWithMeta: product.displayNameWithMeta,
        image_url: product.image_url ?? '',
        specific_buy_price: product.specific_buy_price ?? 0,
        buy_price: product.buy_price ?? 0,
        product_code: product.product_code ?? 0,
        conditionDisplayName: product.condition_option_display_name ?? '',
        condition_option_id: product.condition_option_id ?? 0,
        item_id: product.item_id ?? 0,
      },
    };
  };

  const handleScanSearch = async (code: string) => {
    try {
      const clientAPI = createClientAPI();
      const response = await clientAPI.product.listProducts({
        storeID: store.id,
        code,
      });

      if (response instanceof CustomError) {
        setAlertState({ message: response.message, severity: 'error' });
        return;
      }

      if (response.products.length === 0) {
        setAlertState({
          message: '商品が見つかりませんでした。',
          severity: 'error',
        });
        return;
      }

      const purchasableProducts = response.products;

      if (purchasableProducts.length === 0) {
        setAlertState({
          message: '買取可能な商品が見つかりませんでした。',
          severity: 'error',
        });
        return;
      }

      if (purchasableProducts.length > 1) {
        setProductsForModal(purchasableProducts);
        setIsMultipleProductModalOpen(true);
        return;
      }

      const product = purchasableProducts[0];
      const cartItem = processProductForCart(product);
      if (cartItem) {
        await addToCart(cartItem);
      }
    } catch (error) {
      console.error('Scan search error:', error);
      setAlertState({
        message: 'スキャン処理中にエラーが発生しました。',
        severity: 'error',
      });
    }
  };

  const handleProductSelectionFromModal = async (
    product: BackendProductAPI[0]['response']['200']['products'][0],
  ) => {
    const cartItem = processProductForCart(product);
    if (cartItem) {
      await addToCart(cartItem);
    }
    setIsMultipleProductModalOpen(false);
  };

  return (
    <>
      <ProductScanButton
        handleScanSearch={handleScanSearch}
        isShowInputField={false}
      />
      <MultipleProductModal
        multipleProducts={productsForModal}
        open={isMultipleProductModalOpen}
        onClose={() => setIsMultipleProductModalOpen(false)}
        handleAddProductToResult={handleProductSelectionFromModal}
      />
    </>
  );
};
