import {
  Store,
  Condition,
  Condition_Option,
  RegisterCashHistorySourceKind,
  Register_Settlement,
  WholesalePriceOrderColumn,
  OrderRule,
  WholesalePriceKeepRule,
  Register,
  RegisterCheckTiming,
  RoundRule,
  EcOrderContactStatus,
} from '@prisma/client';

import { CustomError } from '@/api/implement';
import { api } from '@/app/api/store/api';
import {
  getRegisterCashHistoryDef,
  getRegisterSettlementDef,
  getRegisterTodaySummaryDef,
  registerSettlementDef,
} from '@/app/api/store/[store_id]/register/def';
import { activateStore } from '@/app/api/store/def';
import {
  adjustItemsWithMarketPriceGapDef,
  getTabletAllowedGenresCategoriesDef,
  setTabletAllowedGenresCategoriesDef,
} from '@/app/api/store/[store_id]/item/def';
import {
  createOrUpdateShippingMethodDef,
  deleteShippingMethodDef,
  listShippingMethodDef,
  getEcOrderStoreContactDef,
  replyEcOrderStoreContactDef,
} from '@/app/api/store/[store_id]/ec/def';
import { getItemMarketPriceHistoryDef } from '@/app/api/store/all/item/def';

interface ConditionOptionField {
  id: Condition_Option['id'];
  conditionId: Condition_Option['condition_id'];
  handle: Condition_Option['handle'] | null;
  autoSellPriceAdjustment:
    | Condition_Option['auto_sell_price_adjustment']
    | null;
  autoBuyPriceAdjustment: Condition_Option['auto_buy_price_adjustment'] | null;
  autoSellPriceAdjustmentRoundRule:
    | Condition_Option['auto_sell_price_adjustment_round_rule']
    | null;
  autoBuyPriceAdjustmentRoundRule:
    | Condition_Option['auto_buy_price_adjustment_round_rule']
    | null;
  autoSellPriceAdjustmentRoundRank:
    | Condition_Option['auto_sell_price_adjustment_round_rank']
    | null;
  autoBuyPriceAdjustmentRoundRank:
    | Condition_Option['auto_buy_price_adjustment_round_rank']
    | null;
  displayName: Condition_Option['display_name'] | null;
  description: Condition_Option['description'] | null;
  productsCount: number;
}

export interface ConditionField {
  id: Condition['id'];
  storeID: Condition['store_id'];
  handle: Condition['handle'] | null;
  displayName: Condition['display_name'] | null;
  conditionOptions: ConditionOptionField[];
}

export interface StoreAPI {
  getAll: {
    response: Store[] | CustomError;
  };

  //店の詳細情報を取得
  getStoreInfo: {
    request: {
      storeID: number;
    };
    response: api[3]['response']['200'] | CustomError;
  };

  // 店舗作成
  createStore: {
    request: {
      storeName: string; // 店舗表示名
      representativeName: string; // 代表者名
      email: string; // メールアドレス
      password: string; // パスワード
      accountId: number; // 本部アカウントID
      corpPassword: string; // 本部アカウントパスワード
      zipCode: string; // 郵便番号
      fullAddress: string; // 住所
      phoneNumber: string; // 電話番号
      imageUrl: string | null; // 画像URL
    };
    response: api[0]['response']['200'] | CustomError;
  };

  updateStoreInfo: {
    request: {
      storeID: number; // 店舗ID
      // opened?: boolean; // 店舗の営業状態
      displayName?: string; // 店舗表示名
      leaderName?: string; //代表者名
      receiptLogoUrl?: string; // レシートに表示するロゴのURL
      imageUrl?: string; // 店舗ロゴのURL
      fullAddress?: string; // 店舗住所
      zipCode?: string; // 郵便番号
      phoneNumber?: string; // 電話番号
      currentPassword?: string; // 現在のパスワード（認証用）
      // お金
      priceAdjustmentRoundRule?: RoundRule; // 丸め方
      priceAdjustmentRoundRank?: number; // デフォルトでは桁は動かさない
      // SquareのロケーションID
      squareLocationId?: string;
      // レジ点検設定
      registerCashManageBySeparately?: boolean; // レジ点検方法（true: レジごと、false: 一括）
      registerCashCheckTiming?: RegisterCheckTiming; // レジ点検タイミング
      registerCashResetEnabled?: boolean; // レジ金のリセット
    };
    response: Store | CustomError;
  };

