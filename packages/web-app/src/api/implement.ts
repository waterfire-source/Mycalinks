import { ClientAPI } from '@/api/client';
import { storeImplement } from '@/api/frontend/store/implement';
import { itemImplement } from '@/api/frontend/item/implement';
import { mycaAppImplement } from '@/api/frontend/mycaApp/implement';
import { productImplement } from '@/api/frontend/product/implement';
import { lossImplement } from '@/api/frontend/loss/implement';
import { transactionImplement } from '@/api/frontend/transaction/implement';
import { inventoryImplement } from '@/api/frontend/inventory/implement';
import { functionsImplement } from '@/api/frontend/functions/implement';
import { saleImplement } from '@/api/frontend/sale/implement';
import { stockingImplement } from '@/api/frontend/stocking/implement';
import { customerImplement } from '@/api/frontend/customer/implement';
import { accountImplement } from '@/api/frontend/account/implement';
import { accountGroupImplement } from '@/api/frontend/accountGroup/implement';
import { corporationImplement } from '@/api/frontend/corporation/implement';
import { appraisalImplement } from '@/api/frontend/appraisal/implement';
import { categoryImplement } from '@/api/frontend/category/implement';
import { genreImplement } from '@/api/frontend/genre/implement';
import { registerImplement } from '@/api/frontend/register/implement';
import { conditionOptionImplement } from '@/api/frontend/conditionOption/implement';
import { squareImplement } from '@/api/frontend/square/implement';
import { memoImplement } from '@/api/frontend/memo/implement';
import { ecImplement } from '@/api/frontend/ec/implement';
import { authImplement } from '@/api/frontend/auth/implement';
import { advertisementImplement } from '@/api/frontend/advertisement/implement';
import { mycalinksTransactionImplement } from '@/api/frontend/mycalinks/transaction/implement';
import {
  appStorageKey,
  getAppStorageData,
  setAppStorageData,
} from '@/app/ec/(core)/utils/appStorage';
import dayjs from 'dayjs';
import { myPageCustomerImplement } from '@/api/frontend/mycalinks/myPage/implement';
import { consignmentImplement } from '@/api/frontend/consignment/implement';
export class CustomError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const createClientAPI = () => new ClientAPIImplement();

class ClientAPIImplement implements ClientAPI {
  readonly item;
  readonly store;
  readonly product;
  readonly loss;
  readonly transaction;
  readonly customer;
  readonly account;
  readonly accountGroup;
  readonly stocking;
  readonly sale;
  readonly functions;
  readonly inventory;
  readonly corporation;
  readonly mycaApp;
  readonly appraisal;
  readonly category;
  readonly genre;
  readonly memo;
  readonly register;
  readonly purchaseTable;
  readonly conditionOption;
  readonly square;
  readonly ec;
  readonly auth;
  readonly advertisement;
  readonly mycalinksTransaction;
  readonly myPageCustomer;
  readonly consignment;

  constructor() {
    this.item = itemImplement();
    this.store = storeImplement();
    this.product = productImplement();
    this.loss = lossImplement();
    this.transaction = transactionImplement();
    this.customer = customerImplement();
    this.account = accountImplement();
    this.accountGroup = accountGroupImplement();
    this.stocking = stockingImplement();
    this.sale = saleImplement();
    this.functions = functionsImplement();
    this.inventory = inventoryImplement();
    this.corporation = corporationImplement();
    this.mycaApp = mycaAppImplement();
    this.appraisal = appraisalImplement();
    this.category = categoryImplement();
    this.genre = genreImplement();
    this.memo = memoImplement();
    this.register = registerImplement();
    this.conditionOption = conditionOptionImplement();
    this.square = squareImplement();
    this.ec = ecImplement();
    this.auth = authImplement();
    this.advertisement = advertisementImplement();
    this.mycalinksTransaction = mycalinksTransactionImplement();
    this.myPageCustomer = myPageCustomerImplement();
    this.consignment = consignmentImplement();
  }
}

export enum METHOD {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}
type CustomFetchProps = {
  method: METHOD;
  url: string;
  params?: { [key: string]: any };
  customHeaders?: Record<string, string>; //カスタムヘッダー
  body?: any;
};
export const customFetch = (
  { method, url, params, body, customHeaders }: CustomFetchProps,
  isFormData?: boolean,
) => {
  const _url = createUrl(url, params);

  const headers = {
    ...(!isFormData
      ? {
          'Content-Type': 'application/json',
        }
      : {}),
    ...customHeaders,
  };

  return async () => {
    const response = await fetch(_url, {
      method: method,
      headers,
      body: !isFormData ? JSON.stringify(body) : body,
    });

    if (!response.ok || response.status === 211) {
      const errorResponse = await response.json().catch(() => ({
        error: response.statusText,
      }));

      return new CustomError(
        errorResponse.error || response.statusText,
        response.status,
      );
    }

    return response.json();
  };
};

