import { InsufficientProduct } from '@/feature/deck/useDeckPurchaseOptionForm';
import { EcPaymentMethod } from '@prisma/client';
import { ConvenienceCode } from '@/app/ec/(core)/constants/convenience';

/**
 * ECローカルストレージ管理モジュール
 *
 * 主な機能:
 * - 決済方法の保存・取得
 * - コンビニコードの保存・取得
 * - その他ECに関連するデータの永続化
 */

/**
 * 商品一覧の表示形式の定数
 */
export const VIEW_TYPES = {
  GRID: 'grid',
  LIST: 'list',
} as const;

export type ViewType = (typeof VIEW_TYPES)[keyof typeof VIEW_TYPES];

/**
 * ECデータをローカルストレージに保存するデータ型
 */
export type EcStorageData = {
  ec_last_payment_method?: EcPaymentMethod;
  ec_last_convenience_code?: ConvenienceCode;
  insufficient_products?: InsufficientProduct[];
  // 表示形式（グリッド/リスト）
  item_list_view_type?: ViewType;
};

/**
 * ECデータをローカルストレージに保存するキー
 */
export const ecStorageKey = 'ec';

/**
 * ECデータをローカルストレージから取得する
 */
export const getEcStorageData = (): EcStorageData | null => {
  try {
    const ecDataStr = localStorage.getItem(ecStorageKey);
    if (!ecDataStr) return null;

    return JSON.parse(ecDataStr) as EcStorageData;
  } catch (error) {
    console.warn('Failed to get EC storage data:', error);
    return null;
  }
};

/**
 * ECデータをローカルストレージに保存する
 */
export const setEcStorageData = (data: EcStorageData): void => {
  try {
    const currentData = getEcStorageData() || {};
    const newData = { ...currentData, ...data };
    localStorage.setItem(ecStorageKey, JSON.stringify(newData));
  } catch (error) {
    console.warn('Failed to set EC storage data:', error);
  }
};

/**
 * 最後に選択した決済方法を取得する
 */
export const getLastPaymentMethod = (): EcPaymentMethod | null => {
  const data = getEcStorageData();
  return data?.ec_last_payment_method || null;
};

/**
 * 決済方法を保存する
 */
export const savePaymentMethod = (method: EcPaymentMethod): void => {
  setEcStorageData({ ec_last_payment_method: method });
};

/**
 * 最後に選択したコンビニコードを取得する
 */
export const getLastConvenienceCode = (): ConvenienceCode | null => {
  const data = getEcStorageData();
  return data?.ec_last_convenience_code || null;
};

/**
 * コンビニコードを保存する
 */
export const saveConvenienceCode = (code: ConvenienceCode): void => {
  setEcStorageData({ ec_last_convenience_code: code });
};

/**
 * 不足商品リストを保存する
 */
export const saveInsufficientProducts = (
  products: InsufficientProduct[],
): void => {
  if (products && products.length > 0) {
    setEcStorageData({ insufficient_products: products });
  } else {
    // 空配列の場合は削除
    const currentData = getEcStorageData();
    if (currentData) {
      delete currentData.insufficient_products;
      if (Object.keys(currentData).length > 0) {
        localStorage.setItem(ecStorageKey, JSON.stringify(currentData));
      } else {
        localStorage.removeItem(ecStorageKey);
      }
    }
  }
};

/**
 * 不足商品リストを取得する
 */
export const getInsufficientProducts = (): InsufficientProduct[] | null => {
  const data = getEcStorageData();
  return data?.insufficient_products || null;
};

/**
 * 不足商品リストをクリアする
 */
export const clearInsufficientProducts = (): void => {
  const currentData = getEcStorageData();
  if (currentData) {
    delete currentData.insufficient_products;
    if (Object.keys(currentData).length > 0) {
      localStorage.setItem(ecStorageKey, JSON.stringify(currentData));
    } else {
      localStorage.removeItem(ecStorageKey);
    }
  }
};

/**
 * 商品一覧の表示形式（グリッド/リスト）を取得
 */
export const getItemListViewType = (): ViewType => {
  const data = getEcStorageData();
  return data?.item_list_view_type === VIEW_TYPES.LIST
    ? VIEW_TYPES.LIST
    : VIEW_TYPES.GRID;
};

/**
 * 商品一覧の表示形式（グリッド/リスト）を保存
 */
export const saveItemListViewType = (type: ViewType): void => {
  setEcStorageData({ item_list_view_type: type });
};

/**
 * ECストレージデータをクリアする
 */
export const clearEcStorageData = (): void => {
  try {
    localStorage.removeItem(ecStorageKey);
  } catch (error) {
    console.warn('Failed to clear EC storage data:', error);
  }
};