  activateStore: {
    request: {
      code: string;
      password: string;
    };
    response: (typeof activateStore)['response'] | CustomError;
  };

  // 買取規約取得
  getTerm: {
    request: {
      storeID: number;
    };
    response: {
      buy_term: string;
    };
  };
  // 買取規約更新
  updateTerm: {
    request: {
      storeID: number;
      buy_term: Store['buy_term'];
    };
    response: {
      buy_term: string;
    };
  };

  //仕入れ値の設定変更
  updateWholesalePrice: {
    request: {
      storeID: number;
      useWholesalePriceOrderColumn?: WholesalePriceOrderColumn; //仕入れ値の使い方のカラム指定
      useWholesalePriceOrderRule?: OrderRule; //仕入れ値の使い方の並び替えルール
      returnWholesalePriceOrderColumn?: WholesalePriceOrderColumn; //仕入れ値の戻し方のカラム指定
      returnWholesalePriceOrderRule?: OrderRule; //仕入れ値の戻し方の並び替えルール
      wholesalePriceKeepRule?: WholesalePriceKeepRule; //仕入れ値の保持ルール
    };
    response: {
      ok: string;
    };
  };

  //閉店処理系↓
  listRegisterCashHistory: {
    request: {
      storeID: number;
      query: {
        source_kind?: Array<RegisterCashHistorySourceKind>;
        startAt?: Date;
        endAt?: Date;
        register_id?: Register['id'];
        skip?: number;
        take?: number;
      };
    };
    response: typeof getRegisterCashHistoryDef.response | CustomError;
  };

  getRegisterDetails: {
    request: {
      storeID: number;
      registerID: number;
    };
    response: typeof getRegisterTodaySummaryDef.response | CustomError;
  };

  getSettlementDetails: {
    request: {
      storeID: number;
      registerID: number;
      settlementID: Register_Settlement['id'];
    };
    response: typeof getRegisterSettlementDef.response | CustomError;
  };

  postRegister: {
    request: {
      storeID: number;
      registerID: number;
    } & typeof registerSettlementDef.request.body;
    response: typeof registerSettlementDef.response | CustomError;
  };

  // 店舗のstatusを取得
  getStoreStatus: {
    request: {
      storeID: number;
    };
    response:
      | {
          id: number;
          statusMessage: string | null;
          statusMessageUpdatedAt: Date | null;
        }
      | CustomError;
  };

  //ストア情報取得
  getStoreInfoNormal: {
    request: {
      storeId?: number;
      includesCorp?: boolean;
      includesEcSetting?: boolean;
    };
    response: api[2]['response']['200'] | CustomError;
  };

  //ポイントの設定変更
  updatePointSetting: {
    request: {
      storeId: number;
      body: api[1]['request']['body'];
    };
    response: {
      ok: string;
    };
  };

  updateEcSetting: {
    request: {
      storeId: number;
      mycalinksEcTermsAccepted?: boolean;
      mycalinksEcEnabled?: boolean;
      EcSetting?: {
        autoListing?: boolean;
        autoStocking?: boolean;
        autoSellPriceAdjustment?: number;
        priceAdjustmentRoundRank?: number;
        priceAdjustmentRoundRule?: RoundRule;
        reservedStockNumber?: number;
        enableSameDayShipping?: boolean;
        sameDayLimitHour?: number | null;
        shippingDays?: number | null;
        closedDay?: string;
        freeShippingPrice?: number | null;
        delayedPaymentMethod?: string;
        notificationEmail?: string | null;
      };
    };
    response:
      | {
          ok: string;
        }
      | CustomError;
  };

