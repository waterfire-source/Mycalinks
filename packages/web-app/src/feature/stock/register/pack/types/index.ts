// パック開封機能で使用する型定義

import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { PackItemType } from '@/feature/stock/register/pack/components/PackRegisterTab';
import { PackType } from '@/feature/stock/register/pack/components/PackTable';
import { WholesalePriceHistoryResourceType } from '@prisma/client';

/**
 * 開封パラメータの型定義
 */
export interface RegisterParams {
  openNumber?: number;
  isFixedPack: boolean;
  isRandomPack: boolean;
  selectedStorageProduct: number | string;
}

/**
 * プログレスの状態型
 */
export type ProgressType =
  | 'select-pack'
  | 'register-fixed-pack'
  | 'register-random-pack'
  | 'confirm';

/**
 * パック選択機能のカスタムフックの型
 */
export interface PackSelectionState {
  selectedPack: PackType | undefined;
  setSelectedPack: (pack: PackType | undefined) => void;
  registerParams: RegisterParams;
  setRegisterParams: (params: RegisterParams) => void;
  selectedStorageProduct: number | string;
  setSelectedStorageProduct: (value: number | string) => void;
  isDirty: boolean;
}

/**
 * パック開封データ状態の型
 */
export interface PackOpeningDataState {
  packItems: any;
  fetchPackItems: (storeId: number, itemId: number) => void;
  items: PackItemType[];
  setItems: (items: PackItemType[]) => void;
  openNumber: number;
  setOpenNumber: (value: number) => void;
  isDisabledEditOpenNumber: boolean;
  setIsDisabledEditOpenNumber: (disabled: boolean) => void;
}

/**
 * 確認画面状態の型（基本状態のみ）
 */
export interface PackConfirmationState {
  itemsToRegister: PackItemType[];
  setItemsToRegister: React.Dispatch<React.SetStateAction<PackItemType[]>>;
  randomCardsPerPack: number;
  setRandomCardsPerPack: (count: number) => void;
  restoredConditionOptionId: number | null;
  setRestoredConditionOptionId: (id: number | null) => void;
}

/**
 * ナビゲーション状態の型
 */
export interface PackNavigationState {
  progress: ProgressType;
  handleNextProgress: () => void;
  handleBackProgress: () => void;
  handleResetProgress: () => void;
}

/**
 * 仕入価格管理状態の型
 */
export interface WholesalePriceState {
  wholesalePrice: BackendProductAPI[9]['response']['200'] | undefined;
  fetchWholesalePrice: (
    product_id: number,
    itemCount?: number,
    isReturn?: boolean,
    reverse?: true,
    resourceType?: WholesalePriceHistoryResourceType,
    resourceID?: number,
  ) => Promise<BackendProductAPI[9]['response']['200'] | void>;
}

/**
 * パック開封全体の状態型（usePackRegisterState用）
 */
export interface PackRegisterState
  extends PackSelectionState,
    PackOpeningDataState,
    PackConfirmationState,
    PackNavigationState,
    WholesalePriceState {
  // 店舗情報
  storeId: number;

  // ストレージ商品関連
  storageProducts: any[] | undefined;
  listStorageProducts: (storeId: number) => void;

  // 履歴復元用
  fixId?: number;
}

/**
 * ステップコンポーネントの共通型（基本データのみ）
 */
export interface BaseStepProps {
  // 基本データ
  storeId: number;
  storageProducts: any[] | undefined;

  // ナビゲーション
  handleNextProgress: () => void;
  handleBackProgress: () => void;
  handleResetProgress: () => void;
}
