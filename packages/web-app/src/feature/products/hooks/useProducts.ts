import { ItemType } from '@prisma/client';
import { createClientAPI, CustomError } from '@/api/implement';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { useAlert } from '@/contexts/AlertContext';
import { TransactionKind, Sale } from '@prisma/client';
import { useCallback, useMemo, useState } from 'react';

export const useProducts = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  const [products, setProducts] =
    useState<BackendProductAPI[0]['response']['200']['products']>();
  const [storageProducts, setStorageProducts] =
    useState<BackendProductAPI[0]['response']['200']['products']>();
  const [totalValues, setTotalValues] =
    useState<BackendProductAPI[0]['response']['200']['totalValues']>();
  const [sales, setSales] = useState<
    Array<{
      sale: Sale;
      originalPrice: number;
      discountPrice: number;
      resultPrice: number;
      allowedItemCount: number;
    }>
  >();
  const [isLoadingGetProducts, setIsLoadingGetProducts] =
    useState<boolean>(false);

  const handelResetProducts = () => {
    setProducts(undefined);
  };

  // 指定したIDの配列と一致するproductを取得してくる
  const listProductsByProductIDs = useCallback(
    async (
      storeID: number,
      productIDs: number[],
      options?: {
        take?: number;
        skip?: number;
        includesSummary?: boolean;
        includesImages?: boolean;
      },
    ) => {
      try {
        setIsLoadingGetProducts(true);
        const res = await clientAPI.product.listProducts({
          storeID: storeID,
          id: productIDs,
          take: options?.take,
          skip: options?.skip,
          includesSummary: options?.includesSummary || undefined,
          includesImages: options?.includesImages,
        });
        setIsLoadingGetProducts(false);
        if (res instanceof CustomError) {
          console.error('商品の取得に失敗しました。');
          setAlertState({
            message: `${res.status}:${res.message}`,
            severity: 'error',
          });
          return;
        }

        setProducts((prev) => {
          if (prev) {
            // 重複する商品を除外
            const newProducts = res.products.filter(
              (product) => !prev.some((p) => p.id === product.id),
            );
            return [...prev, ...newProducts];
          }
          // 初期状態の場合
          return res.products;
        });

        setTotalValues(res.totalValues);
        return res.products;
      } catch (error) {
        console.error('商品の取得中にエラーが発生しました。', error);
        setAlertState({
          message: '商品の取得中にエラーが発生しました。',
          severity: 'error',
        });
      }
    },
    [clientAPI.product, setAlertState],
  );

  // 指定した productId の配列と一致する product を取得する
  // MEMO: 指定したIDが多い場合には分割リクエストを実施
  const listProductsByProductIDsChunked = useCallback(
    async (storeID: number, productIDs: number[]) => {
      try {
        setIsLoadingGetProducts(true);

        // 重複IDを事前に除去
        const uniqueProductIDs = Array.from(new Set(productIDs));

        // パラメータのIDを100件ずつに分割
        const chunkSize = 100;
        const chunks: number[][] = [];
        for (let i = 0; i < uniqueProductIDs.length; i += chunkSize) {
          chunks.push(uniqueProductIDs.slice(i, i + chunkSize));
        }

        let allProducts: typeof products = [];
        const totalValuesSum = {
          itemCount: 0,
          customerBase: 0,
          costBase: 0,
          inventoryCount: 0,
          totalSellPrice: 0,
          totalBuyPrice: 0,
        };

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];

          const res = await clientAPI.product.listProducts({
            storeID,
            id: chunk,
          });

          if (res instanceof CustomError) {
            console.error(
              '一部の商品の取得に失敗しました。',
              res.status,
              res.message,
            );
            setAlertState({
              message: `${res.status}:${res.message}`,
              severity: 'error',
            });
            continue;
          }

          allProducts = [...allProducts, ...res.products];
          if (res.totalValues) {
            totalValuesSum.itemCount += res.totalValues.itemCount ?? 0;
            totalValuesSum.customerBase += res.totalValues.customerBase ?? 0;
            totalValuesSum.costBase += res.totalValues.costBase ?? 0;
            totalValuesSum.inventoryCount +=
              res.totalValues.inventoryCount ?? 0;
            totalValuesSum.totalSellPrice +=
              res.totalValues.totalSellPrice ?? 0;
            totalValuesSum.totalBuyPrice += res.totalValues.totalBuyPrice ?? 0;
          }
        }

        // 重複除去
        const uniqueProducts = Array.from(
          new Map(allProducts.map((p) => [p.id, p])).values(),
        );

        // 取得済みの products とマージ
        setProducts((prev) => {
          if (prev) {
            const newProducts = uniqueProducts.filter(
              (product) => !prev.some((p) => p.id === product.id),
            );
            return [...prev, ...newProducts];
          }
          return uniqueProducts;
        });

        setTotalValues(totalValuesSum);
      } catch (error) {
        console.error('商品の取得中にエラーが発生しました。', error);
        setAlertState({
          message: '商品の取得中にエラーが発生しました。',
          severity: 'error',
        });
      } finally {
        setIsLoadingGetProducts(false);
      }
    },
    [clientAPI.product, setAlertState],
  );

  // 指定したIDの配列と一致するproductを取得してくる
  const listProductsByInventoryID = useCallback(
    async (storeID: number, inventoryId: number) => {
      try {
        setIsLoadingGetProducts(true);
        const res = await clientAPI.product.listProducts({
          storeID: storeID,
          inventoryId,
        });
        setIsLoadingGetProducts(false);
        if (res instanceof CustomError) {
          console.error('商品の取得に失敗しました。');
          setAlertState({
            message: `${res.status}:${res.message}`,
            severity: 'error',
          });
          return;
        }

        setProducts((prev) => {
          if (prev) {
            // 重複する商品を除外
            const newProducts = res.products.filter(
              (product) => !prev.some((p) => p.id === product.id),
            );
            return [...prev, ...newProducts];
          }
          // 初期状態の場合
          return res.products;
        });

        setTotalValues(res.totalValues);
      } catch (error) {
        console.error('商品の取得中にエラーが発生しました。', error);
        setAlertState({
          message: '商品の取得中にエラーが発生しました。',
          severity: 'error',
        });
      }
    },
    [clientAPI.product, setAlertState],
  );

  // アクティブなproductの一覧を取得する
  const listProducts = useCallback(
    async (storeID: number, isActive?: boolean, take?: number) => {
      const res = await clientAPI.product.listProducts({
        storeID: storeID,
        isActive: isActive, // isActiveがundefinedの時はどちらの商品も取得する
        take: take ?? 3000,
        includesSummary: true,
      });
      if (res instanceof CustomError) {
        console.error('アクティブな商品の取得に失敗しました');
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      setProducts(res.products);
      setTotalValues(res.totalValues);
    },
    [clientAPI.product, setAlertState],
  );

  // パック開封時にproductの一覧を取得する
  const listPackProducts = useCallback(
    async (
      storeID: number,
      isActive?: boolean,
      take?: number,
      keyword?: string,
      genreId?: number,
    ) => {
      const res = await clientAPI.product.listProducts({
        storeID: storeID,
        isActive: isActive, // isActiveがundefinedの時はどちらの商品も取得する
        take: take ?? 3000,
        includesSummary: true,
        stockNumberGte: 1, // 一つ以上の在庫数があるものだけ取得する
        isPack: true,
        displayName: keyword,
        itemGenreId: genreId,
      });
      if (res instanceof CustomError) {
        console.error('パック商品の取得に失敗しました');
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      setProducts(res.products);
      setTotalValues(res.totalValues);
    },
    [clientAPI.product, setAlertState],
  );

  // ストレージproductの一覧を取得する
  const listStorageProducts = useCallback(
    async (storeID: number) => {
      const category = await clientAPI.category.getCategoryAll({
        storeID: storeID,
      });
      if (category instanceof CustomError) {
        console.error('カテゴリ一覧の取得に失敗しました');
        setAlertState({
          message: `${category.status}:${category.message}`,
          severity: 'error',
        });
        return;
      }
      const storageCategory = category.itemCategories.find(
        (category) => category.handle === 'STORAGE',
      );

      if (!storageCategory) {
        console.error('ストレージカテゴリが見つかりませんでした');
        setAlertState({
          message: 'ストレージカテゴリが見つかりませんでした',
          severity: 'error',
        });
        return;
      }
      const res = await clientAPI.product.listProducts({
        storeID: storeID,
        itemCategoryId: storageCategory.id,
      });
      if (res instanceof CustomError) {
        console.error('パック商品の取得に失敗しました');
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      setStorageProducts(res.products);
    },
    [clientAPI.product, setAlertState],
  );

  // productを検索する際に用いる
  const searchProducts = useCallback(
    async (
      storeID: number,
      query: string,
      isActive?: boolean,
      take?: number,
      isBundle?: boolean,
      type?: ItemType,
    ) => {
      const res = await clientAPI.product.listProducts({
        storeID: storeID,
        displayName: query === '' ? undefined : query, // クエリが空文字なら全検索する
        isActive: isActive,
        isBundle: isBundle,
        type,
        take: take ?? 3000,
        includesSummary: true,
      });
      if (res instanceof CustomError) {
        console.error('商品検索に失敗しました。');
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      setProducts(res.products);
      setTotalValues(res.totalValues);
    },
    [clientAPI.product, setAlertState],
  );

  // 商品に適用されているセールを取得
  const getSales = useCallback(
    async (
      storeId: number,
      productId: number,
      transactionKind: TransactionKind,
    ) => {
      const response = await clientAPI.product.getSales({
        store_id: storeId,
        product_id: productId,
        query: {
          transaction_kind: transactionKind,
        },
      });
      if (response instanceof CustomError) {
        console.error('セール情報の取得に失敗しました。');
        setAlertState({
          message: `${response.status}:${response.message}`,
          severity: 'error',
        });
        return;
      }
      // transactionKindに基づいてレスポンスをソート
      const sortedResponse = response.sort((a, b) => {
        if (transactionKind === 'sell') {
          return a.resultPrice - b.resultPrice;
        } else {
          return b.resultPrice - a.resultPrice;
        }
      });

      setSales(sortedResponse);
      return sortedResponse;
    },
    [clientAPI.product, setAlertState],
  );

  return {
    products,
    storageProducts,
    totalValues,
    sales,
    listProductsByProductIDs,
    listProductsByProductIDsChunked,
    listProducts,
    listStorageProducts,
    searchProducts,
    getSales,
    listPackProducts,
    isLoadingGetProducts,
    handelResetProducts,
    listProductsByInventoryID,
  };
};
