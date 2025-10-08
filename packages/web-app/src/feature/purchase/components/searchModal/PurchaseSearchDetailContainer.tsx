import React, { useState, useEffect, useCallback } from 'react';
import {
  SearchDetail,
  SearchItemDetail,
} from '@/components/modals/searchModal/SearchDetail';
import { usePurchaseCartContext } from '@/contexts/PurchaseCartContext';
import { useAccountGroupContext } from '@/contexts/AccountGroupProvider';

interface Props {
  item: SearchItemDetail;
  isAddClicked: boolean;
  setIsAddClicked: React.Dispatch<React.SetStateAction<boolean>>;
  setOnAddToCartDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PurchaseSearchDetailContainer: React.FC<Props> = ({
  item,
  isAddClicked,
  setIsAddClicked,
  setOnAddToCartDisabled,
}) => {
  const { state, addProducts } = usePurchaseCartContext();

  const [selectedProduct, setSelectedProduct] = useState<
    SearchItemDetail['products'][0] | null
  >(null);
  const [purchasePrice, setPurchasePrice] = useState<number | null>(null);
  const [itemCount, setItemCount] = useState<number>(1);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (item.products && item.products.length > 0) {
      setSelectedProduct(item.products[0]);
    } else {
      setSelectedProduct(null);
    }
  }, [item.products]);

  // selectedProduct が変更された際に買取価格等をリセット
  useEffect(() => {
    if (selectedProduct) {
      setPurchasePrice(
        selectedProduct.specific_purchase_price ??
          selectedProduct.purchase_price ??
          null,
      );
    } else {
      setPurchasePrice(null);
    }
    setItemCount(1);
    setError('');
  }, [selectedProduct]);

  // 合計在庫数（すべての状態の stock_number を合計）
  const totalStockNumber = item.products
    ? item.products.reduce((acc, p) => acc + (p.stock_number ?? 0), 0)
    : 0;

  // カート内で同じ productId の数量合計
  const existingCartCount = state.carts
    .filter((cart) => cart.productId === selectedProduct?.id)
    .reduce(
      (sum, cart) =>
        sum +
        cart.variants.reduce((variantSum, v) => variantSum + v.itemCount, 0),
      0,
    );

  // 残りの在庫数
  const remainingStock = selectedProduct
    ? (selectedProduct.stock_number ?? 0) - existingCartCount
    : 0;

  // 数量変更時のバリデーション
  const handleItemCountChange = (value: number) => {
    if (!selectedProduct) return;
    // if (value < 1) {
    //   setError('数量は1以上にしてください。');
    //   setItemCount(1);
    // } else {
    // }
    setError('');
    setItemCount(value);
  };

  // カートに追加する処理
  const handleAddToCart = useCallback(async () => {
    if (!selectedProduct || purchasePrice === null || itemCount < 1) {
      setError(
        !selectedProduct
          ? '商品を選択してください。'
          : purchasePrice === null
          ? '買取価格を入力してください。'
          : '数量は1以上を入力してください。',
      );
      return;
    }

    const newProduct = {
      productId: selectedProduct.id,
      imageUrl: item.image_url ?? '',
      displayName: item.display_name ?? '',
      conditionName: selectedProduct.condition_option_display_name ?? '',
      isBuyOnly: item.isBuyOnly,
      stockNumber: selectedProduct.stock_number ?? 0,
      originalPurchasePrice: selectedProduct.sell_price ?? 0,
      originalSpecificPurchasePrice: selectedProduct.specific_sell_price ?? 0,
      infinite_stock: item.infinite_stock ?? false,
      is_special_price_product:
        selectedProduct.is_special_price_product ?? false,
    };

    await addProducts({
      newProduct,
      itemCount,
      unitPrice: purchasePrice,
    });

    // 処理完了後、入力値をリセット
    setItemCount(1);
    setPurchasePrice(
      selectedProduct.specific_purchase_price ??
        selectedProduct.purchase_price ??
        null,
    );
    setError('');
  }, [selectedProduct, purchasePrice, itemCount, addProducts, item]);

  useEffect(() => {
    setOnAddToCartDisabled(
      !selectedProduct || purchasePrice === null || itemCount < 1,
    );
  }, [selectedProduct, itemCount, purchasePrice, setOnAddToCartDisabled]);

  useEffect(() => {
    if (isAddClicked) {
      handleAddToCart();
      setIsAddClicked(false);
    }
  }, [isAddClicked, setIsAddClicked, handleAddToCart]);

  // 買取で取得金額設定ができるかどうか
  const { accountGroup } = useAccountGroupContext();
  const canSetProductPrice =
    accountGroup?.set_buy_transaction_manual_product_price ?? false;

  return (
    <SearchDetail
      item={item}
      selectedProduct={selectedProduct}
      onSelectProduct={(product) => setSelectedProduct(product)}
      unitPriceLabel="買取価格"
      unitPrice={purchasePrice}
      onUnitPriceChange={setPurchasePrice}
      itemCount={itemCount}
      onItemCountChange={(count) => handleItemCountChange(count)}
      error={error}
      totalStockNumber={totalStockNumber}
      canSetProductPrice={canSetProductPrice}
      isPurchase={true}
    />
  );
};
