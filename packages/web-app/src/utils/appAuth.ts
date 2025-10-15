import {
  getAppStorageData,
  setAppStorageData,
  appStorageKey,
} from '@/app/ec/(core)/utils/appStorage';
import { customFetch, METHOD, CustomError } from '@/api/implement';
import dayjs from 'dayjs';

/**
 * アプリ認証トークンユーティリティ
 */

// 現在のアプリユーザーID（グローバル変数）
let appUserId: number | null = null;

// APIエンドポイント
const appApiEndpoint = process.env.NEXT_PUBLIC_MYCA_APP_API_URL;

type AppToken = {
  exp: number;
  id: number;
};

/**
 * アプリ側のトークンを取得する
 */
export const getAppToken = async (): Promise<string | null> => {
  const appData = getAppStorageData();

  // 有効そうなショートトークンがあったらそれを使う
  if (appData?.shortToken && validateAppToken(appData.shortToken)) {
    return appData.shortToken;
  }

  // ロングトークンがあったらショートトークンを発行させて実行し直す
  else if (appData?.longToken && validateAppToken(appData.longToken)) {
    // この場でショートトークンを発行する
    const res = await customFetch({
      method: METHOD.POST,
      url: `${appApiEndpoint}/user/account/get/`,
      body: {
        user: appUserId,
      },
      customHeaders: {
        MycaToken: appData.longToken,
      },
    })();

    // それでもうまく発行できなかったらnullをかえす
    if (res instanceof CustomError) {
      localStorage.removeItem(appStorageKey);
      return null;
    }

    // 新しいshortTokenをローカルストレージに保存しつつ、APIをセットアップし直す
    const { newShortToken } = res;
    setAppStorageData({
      ...appData,
      shortToken: newShortToken,
    });

    // そしてもう一回このAPIを呼び出す
    return await getAppToken();
  }

  // トークンの有効期限が切れているか、存在しなかったらnullをかえす
  else {
    localStorage.removeItem(appStorageKey);
    appUserId = null;
    return null;
  }
};

/**
 * アプリトークンの検証
 */
const validateAppToken = (token: string): boolean => {
  const splitted = token.split('.');

  if (splitted.length != 3) return false;

  const decoded = atob(splitted[1]);
  let jsonData: AppToken | null = null;

  try {
    jsonData = JSON.parse(decoded);
  } catch {
    return false;
  }

  // 有効期限を確認
  if (!jsonData?.exp) return false;

  const thisExp = dayjs(jsonData.exp);

  if (dayjs().isAfter(thisExp)) return false;

  // ユーザーIDを格納
  appUserId = jsonData.id;

  return true;
};

export const getAppUserId = async (): Promise<number | null> => {
  await getAppToken();
  return appUserId;
};

/**
 * OpenAPI用の認証ヘッダー生成
 */
export const getAppHeaders = async (): Promise<Record<string, string>> => {
  const token = await getAppToken();
  return token ? { MycaToken: token } : {};
};