const createUrl = (baseURL: string, params?: { [key: string]: any }): URL => {
  const url = new URL(baseURL, process.env.NEXT_PUBLIC_ORIGIN);

  if (params)
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        let formattedValue: string;

        switch (value.constructor) {
          case Array:
            formattedValue = value.join(',');
            break;
          case Number:
            formattedValue = value.toString();
            break;
          case Date:
            formattedValue = value.toISOString();
            break;
          default:
            formattedValue = value;
        }

        url.searchParams.append(key, formattedValue);
      }
    });

  return url;
};

const originApiEndpoint = process.env.NEXT_PUBLIC_ORIGIN;
const ecApiEndpoint = process.env.NEXT_PUBLIC_EC_ORIGIN;
const appApiEndpoint = process.env.NEXT_PUBLIC_MYCA_APP_API_URL;
export type AppEndpointType = 'ORIGIN' | 'EC' | 'MYCA_APP_API';

// アプリの認証情報が必要な場合のカスタムフェッチ
export const appCustomFetch = async (
  options: CustomFetchProps,
  endpointType: AppEndpointType = 'ORIGIN',
  noToken: boolean = false, // 明示的にトークンを載せないことを指定するフラグ
  isFormData?: boolean, // 明示的にFormDataを載せることを指定するフラグ
) => {
  const token = await getAppToken();

  // トークンがあったら載せる
  const customHeaders = options.customHeaders ?? {};
  if (!noToken && token) {
    customHeaders.MycaToken = token;
  }

  // APIエンドポイントを決定
  let baseUrl: string;
  if (endpointType === 'MYCA_APP_API') {
    baseUrl = appApiEndpoint ?? '';
  } else if (endpointType === 'EC') {
    baseUrl = ecApiEndpoint ?? '';
  } else {
    baseUrl = originApiEndpoint ?? '';
  }

  const url = new URL(options.url, baseUrl);

  return await customFetch(
    {
      method: options.method,
      url: url.toString(),
      params: options.params,
      body: options.body,
      customHeaders,
    },
    isFormData,
  )();
};

//別ファイルに移管したいかも
let appUserId: number | null = null;

/**
 * アプリ側のトークンを取得するやつ
 */
const getAppToken = async () => {
  const appData = getAppStorageData();
  //有効そうなショートトークンがあったらそれを使う
  if (appData?.shortToken && validateAppToken(appData.shortToken)) {
    return appData.shortToken;
  }
  //ロングトークンがあったらショートトークンを発行させて実行し直す
  else if (appData?.longToken && validateAppToken(appData.longToken)) {
    //この場でショートトークンを発行する
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

    //それでもうまく発行できなかったらnullをかえす
    if (res instanceof CustomError) {
      localStorage.removeItem(appStorageKey);
      return null;
    }

    //新しいshortTokenをローカルストレージに保存しつつ、APIをセットアップし直す
    const { newShortToken } = res;
    setAppStorageData({
      ...appData,
      shortToken: newShortToken,
    });

    //そしてもう一回このAPIを呼び出す
    return await getAppToken();
  }
  //トークンの有効期限が切れているか、存在しなかったらnullをかえす
  else {
    localStorage.removeItem(appStorageKey);
    appUserId = null;
    return null;
  }
};

type AppToken = {
  exp: number;
  id: number;
};

/**
 * アプリトークンの検証
 */
const validateAppToken = (token: string) => {
  const splitted = token.split('.');

  if (splitted.length != 3) return false;

  const decoded = atob(splitted[1]);
  let jsonData: AppToken | null = null;

  try {
    jsonData = JSON.parse(decoded);
  } catch {
    return false;
  }

  //有効期限を確認
  if (!jsonData?.exp) return false;

  const thisExp = dayjs(jsonData.exp);

  if (dayjs().isAfter(thisExp)) return false;

  //ユーザーIDを格納
  appUserId = jsonData.id;

  return true;
};

export const getAppUserId = async () => {
  await getAppToken();
  return appUserId;
};
