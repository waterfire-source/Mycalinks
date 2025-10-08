import React, { useEffect, useRef } from 'react';
import { useOpenedPack } from '@/feature/stock/register/pack/hooks/useOpenedPack';
import { useProducts } from '@/feature/products/hooks/useProducts';
import {
  ProgressType,
  RegisterParams,
} from '@/feature/stock/register/pack/types';
import { PackItemType } from '@/feature/stock/register/pack/components/PackRegisterTab';
import { PackType } from '@/feature/stock/register/pack/components/PackTable';

interface UsePackInitializationProps {
  storeId: number;
  fixId?: number;
  progress: ProgressType;
  selectedPack: PackType | undefined;
  openNumber: number;
  setSelectedPack: (pack: PackType | undefined) => void;
  setOpenNumber: (value: number) => void;
  setRegisterParams: (params: RegisterParams) => void;
  setRandomCardsPerPack: (count: number) => void;
  setItemsToRegister: React.Dispatch<React.SetStateAction<PackItemType[]>>;
  setSelectedStorageProduct: (value: number | string) => void;
  setRestoredConditionOptionId: (id: number | null) => void;
  setProgress: (progress: ProgressType) => void;
  fetchWholesalePrice: (productId: number, openNumber: number) => void;
}

/**
 * パック開封の初期化処理を行うカスタムフック
 */
export const usePackInitialization = ({
  storeId,
  fixId,
  progress,
  selectedPack,
  openNumber,
  setSelectedPack,
  setOpenNumber,
  setRegisterParams,
  setRandomCardsPerPack,
  setItemsToRegister,
  setSelectedStorageProduct,
  setRestoredConditionOptionId,
  setProgress,
  fetchWholesalePrice,
}: UsePackInitializationProps) => {
  const { buildEnhancedPackData } = useOpenedPack();
  const { storageProducts, listStorageProducts } = useProducts();

  const hasLoadedFixId = useRef<number | null>(null);
  const hasLoadedWholesalePrice = useRef<string | null>(null);

  // ストレージ商品を取得
  useEffect(() => {
    listStorageProducts(storeId);
  }, [listStorageProducts, storeId]);

  // fixIdによる履歴データ復元処理
  useEffect(() => {
    const fetchProductFromFixId = async (fixId: number) => {
      try {
        const enhancedData = await buildEnhancedPackData(fixId);

        if (enhancedData) {
          // パック情報を設定
          const packData: PackType = {
            itemId: enhancedData.packInfo.itemId,
            productId: enhancedData.packInfo.productId,
            displayName: enhancedData.packInfo.productName,
            imageUrl: enhancedData.packInfo.image_url,
            stockNumber: enhancedData.packInfo.currentStock,
            genreName: enhancedData.packInfo.genreName,
            categoryName: enhancedData.packInfo.categoryName,
          };
          setSelectedPack(packData);

          // ランダムカード封入枚数を復元
          const totalCardsPerPack =
            enhancedData.openingDetails.item_count_per_pack || 0;
          const fixedCardsPerPack = enhancedData.items.reduce((sum, item) => {
            return sum + (item.pack_item_count || 0);
          }, 0);
          const randomCardsPerPackFromHistory = Math.max(
            0,
            totalCardsPerPack - fixedCardsPerPack,
          );

          // 開封数情報を復元
          setOpenNumber(enhancedData.openingDetails.item_count);
          setRegisterParams({
            openNumber: enhancedData.openingDetails.item_count,
            isFixedPack: true,
            isRandomPack: randomCardsPerPackFromHistory > 0,
            selectedStorageProduct: '',
          });

          // 開封結果商品を復元
          const restoredItems = [...enhancedData.items];
          setRandomCardsPerPack(randomCardsPerPackFromHistory);

          // 未登録カード情報を復元
          restoredItems.push({
            myca_item_id: -1,
            image_url: '',
            displayNameWithMeta: '未登録カード',
            quantity: enhancedData.openingDetails.unregister_item_count || 0,
            pos_item_products_stock_number: null,
            pack_item_count: null,
            wholesale_price:
              enhancedData.openingDetails.unregister_product_wholesale_price ||
              0,
            genre_name: null,
            display_name: null,
            cardnumber: null,
            cardseries: null,
            expansion: null,
            rarity: null,
            myca_pack_id: null,
            pos_item_id: undefined,
          });

          setItemsToRegister(restoredItems);

          // 未登録カード処理方法を復元
          if (enhancedData.openingDetails.unregister_product_id) {
            setSelectedStorageProduct(
              enhancedData.openingDetails.unregister_product_id,
            );
          } else {
            setSelectedStorageProduct('loss');
          }

          // コンディションオプションIDを復元
          if (enhancedData.openingDetails.condition_option_id) {
            setRestoredConditionOptionId(
              enhancedData.openingDetails.condition_option_id,
            );
          }

          // 確認画面に直接遷移
          setProgress('confirm');
        }
      } catch (error) {
        console.error('Failed to fetch pack history data:', error);
      }
    };

    if (fixId && fixId !== hasLoadedFixId.current) {
      hasLoadedFixId.current = fixId;
      fetchProductFromFixId(fixId);
    }
  }, [
    fixId,
    buildEnhancedPackData,
    setSelectedPack,
    setOpenNumber,
    setRegisterParams,
    setRandomCardsPerPack,
    setItemsToRegister,
    setSelectedStorageProduct,
    setRestoredConditionOptionId,
    setProgress,
  ]);

  // 確認画面へ遷移したら仕入れ値を取得
  useEffect(() => {
    if (progress === 'confirm' && selectedPack) {
      const wholesalePriceKey = `${selectedPack.productId}-${openNumber}`;
      if (hasLoadedWholesalePrice.current !== wholesalePriceKey) {
        hasLoadedWholesalePrice.current = wholesalePriceKey;
        fetchWholesalePrice(Number(selectedPack.productId), openNumber);
      }
    }
  }, [progress, selectedPack, openNumber, fetchWholesalePrice]);

  return {
    storageProducts,
    listStorageProducts,
  };
};
