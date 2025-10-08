import { useSearchParams } from 'next/navigation';
import { useStore } from '@/contexts/StoreContext';
import { useWholesalePrice } from '@/feature/products/hooks/useWholesalePrice';
import { usePackInitialization } from '@/feature/stock/register/pack/hooks/usePackInitialization';
import { usePackNavigation } from '@/feature/stock/register/pack/hooks/usePackNavigation';
import { usePackOpeningData } from '@/feature/stock/register/pack/hooks/usePackOpeningData';
import { usePackSelection } from '@/feature/stock/register/pack/hooks/usePackSelection';
import { PackRegisterState } from '@/feature/stock/register/pack/types';
import { usePackConfirmation } from '@/feature/stock/register/pack/hooks/usePackConfirmation';

/**
 * パック開封の全体状態を管理するメインフック
 */
export const usePackRegisterState = (): PackRegisterState => {
  const { store } = useStore();
  const searchParams = useSearchParams();
  const fixId = Number(searchParams.get('fixId')) || undefined;

  // パック選択のカスタムフック
  const selectionState = usePackSelection();
  // 決まっている/ランダムカード登録のカスタムフック
  const openingDataState = usePackOpeningData(
    store.id,
    selectionState.selectedPack?.itemId,
    selectionState.registerParams.isFixedPack,
  );
  // 開封結果確認のカスタムフック
  const confirmationState = usePackConfirmation();

  // ナビゲーション管理のカスタムフック
  const navigationState = usePackNavigation({
    registerParams: selectionState.registerParams,
    items: openingDataState.items,
    setOpenNumber: openingDataState.setOpenNumber,
    setSelectedStorageProduct: selectionState.setSelectedStorageProduct,
    setItemsToRegister: confirmationState.setItemsToRegister,
    setSelectedPack: selectionState.setSelectedPack,
    setRegisterParams: selectionState.setRegisterParams,
    setItems: openingDataState.setItems,
    setRandomCardsPerPack: confirmationState.setRandomCardsPerPack,
  });

  // 仕入価格のカスタムフック
  const { wholesalePrice, fetchWholesalePrice } = useWholesalePrice();

  // 初期化処理のカスタムフック
  const { storageProducts, listStorageProducts } = usePackInitialization({
    storeId: store.id,
    fixId,
    progress: navigationState.progress,
    selectedPack: selectionState.selectedPack,
    openNumber: openingDataState.openNumber,
    setSelectedPack: selectionState.setSelectedPack,
    setOpenNumber: openingDataState.setOpenNumber,
    setRegisterParams: selectionState.setRegisterParams,
    setRandomCardsPerPack: confirmationState.setRandomCardsPerPack,
    setItemsToRegister: confirmationState.setItemsToRegister,
    setSelectedStorageProduct: selectionState.setSelectedStorageProduct,
    setRestoredConditionOptionId:
      confirmationState.setRestoredConditionOptionId,
    setProgress: navigationState.setProgress,
    fetchWholesalePrice,
  });

  // 全ての状態を統合して返却
  return {
    // 店舗情報
    storeId: store.id,

    // 各機能の状態
    ...selectionState,
    ...openingDataState,
    ...confirmationState,
    ...navigationState,

    // 仕入価格
    wholesalePrice,
    fetchWholesalePrice,

    // ストレージ商品
    storageProducts,
    listStorageProducts,

    // 履歴復元用
    fixId,
  };
};