  // EC設定（おちゃのこネット）の更新
  updateOchanokoeEcSetting: {
    request: {
      storeId: number;
      ochanokoEcEnabled?: boolean;
      EcSetting?: {
        ochanokoEmail?: string;
        ochanokoAccountId?: string;
        ochanokoPassword?: string;
        ochanokoApiToken?: string;
      };
    };
    response:
      | {
          ok: string;
        }
      | CustomError;
  };

  getListShippingMethod: {
    request: {
      storeId: number;
      query: {
        includesFeeDefs?: boolean;
        id?: number;
      };
    };
    response: typeof listShippingMethodDef.response | CustomError;
  };

  createShippingMethod: {
    request: {
      storeId: number;
      body: {
        displayName: string;
        enabledTracking: boolean;
        enabledCashOnDelivery: boolean;
        orderNumber?: number;
        regions?: { regionHandle: string; fee: number }[];
        weights?: {
          displayName: string;
          weightGte: number;
          weightLte: number;
          regions: { regionHandle: string; fee: number }[];
        }[];
      };
    };
    response: typeof createOrUpdateShippingMethodDef.response | CustomError;
  };

  updateShippingMethod: {
    request: {
      storeId: number;
      body: {
        id: number;
        displayName?: string;
        enabledTracking?: boolean;
        enabledCashOnDelivery?: boolean;
        orderNumber?: number;
        regions?: { regionHandle: string; fee: number }[];
        weights?: {
          displayName: string;
          weightGte: number;
          weightLte: number;
          regions: { regionHandle: string; fee: number }[];
        }[];
      };
    };
    response: typeof createOrUpdateShippingMethodDef.response | CustomError;
  };

  deleteShippingMethod: {
    request: {
      storeId: number;
      shippingMethodId: number;
    };
    response: typeof deleteShippingMethodDef.response | CustomError;
  };
  // タブレット設定
  getTabletAllowedGenresCategories: {
    request: {
      storeID: number;
    };
    response: typeof getTabletAllowedGenresCategoriesDef.response | CustomError;
  };
  setTabletAllowedGenresCategories: {
    request: {
      storeID: number;
      allowedGenresCategories: {
        genreId: number;
        categoryId: number;
        conditionOptionId: number | null;
        specialtyId: number | null;
        limitCount: number;
        noSpecialty: boolean;
      }[];
    };
    response: typeof setTabletAllowedGenresCategoriesDef.response | CustomError;
  };

  // EC問い合わせ返信
  replyEcOrderStoreContact: {
    request: {
      storeId: number;
      orderId: number;
      body: {
        status?: EcOrderContactStatus;
        content?: string; // 返信内容, undefinedの場合はstatusのみ更新
      };
    };
    response: typeof replyEcOrderStoreContactDef.response | CustomError;
  };

  // ECオーダー問い合わせ取得
  getEcOrderStoreContact: {
    request: {
      storeId: number;
      query: {
        orderId?: number;
        code?: string;
        kind?: string;
        skip?: number;
        take?: number;
        orderBy?: 'last_sent_at' | 'order_id';
        status?: EcOrderContactStatus;
        includesMessages?: true;
      };
    };
    response: typeof getEcOrderStoreContactDef.response | CustomError;
  };
  //相場価格の更新履歴などを軽く取得
  getItemMarketPriceHistory: {
    response: typeof getItemMarketPriceHistoryDef.response | CustomError;
  };
  //相場価格とギャップがある商品マスタをスリムに取得する
  //adjustAllオプションをつけたら相場価格に是正するリクエストが送信される（非同期処理）
  adjustItemsWithMarketPriceGap: {
    request: {
      storeID: number;
      query: {
        genreId?: number;
        categoryId?: number;
      };
      body: {
        adjustAll?: boolean;
      };
    };
    response: typeof adjustItemsWithMarketPriceGapDef.response | CustomError;
  };

