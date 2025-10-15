import { CustomError } from '@/api/implement';
import {
  getEcBannerDef,
  getEcGenreDef,
  getEcItemDef,
  submitEcContactDef,
  getEcProductDef,
  createOrUpdateEcOrderDef,
  payEcOrderDef,
  getEcOrderDef,
  getEcOrderContactDef,
  createEcOrderContactDef,
  getEcOrderReceiptDef,
  DeckAvailableProductsPriorityOption,
  forgetPasswordDef,
  changePasswordDef,
  readEcMessageCenterDef,
  getEcMessageCenterDef,
} from '@/app/api/ec/def';
import {
  getEcOrderByStoreDef,
  listShippingMethodDef,
  updateEcOrderByStoreDef,
} from '@/app/api/store/[store_id]/ec/def';
import { listItemWithEcOrder } from '@/app/api/store/[store_id]/item/def';
import { MycaAppUser } from '@/types/BackendAPI';
import {
  EcPaymentMethod,
  ConditionOptionHandle,
  ItemCategoryHandle,
  EcOrderStatus,
  Product,
  Store,
  Ec_Setting,
  Item_Category_Condition_Option,
  EcOrderCartStoreStatus,
  Gmo_Credit_Card,
} from '@prisma/client';
import { MycaItem } from 'backend-core';

export interface EcAPI {
  // ECのアプリバナー取得
  getEcBanner: {
    request: Record<string, never>;
    response: typeof getEcBannerDef.response | CustomError;
  };

  // ECのジャンル取得
  getEcGenre: {
    request: Record<string, never>;
    response: typeof getEcGenreDef.response | CustomError;
  };

  // EC検索API
  getEcItem: {
    request: {
      hasStock?: undefined | true;
      storeIds?: string;
      itemCategory: ItemCategoryHandle[];
      conditionOption: ConditionOptionHandle[];
      rarity?: string;
      expansion?: string;
      name?: string;
      cardNumber?: string;
      cardSeries?: string;
      cardType?: string;
      option1?: string;
      option2?: string;
      option3?: string;
      option4?: number;
      option5?: string;
      option6?: string;
      releaseDate?: string;
      displayType1?: string;
      displayType2?: string;
      specialty?: string;
      id?: number[];
      itemGenre: string;
      orderBy?: string;
      take: number;
      skip?: number;
      myca_primary_pack_id?: string;
    };
    response: typeof getEcItemDef.response | CustomError;
  };

  // ECお問い合わせ
  submitEcContact: {
    request: {
      body: {
        mycaItemId?: number;
        kind: string;
        content: string;
      };
    };
    response: typeof submitEcContactDef.response | CustomError;
  };

  // EC商品詳細取得API
  getEcProduct: {
    request: {
      mycaItemId: number;
      conditionOption?: ConditionOptionHandle;
      hasStock?: boolean;
      specialty?: string;
    };
    response: typeof getEcProductDef.response | CustomError;
  };

  // ECオーダー作成・更新API
  createOrUpdateEcOrder: {
    request: {
      includesShippingMethodCandidates?: boolean;
      includesPaymentMethodCandidates?: boolean;
      body: {
        code?: string;
        shippingAddressPrefecture?: string;
        cartStores: Array<{
          storeId: number;
          shippingMethodId?: number;
          products: Array<{
            productId: number;
            originalItemCount: number;
          }>;
        }>;
      };
    };
    response: typeof createOrUpdateEcOrderDef.response | CustomError;
  };

  // 顧客側、ECオーダー注文確定
  payEcOrder: {
    request: {
      orderId: number;
      body: {
        paymentMethod: EcPaymentMethod;
        totalPrice: number;
        cardId?: Gmo_Credit_Card['id'];
        convenienceCode?: string;
      };
    };
    response: typeof payEcOrderDef.response | CustomError;
  };

  // 顧客側、ECオーダー取得API
  getEcOrder: {
    request: {
      code?: string;
      status?: EcOrderStatus;
      id?: number;
      includesInsufficientProducts?: true;
    };
    response: typeof getEcOrderDef.response | CustomError;
  };

