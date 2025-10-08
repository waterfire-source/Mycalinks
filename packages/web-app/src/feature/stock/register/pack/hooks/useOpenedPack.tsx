import { useStore } from '@/contexts/StoreContext';
import { useErrorAlert } from '@/hooks/useErrorAlert';
import { MycaPosApiClient } from 'api-generator/client';
import { z } from 'zod';
import { useState, useCallback } from 'react';
import { getOpenPackHistoryApi } from 'api-generator';
import { createClientAPI } from '@/api/implement';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { usePackItems } from '@/feature/item/hooks/useIPackItems';
import { PackItemType } from '@/feature/stock/register/pack/components/PackRegisterTab';

// Product APIのレスポンス型
type ProductDetail = BackendProductAPI[0]['response']['200']['products'][0];

// パック詳細情報のインターフェース
export interface EnhancedPackData {
  packInfo: {
    itemId: number;
    productId: number;
    productName: string;
    itemName: string;
    image_url: string | null;
    condition_option_display_name: string;
    currentStock: number;
    genreName: string;
    categoryName: string;
  };
  items: PackItemType[];
  openingDetails: {
    item_count: number;
    item_count_per_pack?: number;
    staff_account_id?: number;
    margin_wholesale_price?: number;
    unregister_item_count?: number;
    unregister_product_id?: number;
    unregister_product_wholesale_price?: number;
    condition_option_id?: number; // 追加：登録時に使用されたコンディション
  };
}

/**
 * パック開封履歴の取得・処理を行うカスタムフック
 * - 開封済みパックの履歴データ取得
 * - 商品詳細情報の統合
 * - 取り消し時の在庫数を計算してデータ作成
 */