  // EC納品書取得
  getEcOrderDeliveryNote: {
    request: {
      storeId: number;
      orderId: number;
    };
    response:
      | {
          deliveryNoteUrl: string;
        }
      | CustomError;
  };

  // ECのショップ情報更新
  updateEcAboutUs: {
    request: {
      storeId: number;
      shop_pr: string | null;
      images: string[];
      about_shipping: string | null;
      about_shipping_fee: string | null;
      cancel_policy: string | null;
      return_policy: string | null;
    };
    response:
      | {
          id: number;
          store_id: number;
          shop_pr: string | null;
          images: string[];
          about_shipping: string | null;
          about_shipping_fee: string | null;
          cancel_policy: string | null;
          return_policy: string | null;
          created_at: Date;
          updated_at: Date;
        }
      | CustomError;
  };
}

export interface StoreApiRes {
  getAll: Exclude<StoreAPI['getAll']['response'], CustomError>;
  getStoreInfo: Exclude<StoreAPI['getStoreInfo']['response'], CustomError>;
  createStore: Exclude<StoreAPI['createStore']['response'], CustomError>;
  updateStoreInfo: Exclude<
    StoreAPI['updateStoreInfo']['response'],
    CustomError
  >;
  activateStore: Exclude<StoreAPI['activateStore']['response'], CustomError>;
  getTerm: Exclude<StoreAPI['getTerm']['response'], CustomError>;
  updateTerm: Exclude<StoreAPI['updateTerm']['response'], CustomError>;
  updateWholesalePrice: Exclude<
    StoreAPI['updateWholesalePrice']['response'],
    CustomError
  >;
  listRegisterCashHistory: Exclude<
    StoreAPI['listRegisterCashHistory']['response'],
    CustomError
  >;
  getRegisterDetails: Exclude<
    StoreAPI['getRegisterDetails']['response'],
    CustomError
  >;
  getSettlementDetails: Exclude<
    StoreAPI['getSettlementDetails']['response'],
    CustomError
  >;
  postRegister: Exclude<StoreAPI['postRegister']['response'], CustomError>;
  getStoreStatus: Exclude<StoreAPI['getStoreStatus']['response'], CustomError>;
  getStoreInfoNormal: Exclude<
    StoreAPI['getStoreInfoNormal']['response'],
    CustomError
  >;
  updatePointSetting: Exclude<
    StoreAPI['updatePointSetting']['response'],
    CustomError
  >;
  updateEcSetting: Exclude<
    StoreAPI['updateEcSetting']['response'],
    CustomError
  >;
  getListShippingMethod: Exclude<
    StoreAPI['getListShippingMethod']['response'],
    CustomError
  >;
  createShippingMethod: Exclude<
    StoreAPI['createShippingMethod']['response'],
    CustomError
  >;
  updateShippingMethod: Exclude<
    StoreAPI['updateShippingMethod']['response'],
    CustomError
  >;
  deleteShippingMethod: Exclude<
    StoreAPI['deleteShippingMethod']['response'],
    CustomError
  >;
  replyEcOrderStoreContact: Exclude<
    StoreAPI['replyEcOrderStoreContact']['response'],
    CustomError
  >;
  getEcOrderStoreContact: Exclude<
    StoreAPI['getEcOrderStoreContact']['response'],
    CustomError
  >;
  getTabletAllowedGenresCategories: Exclude<
    StoreAPI['getTabletAllowedGenresCategories']['response'],
    CustomError
  >;
  setTabletAllowedGenresCategories: Exclude<
    StoreAPI['setTabletAllowedGenresCategories']['response'],
    CustomError
  >;
  getItemMarketPriceHistory: Exclude<
    StoreAPI['getItemMarketPriceHistory']['response'],
    CustomError
  >;
  adjustItemsWithMarketPriceGap: Exclude<
    StoreAPI['adjustItemsWithMarketPriceGap']['response'],
    CustomError
  >;
  getEcOrderDeliveryNote: Exclude<
    StoreAPI['getEcOrderDeliveryNote']['response'],
    CustomError
  >;
}