  // ECオーダーコンタクト取得API
  getEcOrderContact: {
    request: {
      code?: string;
      skip?: number;
      take?: number;
      includesMessages?: boolean;
    };
    response: typeof getEcOrderContactDef.response | CustomError;
  };

  // ECオーダーコンタクト作成API
  createEcOrderContact: {
    request: {
      body: {
        code: string;
        kind?: string;
        title?: string;
        content?: string;
      };
    };
    response: typeof createEcOrderContactDef.response | CustomError;
  };

  // ECメッセージセンター既読API
  readEcMessageCenter: {
    request: typeof readEcMessageCenterDef.request.params;
    response: typeof readEcMessageCenterDef.response | CustomError;
  };

  // ECメッセージセンター取得API
  getEcMessageCenter: {
    request: typeof getEcMessageCenterDef.request.query;
    response: typeof getEcMessageCenterDef.response | CustomError;
  };

  // ECオーダー領収書発行API
  getEcOrderReceipt: {
    request: {
      orderId: number;
      storeId: number;
      customerName?: string;
    };
    response: typeof getEcOrderReceiptDef.response | CustomError;
  };

  // アプリユーザー情報取得
  getAppAccountInfo: {
    response: MycaAppUser | CustomError;
  };

  //アプリログイン
  appLogin: {
    request: {
      email: string;
      hashedPassword: string;
    };
    response: Array<{
      id: string;
      role: string | null;
      created: string;
      longToken: string;
    }>;
  };

  //新規会員登録
  appRegister: {
    request: {
      email: string;
      hashedPassword: string;
    };
    response: { ok: string } | CustomError;
  };

  //会員情報修正
  updateAppUserInfo: {
    request: {
      displayName?: string;
      birthday?: string;
      gender?: string;
      career?: string;
      fullName?: string;
      fullNameRuby?: string;
      phoneNumber?: string;
      password?: string;
      address?: string;
      address2?: string;
      city?: string;
      prefecture?: string;
      building?: string;
      zipCode?: string;
      deviceId?: number;
      mail?: string;
    };
    response: { ok: string } | CustomError;
  };

  // デッキに含まれる商品のうち、在庫があるものを取得
  getEcDeckAvailableProducts: {
    request: {
      deckId?: number;
      code?: string;
      anyRarity: boolean;
      anyCardnumber: boolean;
      conditionOption?: string;
      priorityOption?: DeckAvailableProductsPriorityOption;
    };
    response: {
      deckItems: Array<{
        mycaItem: MycaItem; //Mycaアイテム情報
        needItemCount: number; //必要な枚数
        availableMycaItems: Array<MycaItem>; //この条件だと代用可能なアイテム
        //購入可能なPOS上のProduct情報
        availableProducts: Array<{
          id: Product['id']; //在庫ID
          ec_stock_number: Product['ec_stock_number']; //EC用の在庫数
          actual_ec_sell_price: Product['actual_ec_sell_price']; //EC用の税込価格
          store: {
            id: Store['id']; //ストアID
            display_name: Store['display_name']; //ストア名
            ec_setting: {
              same_day_limit_hour: Ec_Setting['same_day_limit_hour']; //即時発送をする時、期限の時間
              shipping_days: Ec_Setting['shipping_days']; //発送までにかかる営業日数
            };
          };
          condition_option: {
            //状態
            handle: Item_Category_Condition_Option['handle']; //状態ハンドル
          };
        }>;
      }>;
    };
  };
  //ストアがECのオーダーを取得するAPI
  getEcOrderByStore: {
    request: {
      store_id: number;
      orderBy?: string;
      id?: number;
      status?: EcOrderCartStoreStatus;
      order_payment_method?: EcPaymentMethod;
      shipping_method_id?: number;
      take?: number;
      skip?: number;
    };
    response: typeof getEcOrderByStoreDef.response | CustomError;
  };

