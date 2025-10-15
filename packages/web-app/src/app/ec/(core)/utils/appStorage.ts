/**
 * アプリケーションのローカルストレージ管理モジュール
 *
 * 主な機能:
 * - アプリケーションデータのローカルストレージへの保存
 * - ローカルストレージからのデータ取得
 * - トークン情報(longToken, shortToken)の永続化
 */

/**
 * アプリデータをローカルストレージに保存するデータ型
 */
export type AppStorageData = {
  longToken?: string;
  shortToken?: string;
};

/**
 * アプリデータをローカルストレージに保存するキー
 */
export const appStorageKey = 'app';

/**
 * アプリデータをローカルストレージから取得する
 */
export const getAppStorageData = (): AppStorageData | null => {
  const appDataStr = localStorage.getItem(appStorageKey);
  if (!appDataStr) return null;

  try {
    return JSON.parse(appDataStr) as AppStorageData;
  } catch {
    return null;
  }
};

/**
 * アプリデータをローカルストレージに保存する
 */
export const setAppStorageData = (data: AppStorageData) => {
  localStorage.setItem(appStorageKey, JSON.stringify(data));
};
