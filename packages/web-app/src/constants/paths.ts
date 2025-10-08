// auth配下は認証済みの画面
const AUTH_PATH = '/auth';
const GUEST_PATH = '/guest';

export const PATH = {
  TOP: '/',
  LOGIN: '/login',
  CORPORATION_LOGIN: '/login/corporation',
  DASHBOARD: `${AUTH_PATH}`,

  // 発注管理`
  ARRIVAL: {
    root: `${AUTH_PATH}/arrival?status=NOT_YET`,
    register: `${AUTH_PATH}/arrival/register`,
  },
  // 商品一覧
  ITEM: {
    root: `${AUTH_PATH}/item`,
    register: `${AUTH_PATH}/item/register`,
  },
  SALE: {
    root: `${AUTH_PATH}/sale`, // 販売
    mobileSaleDraft: (id: number) =>
      `${AUTH_PATH}/sale/${id}/mobileSaleDraftPage`,
    return: `${AUTH_PATH}/sale/return`,
  },
  PURCHASE: `${AUTH_PATH}/purchase`, // 買取
  ALL_STORE_STOCK: { root: `${AUTH_PATH}/all-store-stock` }, // 全店舗在庫
  STOCK: {
    root: `${AUTH_PATH}/stock`, // 在庫一覧
    register: {
      upload: `${AUTH_PATH}/stock/register/upload`,
      pack: {
        root: `${AUTH_PATH}/stock/register/pack`,
        register: `${AUTH_PATH}/stock/register/pack/register`,
        confirmation: `${AUTH_PATH}/stock/register/pack/confirmation`,
      },
    },
    loss: {
      root: `${AUTH_PATH}/stock/loss`,
      register: `${AUTH_PATH}/stock/loss/register`,
      genre: `${AUTH_PATH}/stock/loss/genre`,
    },
    bundle: {
      root: `${AUTH_PATH}/stock/bundle`,
      register: `${AUTH_PATH}/stock/bundle/register`,
      edit: (bundleId: number) =>
        `${AUTH_PATH}/stock/bundle/register?id=${bundleId}`,
    },
    set: {
      root: `${AUTH_PATH}/stock/set`,
      register: `${AUTH_PATH}/stock/set/register`,
      edit: (setDealId: number) =>
        `${AUTH_PATH}/stock/set/register?id=${setDealId}`,
    },
    sale: {
      root: `${AUTH_PATH}/stock/sale`,
      register: `${AUTH_PATH}/stock/sale/register`,
    },
    changeHistory: {
      root: `${AUTH_PATH}/stock/change-history/list`,
    },
    specialPriceStock: {
      root: `${AUTH_PATH}/stock/specialPriceStock`,
    },
    consign: {
      root: `${AUTH_PATH}/stock/consign`,
      register: `${AUTH_PATH}/stock/consign/register`,
    },
    consignUser: {
      root: `${AUTH_PATH}/stock/consign-user`,
    },
    openPackHistory: {
      root: `${AUTH_PATH}/stock/open-pack-history`,
    },
  },
  STORESHIPMENT: {
    root: `${AUTH_PATH}/store-shipment`,
    create: (storeId: number) =>
      `${AUTH_PATH}/store-shipment/register?toStoreId=${storeId}`,
    edit: (id: number) =>
      `${AUTH_PATH}/store-shipment/register?shipmentId=${id}`,
    apply: (id: number) => `${AUTH_PATH}/store-shipment/${id}/apply`,
  },
  PROCEEDS: `${AUTH_PATH}/proceeds`,
  SUPPLIER: {
    root: `${AUTH_PATH}/supplier`, // 仕入れ先一覧
  },
  ORIGINAL_PACK: {
    root: `${AUTH_PATH}/original-pack`,
    disassembly: `${AUTH_PATH}/original-pack/disassembly`, //解体
    create: `${AUTH_PATH}/original-pack/create`,
  },
  BOOKING: {
    product: `${AUTH_PATH}/booking/product`, // 予約商品
    root: `${AUTH_PATH}/booking`, // 受付済み予約一覧
  },
  PROFILE: `${AUTH_PATH}/profile`,
  TRANSACTION: `${AUTH_PATH}/transaction`, // 取引
  TRANSACTION_PRODUCT: `${AUTH_PATH}/transaction/product`, // 取引商品
  CASH: `${AUTH_PATH}/cash`, // 入出金
  CLOSE: `${AUTH_PATH}/close`, // 閉店
  PURCHASE_RECEPTION: {
    root: `${AUTH_PATH}/purchaseReception`,
    transaction: {
      root: `${AUTH_PATH}/purchaseReception/[TransactionID]`,
      purchase: (transactionId: string | number) =>
        `${AUTH_PATH}/purchaseReception/${transactionId}/purchase`,
    },
  },
  PURCHASE_TABLE: {
    root: `${AUTH_PATH}/purchaseTable`,
  },
  INVENTORY_COUNT: {
    root: `${AUTH_PATH}/inventory-count`, // 棚卸
  },
  CUSTOMERS: {
    root: `${AUTH_PATH}/customers`,
  },
  SALES_ANALYTICS: {
    root: `${AUTH_PATH}/sales-analytics`,
  },
  SETTINGS: {
    root: `${AUTH_PATH}/settings`, //現在使用していない
    cashRegister: `${AUTH_PATH}/settings/cash-register`, //レジ設定
    condition: `${AUTH_PATH}/settings/condition`, //状態
    specialty: `${AUTH_PATH}/settings/specialty`, //特殊状態一覧
    wholesalePrice: `${AUTH_PATH}/settings/wholesale-price`, //仕入れ値ロジック変更
    genreAndCategory: `${AUTH_PATH}/settings/genre-and-category`, //ジャンルカテゴリ設定
    corporation: `${AUTH_PATH}/settings/corporation`, //法人情報設定
    store: `${AUTH_PATH}/settings/store/[store_id]`, //店舗アカウント設定
    departments: `${AUTH_PATH}/settings/departments`, // 部門一覧
    account: `${AUTH_PATH}/settings/account`, // 従業員一覧
    authority: `${AUTH_PATH}/settings/authority`, //権限画面
    point: `${AUTH_PATH}/settings/point-setting`, //ポイント設定画面
    tabletSetting: `${AUTH_PATH}/settings/tablet-setting`, //タブレット設定画面
    template: `${AUTH_PATH}/settings/template`, //テンプレート設定画面
  },
  REGISTER: {
    check: `${AUTH_PATH}/register/check`, // レジ点検
    close: `${AUTH_PATH}/register/close`, // レジ締め
    open: `${AUTH_PATH}/register/open`, // レジ開け
    checkHistory: `${AUTH_PATH}/register/checkHistory`, // レジ点検履歴
  },
  APPRAISAL: {
    root: `${AUTH_PATH}/appraisal`,
    register: (id?: number) =>
      `${AUTH_PATH}/appraisal/register${id ? `?editId=${id}` : ''}`,
    input: (id: number) => `${AUTH_PATH}/appraisal/${id}`,
  },
  LOCATION: {
    root: `${AUTH_PATH}/location`,
    register: (id?: number) =>
      `${AUTH_PATH}/location/register${id ? `editId=${id}` : ''}`,
    release: (id: number, mode?: 'remain' | 'out') =>
      `${AUTH_PATH}/location/${id}/release${mode ? `?mode=${mode}` : ''}`,
  },
  EC: {
    root: `${AUTH_PATH}/ec`,
    picking: `${AUTH_PATH}/ec/picking`,
    list: `${AUTH_PATH}/ec/list`,
    settings: `${AUTH_PATH}/ec/settings`,
    stock: `${AUTH_PATH}/ec/stock`,
    about: (storeId: string) => `${AUTH_PATH}/ec/${storeId}/about`,
    deliverySettings: `${AUTH_PATH}/ec/settings/delivery`,
    inquiry: `${AUTH_PATH}/ec/inquiry`,
    transaction: `${AUTH_PATH}/ec/transaction`,
    transaction_product: `${AUTH_PATH}/ec/transaction/product`,
    external: `${AUTH_PATH}/ec/external`,
    salesAnalytics: `${AUTH_PATH}/ec/sales-analytics`,
  },
  // 初期セットアップ
  SETUP: {
    corporation: {
      info: `${AUTH_PATH}/setup/corporation/info`,
      defaultSetting: `${AUTH_PATH}/setup/corporation/default-setting`,
      complete: `${AUTH_PATH}/setup/corporation/complete`,
    },
    store: {
      root: `${AUTH_PATH}/setup/store`,
      info: `${AUTH_PATH}/setup/store/info`,
      cashRegister: `${AUTH_PATH}/setup/store/cash-register`,
      point: `${AUTH_PATH}/setup/store/point`,
      genre: `${AUTH_PATH}/setup/store/genre`,
      originalGenre: `${AUTH_PATH}/setup/store/original-genre`,
      category: `${AUTH_PATH}/setup/store/category`,
      condition: `${AUTH_PATH}/setup/store/condition`,
      complete: `${AUTH_PATH}/setup/store/complete`,
    },
  },
  // ゲスト用在庫一覧
  GUEST_STOCK: {
    root: (encodedParams: string) => `${GUEST_PATH}/${encodedParams}/stock`, // エンコードされたパラメータを受け取る(storeId, printerSerialNumber)
  },
  // 告知・案内
  ADVERTISEMENT: `${AUTH_PATH}/advertisement`,
  // お知らせ管理
  ANNOUNCEMENT: `${AUTH_PATH}/announcement`,
};
export const ERROR_PATH = {
  root: '/error',
  unauthorized: '/error/401',
};
const registerPath = '/register';
export const REGISTER_PATH = {
  root: registerPath,
  termsOfService: `${registerPath}/terms-of-service`,
  setting: `${registerPath}/setting`,
  thanks: `${registerPath}/thanks`,
};
