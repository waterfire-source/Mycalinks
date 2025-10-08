import { SearchField } from '@/feature/stock/bundle/components/SearchField';
import {
  BundleSetProductType,
  TabTable,
} from '@/feature/stock/bundle/components/TabTable';
import { useBundles } from '@/feature/stock/bundle/hooks/useBundles';
import {
  UseSetDealParams,
  useSetDeals,
} from '@/feature/stock/set/hooks/useSetDeals';
import { useState, useCallback, useEffect } from 'react';
import { ItemAPI } from '@/api/frontend/item/api';

type Props = {
  storeID: number;
  fetchTrigger: number;
  handleEditBundleProducts: (newProduct: BundleSetProductType) => void;
};

export enum SortType {
  SET_BUNDLE = 'all',
  SET = 'set',
  BUNDLE = 'bundle',
}

export enum SortOrder {
  START_DATE_ASC = 'startDateAsc',
  START_DATE_DESC = 'startDateDesc',
  END_DATE_ASC = 'endDateAsc',
  END_DATE_DESC = 'endDateDesc',
}

export const TableContainer = ({
  storeID,
  fetchTrigger,
  handleEditBundleProducts,
}: Props) => {
  // 状態変数の定義
  const [bundleProducts, setBundleProducts] = useState<BundleSetProductType[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const { listBundleItems } = useBundles();
  const { listSetDeals } = useSetDeals();

  // セット/バンドルのステート
  const [sortType, setSortType] = useState<string>(SortType.SET_BUNDLE);
  // 昇順降順のステート
  const [sortOrder, setSortOrder] = useState<string>(SortOrder.START_DATE_DESC);

  const sortProducts = (
    products: BundleSetProductType[],
    sortType: string,
    sortOrder: string,
  ): BundleSetProductType[] => {
    // フィルタリング
    let sortedProducts = products;
    if (sortType) {
      sortedProducts = sortedProducts.filter((product) => {
        if (sortType === SortType.SET_BUNDLE) return true;
        return product.productType === sortType;
      });
    }

    // ソート
    if (sortOrder) {
      sortedProducts.sort((a, b) => {
        switch (sortOrder) {
          case SortOrder.START_DATE_ASC:
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          case SortOrder.START_DATE_DESC:
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          case SortOrder.END_DATE_ASC: {
            // どちらも null の場合
            if (a.expiredAt == null && b.expiredAt === null) return 0;
            // a が null なら a を後ろへ
            if (a.expiredAt == null) return 1;
            // b が null なら b を後ろへ
            if (b.expiredAt == null) return -1;
            // 両方とも日付ありの場合は日付の昇順
            return (
              new Date(a.expiredAt).getTime() - new Date(b.expiredAt).getTime()
            );
          }
          case SortOrder.END_DATE_DESC: {
            // どちらも null の場合
            if (a.expiredAt == null && b.expiredAt === null) return 0;
            // a が null なら a を後ろへ
            if (a.expiredAt == null) return 1;
            // b が null なら b を後ろへ
            if (b.expiredAt == null) return -1;
            // 両方とも日付ありの場合は日付の降順
            return (
              new Date(b.expiredAt).getTime() - new Date(a.expiredAt).getTime()
            );
          }
          default:
            return 0;
        }
      });
    }

    return sortedProducts;
  };

  // 商品を取得する関数
  const fetchProducts = useCallback(
    async (
      storeID: number,
      skip: number,
      currentProducts: BundleSetProductType[],
    ) => {
      if (isLoading) return;
      setIsLoading(true);

      // バンドル商品を取得
      const getBundleListParams: ItemAPI['getAll']['request'] = {
        storeID,
      };
      const bundleResponse = await listBundleItems(getBundleListParams);

      // エラーハンドリング
      if (bundleResponse == null) {
        console.error('Error fetching bundle: no response');
        setIsLoading(false);
        return;
      }

      // 取得したバンドル商品をBundleSetProductTypeに変換
      const newBundleProducts: BundleSetProductType[] = bundleResponse.items
        .filter(
          (newBundleItem) =>
            !currentProducts.some(
              (prevProduct) =>
                prevProduct.id === newBundleItem.id &&
                prevProduct.productType === 'bundle',
            ),
        )
        .map((bundleItem) => {
          const bundleProduct: BundleSetProductType = {
            id: bundleItem.id, // ここでのidはbundleProductのid
            displayName: bundleItem.display_name || '',
            createdAt: bundleItem.created_at,
            updatedAt: bundleItem.updated_at,
            imageUrl: bundleItem.image_url,
            itemId: bundleItem.products[0].item_id,
            productId: bundleItem.products[0].id, // ここでのidはProductのid
            products: bundleItem.bundle_item_products
              ? bundleItem.bundle_item_products.map((product) => ({
                  productID: product.product_id,
                  itemCount: product.item_count,
                  itemId: product.item_id,
                }))
              : [],
            productType: 'bundle',
            bundleSellPrice: bundleItem.sell_price,
            initStockNumber: bundleItem.init_stock_number,
            bundleGenre: {
              id: bundleItem.genre_id,
              displayName: bundleItem.genre_display_name,
            },
            bundleStockNumber: bundleItem.products_stock_number,
            startAt: bundleItem.start_at,
            expiredAt: bundleItem.expire_at,
            infiniteStock: bundleItem.infinite_stock,
          };
          return bundleProduct;
        });

      // セット商品を取得
      const getSetListParams: UseSetDealParams['listSetDeals'] = {
        storeID,
      };
      const setDealResponse = await listSetDeals(getSetListParams);

      // エラーハンドリング
      if (setDealResponse == null) {
        console.error('Error fetching set products: no response');
        setIsLoading(false);
        return;
      }

      // 取得したセット商品をBundleSetProductTypeに変換
      const newSetProducts: BundleSetProductType[] = setDealResponse
        .filter(
          (newProduct) =>
            !currentProducts.some(
              (prevProduct) =>
                prevProduct.id === newProduct.id &&
                prevProduct.productType === 'set',
            ),
        )
        .map((setDeal) => {
          const setProduct: BundleSetProductType = {
            id: setDeal.id,
            displayName: setDeal.displayName,
            createdAt: setDeal.createdAt,
            updatedAt: setDeal.updatedAt,
            imageUrl: setDeal.imageUrl,
            products: setDeal.products.map((product) => ({
              productID: product.productID,
              itemCount: product.itemCount,
              setDealID: product.setDealID,
            })),
            productType: 'set',
            setDiscountAmount: setDeal.discountAmount,
            startAt: setDeal.startAt,
            expiredAt: setDeal.expiredAt,
            isDeleted: setDeal.isDeleted,
            status: setDeal.status,
          };
          return setProduct;
        });

      // バンドル商品とセット商品を結合し、順番に並べる
      // 作成日が新しい順に並べる
      const combinedProducts = [
        ...currentProducts,
        ...newSetProducts,
        ...newBundleProducts,
      ];

      const finalProducts = sortProducts(combinedProducts, sortType, sortOrder);
      setBundleProducts(finalProducts);

      // 状態変数にセット
      setBundleProducts(finalProducts);
      setIsLoading(false);
    },
    [isLoading, sortType, sortOrder],
  );

  // 初期化処理
  useEffect(() => {
    const initializeSearch = async () => {
      if (storeID) {
        fetchProducts(storeID, 0, []);
      }
    };
    initializeSearch();
  }, []);

  // 商品取得トリガーが変更されたら商品を再取得
  useEffect(() => {
    const refetchTableData = async () => {
      setBundleProducts([]);
      if (storeID) {
        await fetchProducts(storeID, 0, []);
      }
    };
    refetchTableData();
  }, [fetchTrigger, storeID, sortType, sortOrder]);

  return (
    <TabTable
      isLoading={isLoading}
      bundleProducts={bundleProducts}
      addField={
        <SearchField setSortType={setSortType} setSortOrder={setSortOrder} />
      }
      onEditBundleProducts={handleEditBundleProducts}
    />
  );
};