  //ストアがECのオーダーを更新するAPI
  updateEcOrderByStore: {
    request: {
      store_id: number;
      order_id: number;
      body: {
        read?: boolean;
        status?: string;
        shipping_tracking_code?: string;
        shipping_company?: string;
        products?: Array<{
          product_id: number;
          item_count?: number;
        }>;
      };
    };
    response: typeof updateEcOrderByStoreDef.response | CustomError;
  };

  //配送方法取得API
  listShippingMethod: {
    request: {
      store_id: number;
      includesFeeDefs?: boolean;
      id?: number;
    };
    response: typeof listShippingMethodDef.response | CustomError;
  };

  //EC全出品
  publishAllProductsToEc: {
    request: {
      storeId: number;
    };
    response: {
      ok: string;
    };
  };

  // パスワード再発行API
  forgetPassword: {
    request: typeof forgetPasswordDef.request.body;
    response: typeof forgetPasswordDef.response | CustomError;
  };

  // パスワード変更API
  changePassword: {
    request: typeof changePasswordDef.request.body;
    response: typeof changePasswordDef.response | CustomError;
  };

  // EC下書きカート取得API
  getEcDraftCart: {
    request: {
      code?: string;
    };
    response:
      | {
          order: {
            id: number;
            code: string;
            totalItemCount: number;
          } | null;
        }
      | CustomError;
  };

  //ECの在庫別取引一覧
  listItemWithEcOrder: {
    request: {
      storeId: number;
      displayName?: string;
      itemId?: number;
      cardNumber?: string;
      rarity?: string;
      genreId?: number;
      orderCreatedAtGte?: Date;
      orderCreatedAtLt?: Date;
      orderBy?: string[];
      take: number;
      skip?: number;
      includesSummary?: boolean;
      includesEcOrders?: boolean;
    };
    response: typeof listItemWithEcOrder.response | CustomError;
  };

  //ECユーザークレジットカード取得API
  getEcUserCreditCard: {
    response:
      | {
          cards: Gmo_Credit_Card[];
        }
      | CustomError;
  };

  registerEcUserCreditCard: {
    request: {
      token: string;
    };
    response: Gmo_Credit_Card | CustomError;
  };

  // EC店舗の紹介文を取得
  getEcStoreAboutUs: {
    request: {
      ecStoreId: number;
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

export interface EcAPIRes {
  getEcBanner: Exclude<EcAPI['getEcBanner']['response'], CustomError>;
  getEcGenre: Exclude<EcAPI['getEcGenre']['response'], CustomError>;
  getEcItem: Exclude<EcAPI['getEcItem']['response'], CustomError>;
  submitEcContact: Exclude<EcAPI['submitEcContact']['response'], CustomError>;
  getEcProduct: Exclude<EcAPI['getEcProduct']['response'], CustomError>;
  createOrUpdateEcOrder: Exclude<
    EcAPI['createOrUpdateEcOrder']['response'],
    CustomError
  >;
  payEcOrder: Exclude<EcAPI['payEcOrder']['response'], CustomError>;
  getEcOrder: Exclude<EcAPI['getEcOrder']['response'], CustomError>;
  getEcOrderContact: Exclude<
    EcAPI['getEcOrderContact']['response'],
    CustomError
  >;
  createEcOrderContact: Exclude<
    EcAPI['createEcOrderContact']['response'],
    CustomError
  >;
  getEcOrderReceipt: Exclude<
    EcAPI['getEcOrderReceipt']['response'],
    CustomError
  >;
  getEcOrderByStore: Exclude<
    EcAPI['getEcOrderByStore']['response'],
    CustomError
  >;
  updateEcOrderByStore: Exclude<
    EcAPI['updateEcOrderByStore']['response'],
    CustomError
  >;
  listShippingMethod: Exclude<
    EcAPI['listShippingMethod']['response'],
    CustomError
  >;
  listItemWithEcOrder: Exclude<
    EcAPI['listItemWithEcOrder']['response'],
    CustomError
  >;
}
