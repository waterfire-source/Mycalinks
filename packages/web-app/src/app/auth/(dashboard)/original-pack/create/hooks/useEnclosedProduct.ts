import { EnclosedProduct } from '@/app/auth/(dashboard)/original-pack/create/components/addProduct/enclosedProduct/EnclosedSelectModal';
import { useAlert } from '@/contexts/AlertContext';
import { useMemo, useState, useCallback } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { createClientAPI, CustomError } from '@/api/implement';
export const useEnclosedProduct = () => {
  const { setAlertState } = useAlert();
  const { store } = useStore();
  const [enclosedProducts, setEnclosedProducts] = useState<EnclosedProduct[]>(
    [],
  );
  // 販売額合計
  const totalSellPrice = useMemo(
    () =>
      enclosedProducts.reduce(
        (acc, product) =>
          acc + (product.actual_sell_price ?? 0) * (product.item_count ?? 0),
        0,
      ),
    [enclosedProducts],
  );
  // 仕入れ値合計
  const totalWholesalePrice = useMemo(
    () =>
      enclosedProducts.reduce(
        (acc, product) =>
          acc + (product.mean_wholesale_price ?? 0) * (product.item_count ?? 0),
        0,
      ),
    [enclosedProducts],
  );
  // item_countの変更
  const handleItemCountChange = (
    product: EnclosedProduct,
    itemCount: number,
  ) => {
    if (product.stock_number < itemCount) {
      setAlertState({
        message: '在庫数を超えています',
        severity: 'error',
      });
      return;
    }
    console.log('product', product);
    console.log('itemCount', itemCount);
    setEnclosedProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...product, item_count: itemCount } : p,
      ),
    );
  };
  // 封入商品の追加
  const addEnclosedProduct = (product: EnclosedProduct) => {
    // 同じ商品が存在するか確認
    const isExist = enclosedProducts.some((p) => p.id === product.id);
    if (isExist) {
      setAlertState({
        message: '同じ商品が存在します',
        severity: 'error',
      });
      return;
    }
    setEnclosedProducts((prev) => [...prev, product]);
  };
  // 封入商品の削除
  const deleteEnclosedProduct = (productId: number) => {
    setEnclosedProducts((prev) => prev.filter((p) => p.id !== productId));
  };
  // 封入商品を全て削除
  const resetEnclosedProducts = () => {
    setEnclosedProducts([]);
  };
  // 編集時初期に封入商品をセット
  const handleSetEnclosedProducts = (products: EnclosedProduct[]) => {
    setEnclosedProducts(products);
  };

  // 現在の在庫情報をAPIから取得して最新化する
  const refreshEnclosedProducts = useCallback(async () => {
    try {
      if (enclosedProducts.length === 0) return;
      const clientAPI = createClientAPI();
      const ids = enclosedProducts.map((p) => p.id);

      const res = await clientAPI.product.listProducts({
        storeID: store.id,
        id: ids,
      });

      if (res instanceof CustomError) {
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }

      const latestProducts = res.products;
      setEnclosedProducts((prev) =>
        prev.map((p) => {
          const latest = latestProducts.find((lp) => lp.id === p.id);
          if (!latest) return p;
          // latest には EnclosedProduct に必要なプロパティが不足している場合があるため、p（元のEnclosedProduct）をベースに最新情報を上書きする
          return {
            ...p,
            ...latest,
            item_count: p.item_count,
            mean_wholesale_price: p.mean_wholesale_price,
            is_infinite_stock:
              latest.item_infinite_stock ?? p.is_infinite_stock,
          };
        }),
      );
    } catch (error) {
      setAlertState({
        message: '商品の最新情報取得に失敗しました',
        severity: 'error',
      });
    }
  }, [enclosedProducts, setAlertState, store.id]);

  return {
    enclosedProducts,
    handleItemCountChange,
    addEnclosedProduct,
    deleteEnclosedProduct,
    resetEnclosedProducts,
    totalSellPrice,
    totalWholesalePrice,
    handleSetEnclosedProducts,
    refreshEnclosedProducts,
  };
};