export const useOpenedPack = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [openedPack, setOpenedPack] =
    useState<z.infer<typeof getOpenPackHistoryApi.response>>();
  const { fetchPackItems } = usePackItems();
  const { handleError } = useErrorAlert();
  const { store } = useStore();
  const apiClient = new MycaPosApiClient({
    BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
  });
  const clientAPI = createClientAPI();

  // 指定したhistoryIdのパック開封履歴を取得
  const fetchOpenedPack = async (historyId: number) => {
    setIsLoading(true);
    try {
      const res = await apiClient.product.getOpenPackHistory({
        storeId: store.id,
        id: historyId,
      });

      if (!res) {
        setOpenedPack(res);
      }
      return res;
    } catch (e) {
      handleError(e);
    } finally {
      setIsLoading(false);
    }
  };

  // 指定した商品IDリストから商品詳細情報を取得
  const fetchProductDetails = useCallback(
    async (productIds: number[]): Promise<ProductDetail[]> => {
      try {
        const res = await clientAPI.product.listProducts({
          storeID: store.id,
          id: productIds,
        });

        // CustomErrorかどうかをチェック
        if (res && typeof res === 'object' && 'products' in res) {
          return res.products || [];
        }

        return [];
      } catch (e) {
        handleError(e);
        return [];
      }
    },
    [clientAPI, store.id, handleError],
  );

  // パック開封履歴から詳細データを作成（取り消し時の在庫数も計算）
  const buildEnhancedPackData = useCallback(
    async (historyId: number): Promise<EnhancedPackData | null> => {
      try {
        setIsLoading(true);

        // パック履歴を取得（直接API呼び出し）
        const historyResponse = await apiClient.product.getOpenPackHistory({
          storeId: store.id,
          id: historyId,
        });
        if (!historyResponse?.openPackHistories?.[0]) {
          return null;
        }

        const historyData = historyResponse.openPackHistories[0];

        // 関連する商品IDを収集
        const productIds: number[] = [];
        if (historyData.from_product_id) {
          productIds.push(historyData.from_product_id);
        }
        if (historyData.to_products) {
          historyData.to_products.forEach((product) => {
            if (product.product_id) {
              productIds.push(product.product_id);
            }
          });
        }

        // 商品詳細情報を取得
        const productDetails = await fetchProductDetails(productIds);

        // パック商品情報を構築
        const packProduct = productDetails.find(
          (p) => p.id === historyData.from_product_id,
        );

        // パック構成情報を取得（myca_item_idを正しく取得するため）
        const packItems = await fetchPackItems(
          store.id,
          packProduct?.item_id || historyData.from_product?.item?.id || 0,
          true,
        );

        // ロールバック後のパック在庫数を計算（現在の在庫数 + 開封数）
        const currentPackStock = packProduct?.stock_number || 0;
        const openedCount = historyData.item_count || 0;
        const rollbackAdjustedPackStock = currentPackStock + openedCount;

        const packInfo = {
          itemId:
            packProduct?.item_id || historyData.from_product?.item?.id || 0,
          productId: historyData.from_product_id,
          productName:
            packProduct?.display_name ||
            `パック商品 ${historyData.from_product_id}`,
          itemName: packProduct?.item_name || '',
          image_url: packProduct?.image_url || null,
          condition_option_display_name:
            packProduct?.condition_option_display_name || '',
          currentStock: rollbackAdjustedPackStock, // ロールバック後の在庫数を設定
          genreName: packProduct?.item_genre_display_name || '',
          categoryName: packProduct?.item_category_display_name || '',
        };

        // 開封結果商品情報を構築
        const items: PackItemType[] =
          historyData.to_products?.map((product) => {
            const productDetail = productDetails.find(
              (p) => p.id === product.product_id,
            );

            // packItemsから同じproduct_idを持つエントリを探してmyca_item_idを取得
            const matchingPackItem = packItems?.find(
              (packItem) => packItem.pos_item_id === productDetail?.item_id,
            );

            // ロールバック後の在庫数を計算（現在の在庫数 - 履歴の登録数）
            const currentItemStock = productDetail?.stock_number || 0;
            const registeredCount = product.item_count || 0;
            const rollbackAdjustedItemStock =
              currentItemStock - registeredCount;

            return {
              myca_item_id: matchingPackItem?.myca_item_id || 0,
              displayNameWithMeta:
                productDetail?.displayNameWithMeta ||
                productDetail?.display_name ||
                `商品 ${product.product_id}`,
              image_url: productDetail?.image_url || null,
              genre_name: productDetail?.item_genre_display_name || null,
              display_name: productDetail?.display_name || null,
              cardnumber: productDetail?.item_cardnumber || null,
              cardseries: productDetail?.item_name || null, // card seriesに対応するフィールドを設定
              expansion: productDetail?.item_expansion || null,
              rarity: productDetail?.item_rarity || null,
              myca_pack_id: matchingPackItem?.myca_pack_id || null,
              pos_item_id: productDetail?.item_id || product.product_id,
              quantity: product.item_count || 0,
              pack_item_count: null,
              pos_item_products_stock_number: rollbackAdjustedItemStock, // ロールバック後の在庫数を設定
              wholesale_price: product.wholesale_price || 0,
            };
          }) || [];

        // 開封結果商品からコンディションオプションIDを取得（最初の商品から取得）
        const firstProduct = historyData.to_products?.[0];
        const firstProductDetail = firstProduct
          ? productDetails.find((p) => p.id === firstProduct.product_id)
          : null;
        const conditionOptionId =
          firstProductDetail?.condition_option_id || undefined;

        // 開封詳細情報を構築
        const openingDetails = {
          item_count: historyData.item_count || 0,
          item_count_per_pack: historyData.item_count_per_pack || undefined,
          staff_account_id: historyData.staff_account_id || undefined,
          margin_wholesale_price:
            historyData.margin_wholesale_price || undefined,
          unregister_item_count: historyData.unregister_item_count || undefined,
          unregister_product_id: historyData.unregister_product_id || undefined,
          unregister_product_wholesale_price:
            historyData.unregister_product_wholesale_price || undefined,
          condition_option_id: conditionOptionId,
        };

        return {
          packInfo,
          items,
          openingDetails,
        };
      } catch (e) {
        handleError(e);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, store.id, fetchProductDetails, handleError],
  );

  return {
    fetchOpenedPack,
    fetchProductDetails,
    buildEnhancedPackData,
    isLoading,
    openedPack,
  };
};
