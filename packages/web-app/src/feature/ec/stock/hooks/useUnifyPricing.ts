import { useState, useCallback, useMemo, useEffect } from 'react';
import { useUpdateProduct } from '@/feature/products/hooks/useUpdateProduct';
import { createClientAPI } from '@/api/implement';
import {
  filterUnifyTargetProducts,
  type ProductSearchResult,
} from '@/feature/ec/stock/utils/unifyPricingUtils';

export interface UnifyPricingOptions {
  baseProducts: ProductSearchResult[];
  storeId: number;
  enabled?: boolean;
}

export const useUnifyPricing = ({
  baseProducts,
  storeId,
  enabled = true,
}: UnifyPricingOptions) => {
  const [enableUnifyPricing, setEnableUnifyPricing] = useState(false);
  const [unifyPrice, setUnifyPrice] = useState<number | undefined>();
  const { updateProduct } = useUpdateProduct();

  // 統一対象商品を格納
  const [allUnifyTargetProducts, setAllUnifyTargetProducts] = useState<
    ProductSearchResult[]
  >([]);
  const [isLoadingUnifyTargets, setIsLoadingUnifyTargets] = useState(false);

  // 複数商品の統一対象を並列取得
  const fetchAllUnifyTargets = async () => {
    if (!enabled || !enableUnifyPricing || !baseProducts.length) {
      setAllUnifyTargetProducts([]);
      return;
    }

    setIsLoadingUnifyTargets(true);

    try {
      // ユニークなmyca_item_id + rarity + condition_option_idの組み合わせを取得
      const uniqueProducts = baseProducts.reduce((acc, product) => {
        const key = `${product.item_myca_item_id}_${product.item_rarity}_${product.condition_option_id}`;
        if (
          !acc.some(
            (p) =>
              `${p.item_myca_item_id}_${p.item_rarity}_${p.condition_option_id}` ===
              key,
          )
        ) {
          acc.push(product);
        }
        return acc;
      }, [] as ProductSearchResult[]);

      const clientAPI = createClientAPI();

      // 各ユニークな商品について統一対象商品を並列取得
      const fetchPromises = uniqueProducts.map(async (product) => {
        try {
          const response = await clientAPI.product.listProducts({
            storeID: storeId,
            take: 10000, // 統一対象商品は多めに取得
            skip: 0,
            isActive: true,
            ecAvailable: true,
            isMycalinksItem: true,
            mycaItemId: product.item_myca_item_id || undefined,
            itemRarity: product.item_rarity || undefined,
            conditionOptionId: product.condition_option_id || undefined,
            includesSummary: true,
            includesImages: true,
          });

          // CustomErrorでない場合のみproductsを返す
          return 'products' in response ? response.products : [];
        } catch (error) {
          console.error(
            `商品${product.item_myca_item_id}の統一対象取得エラー:`,
            error,
          );
          return [];
        }
      });

      // すべてのAPIレスポンスを並列実行
      const allResults = await Promise.all(fetchPromises);

      // 結果をフラット化
      const allTargetProducts = allResults.flat();

      setAllUnifyTargetProducts(allTargetProducts);
    } catch (error) {
      console.error('統一対象商品の取得に失敗しました:', error);
      setAllUnifyTargetProducts([]);
    } finally {
      setIsLoadingUnifyTargets(false);
    }
  };

  // baseProductsまたはenableUnifyPricingが変更されたら統一対象商品を取得
  useEffect(() => {
    if (enabled && enableUnifyPricing && baseProducts.length > 0) {
      fetchAllUnifyTargets();
    }
  }, [
    enabled,
    enableUnifyPricing,
    baseProducts.length,
    baseProducts.map((p) => p.id).join(','),
  ]);

  // 基準商品にメモや画像がある場合は統一機能を無効化
  const baseProductsHaveMemoOrImages = useMemo(() => {
    return baseProducts.every((product) => {
      const hasMemo = product.description && product.description.trim() !== '';
      const hasImages = product.images && product.images.length > 0;
      return hasMemo || hasImages;
    });
  }, [baseProducts]);

  // 統一対象商品をフィルタリング
  const unifyTargetProducts = useMemo(() => {
    if (
      !enableUnifyPricing ||
      !baseProducts.length ||
      baseProductsHaveMemoOrImages
    )
      return [];

    return filterUnifyTargetProducts(allUnifyTargetProducts, baseProducts);
  }, [
    allUnifyTargetProducts,
    baseProducts,
    enableUnifyPricing,
    baseProductsHaveMemoOrImages,
  ]);

  const unifyTargetCount = unifyTargetProducts.length;

  // 価格統一実行
  const executeUnifyPricing = useCallback(
    async (price: number): Promise<void> => {
      if (!unifyTargetProducts.length) return;

      const promises = unifyTargetProducts.map((product) =>
        updateProduct(storeId, product.id, {
          specificEcSellPrice: price,
          // mycalinksEcEnabledは変更しない（出品状態は維持）
        }),
      );

      const results = await Promise.allSettled(promises);

      const failures = results.filter((result) => result.status === 'rejected');
      if (failures.length > 0) {
        throw new Error(`${failures.length}個の商品の価格統一に失敗しました`);
      }
    },
    [unifyTargetProducts, updateProduct, storeId],
  );

  // 統一対象商品を再検索
  const refreshUnifyTargets = () => {
    if (enableUnifyPricing && baseProducts.length > 0) {
      fetchAllUnifyTargets();
    }
  };

  // チェックボックスのON/OFF時の処理
  const handleEnableUnifyPricingChange = (enabled: boolean) => {
    setEnableUnifyPricing(enabled);
    if (!enabled) {
      setUnifyPrice(undefined);
      // 統一対象商品をクリア
      setAllUnifyTargetProducts([]);
    }
  };

  return {
    // 状態
    enableUnifyPricing,
    setEnableUnifyPricing: handleEnableUnifyPricingChange,
    unifyPrice,
    setUnifyPrice,
    unifyTargetProducts,
    unifyTargetCount,
    loading: isLoadingUnifyTargets,

    // 関数
    executeUnifyPricing,
    refreshUnifyTargets,
    baseProducts,
    baseProductsHaveMemoOrImages,
  };
};
