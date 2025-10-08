import React, { useState, useEffect, useCallback } from 'react';
import { useSaleCartContext } from '@/contexts/SaleCartContext';
import {
  SearchDetail,
  SearchItemDetail,
} from '@/components/modals/searchModal/SearchDetail';
import { useAccountGroupContext } from '@/contexts/AccountGroupProvider';

interface Props {
  item: SearchItemDetail;
  isAddClicked: boolean;
  setIsAddClicked: React.Dispatch<React.SetStateAction<boolean>>;
  setOnAddToCartDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SaleSearchDetailContainer: React.FC<Props> = ({
  item,
  isAddClicked,
  setIsAddClicked,
  setOnAddToCartDisabled,
}) => {
  const { state, addProducts } = useSaleCartContext();

  const [selectedProduct, setSelectedProduct] = useState<
    SearchItemDetail['products'][0] | null
  >(null);
  const [sellPrice, setSellPrice] = useState<number | null>(null);
  const [itemCount, setItemCount] = useState<number>(1);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (item.products && item.products.length > 0) {
      setSelectedProduct(
        item.products.find(
          (products) =>
            products.stock_number !== 0 || products.item_infinite_stock,
        ) ?? null,
      );
    } else {
      setSelectedProduct(null);
    }
  }, [item.products]);

  // selectedProduct が変更された際に販売価格等をリセット
  useEffect(() => {
    if (selectedProduct) {
      setSellPrice(
        selectedProduct.specific_sell_price ??
          selectedProduct.sell_price ??
          null,
      );
    } else {
      setSellPrice(null);
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
    // if (!selectedProduct) return;
    // if (value < 1) {
    //   setError('数量は1以上にしてください。');
    //   setItemCount(1);
    // } else if (value > remainingStock) {
    //   setError(`在庫数を超えています。残り在庫: ${remainingStock}`);
    //   setItemCount(remainingStock);
    // } else {
    //   setError('');
    //   setItemCount(value);
    // }
    if (!selectedProduct) return;
    if (value > remainingStock && !item.infinite_stock) {
      setError(`在庫数を超えています。残り在庫: ${remainingStock}`);
      setItemCount(remainingStock);
    } else {
      setError('');
      setItemCount(value);
    }
  };

  // カートに追加する処理
  const handleAddToCart = useCallback(async () => {
    if (!selectedProduct || sellPrice === null || itemCount < 1) {
      setError('すべてのフィールドを正しく入力してください。');
      return;
    }

    // infinite_stock が false の場合のみ、在庫チェックを行う
    if (!item.infinite_stock && itemCount > remainingStock) {
      setError(`在庫数を超えています。残り在庫: ${remainingStock}`);
      return;
    }

    const newProduct = {
      productId: selectedProduct.id,
      imageUrl: item.image_url ?? '',
      displayName: item.display_name_with_meta ?? '',
      conditionName: selectedProduct.condition_option_display_name ?? '',
      stockNumber: selectedProduct.stock_number ?? 0,
      originalSalePrice: selectedProduct.sell_price ?? 0,
      originalSpecificSalePrice: selectedProduct.specific_sell_price ?? 0,
      infinite_stock: item.infinite_stock,
      managementNumber: selectedProduct.management_number ?? undefined,
      consignmentClientId: selectedProduct.consignment_client_id ?? undefined,
      consignmentClientFullName:
        selectedProduct.consignment_client__full_name ?? undefined,
      consignmentClientDisplayName:
        selectedProduct.consignment_client__display_name ?? undefined,
    };

    await addProducts({
      newProduct,
      itemCount,
      unitPrice: sellPrice,
    });

    // 処理完了後、入力値をリセット
    setItemCount(1);
    setSellPrice(
      selectedProduct.specific_sell_price ?? selectedProduct.sell_price ?? null,
    );
    setError('');
  }, [
    selectedProduct,
    sellPrice,
    itemCount,
    addProducts,
    remainingStock,
    item,
  ]);

  useEffect(() => {
    setOnAddToCartDisabled(
      !selectedProduct ||
        sellPrice === null ||
        itemCount < 1 ||
        (!item.infinite_stock && itemCount > remainingStock), // infinite_stock が true の場合は制限を無効化
    );
  }, [
    selectedProduct,
    sellPrice,
    itemCount,
    remainingStock,
    item.infinite_stock,
    setOnAddToCartDisabled,
  ]);

  useEffect(() => {
    if (isAddClicked) {
      handleAddToCart();
      setIsAddClicked(false);
    }
  }, [isAddClicked, setIsAddClicked, handleAddToCart]);

  // 販売で金額設定ができるかどうか
  const { accountGroup } = useAccountGroupContext();
  const canSetProductPrice =
    accountGroup?.set_transaction_manual_discount ?? false;
  return (
    <SearchDetail
      item={item}
      selectedProduct={selectedProduct}
      onSelectProduct={(product) => setSelectedProduct(product)}
      unitPriceLabel="販売価格"
      unitPrice={sellPrice}
      onUnitPriceChange={setSellPrice}
      itemCount={itemCount}
      onItemCountChange={(count) => handleItemCountChange(count)}
      error={error}
      remainingStock={remainingStock}
      totalStockNumber={totalStockNumber}
      canSetProductPrice={canSetProductPrice}
      isPurchase={false}
    />
  );
};
