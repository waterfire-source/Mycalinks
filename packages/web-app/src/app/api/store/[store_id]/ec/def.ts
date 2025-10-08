//EC系のAPIの定義

import {
  apiMethod,
  apiRole,
  defOrderBy,
  Optional,
  Required,
} from '@/api/backendApi/main';
import {
  Ec_Order,
  Ec_Order_Cart_Store,
  Ec_Order_Cart_Store_Contact,
  Ec_Order_Cart_Store_Contact_Message,
  Ec_Order_Cart_Store_Product,
  EcOrderCartStoreStatus,
  EcOrderContactStatus,
  EcPaymentMethod,
  EcShippingCompany,
  Product,
  Shipping_Method,
  Shipping_Region,
  Shipping_Weight,
  Store,
} from '@prisma/client';

/**
 * @deprecated Use getEcOrderByStoreApi from api-generator instead
 */
//ストアがECのオーダーを取得するAPI
export const getEcOrderByStoreDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/ec/order',
  privileges: {
    role: [apiRole.pos], //Account.kindは廃止予定
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    query: {
      orderBy: Optional<string>( //ソートの定義
        defOrderBy([
          'ordered_at', //受注日時
        ]),
      ),
      id: Optional<Ec_Order['id']>(Number), //注文番号（ID）
      status: Optional<Ec_Order_Cart_Store['status']>(EcOrderCartStoreStatus), //ステータス
      order_payment_method:
        Optional<Ec_Order['payment_method']>(EcPaymentMethod), //支払い方法
      shipping_method_id:
        Optional<Ec_Order_Cart_Store['shipping_method_id']>(Number), //配送方法

      take: Optional<number>(Number), //飛ばす数
      skip: Optional<number>(Number), //取得する数
    },
  },
  process: `
  `,
  response: <
    {
      storeOrders: Array<{
        order: {
          //オーダー全体の共通情報
          id: Ec_Order['id']; //オーダーの注文番号
          payment_method: Ec_Order['payment_method']; //支払い方法
          myca_user_id: Ec_Order['myca_user_id']; //Mycaアプリ上でのユーザーID
          customer_name: Ec_Order['customer_name']; //注文時点でのお客様の名前
          customer_phone: Ec_Order['customer_phone']; //注文時点でのお客様の電話番号
          customer_email: Ec_Order['customer_email']; //注文時点でのお客様のメールアドレス
          shipping_address: Ec_Order['shipping_address']; //注文時点でのお客様の住所
          ordered_at: Ec_Order['ordered_at']; //受注日時
        };
        //この下はこのストアに関する注文情報
        shipping_method: {
          id: Shipping_Method['id']; //配送方法ID
          display_name: Shipping_Method['display_name']; //配送方法名
        };
        shipping_tracking_code: Ec_Order_Cart_Store['shipping_tracking_code']; //追跡コード
        shipping_company: Ec_Order_Cart_Store['shipping_company']; //運送会社
        shipping_fee: Ec_Order_Cart_Store['shipping_fee']; //配送料（税込）
        total_price: Ec_Order_Cart_Store['total_price']; //この店での合計金額
        status: Ec_Order_Cart_Store['status']; //この店での処理のステータス
        read: Ec_Order_Cart_Store['read']; //店がこの注文を確認したかどうか
        code: Ec_Order_Cart_Store['code']; //オーダーコード（ストアごと）
        products: Array<{
          //この店でのカート内容
          id: Ec_Order_Cart_Store_Product['id']; //カート自体のID
          product: {
            id: Product['id']; //商品ID
            displayNameWithMeta?: string; //型番とかを含む名前
          };
          total_unit_price: Ec_Order_Cart_Store_Product['total_unit_price']; //最終的な単価
          original_item_count: Ec_Order_Cart_Store_Product['original_item_count']; //注文された時点での個数
          item_count: Ec_Order_Cart_Store_Product['item_count']; //実際に発送する個数
        }>;
      }>;
    }
  >{},
};

/**
 * @deprecated Use updateEcOrderByStoreApi from api-generator instead
 */
//ストアがECのオーダーを変更するAPI
export const updateEcOrderByStoreDef = {
  method: apiMethod.PUT,
  path: 'store/[store_id]/ec/order/[order_id]',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      order_id: Required<Ec_Order['id']>(Number), //COMPLETEDになった注文は更新できないようになる
    },
    body: {
      read: Optional<Ec_Order_Cart_Store['read']>(
        Boolean,
        (v) => v || '既読の指定はtrueのみです',
      ), //既読をつける
      status: Optional<Ec_Order_Cart_Store['status']>(EcOrderCartStoreStatus), //ステータスを変更 DRAFT, UNPAIDにはできない また、変更できないパターンが多数ある（CANCELEDからCOMPLETED、COMPLETEDからWAIT_FOR_SHIPPING...etc）
      shipping_tracking_code:
        Optional<Ec_Order_Cart_Store['shipping_tracking_code']>(), //追跡番号（一度設定したら二度とできない）
      shipping_company:
        Optional<Ec_Order_Cart_Store['shipping_company']>(EcShippingCompany), //運送会社
      products: [
        //欠品がある時はここを動かす
        {
          product_id: Required<Ec_Order_Cart_Store_Product['product_id']>(), //対象の在庫ID
          item_count: Required<Ec_Order_Cart_Store_Product['item_count']>(), //実際に発送できる数を入力（元々の数より多くは指定できない）
        },
      ] as
        | Array<{
            product_id: Ec_Order_Cart_Store_Product['product_id'];
            item_count: Ec_Order_Cart_Store_Product['item_count'];
          }>
        | undefined, //このフィールドは未指定でもOK
    },
  },
  process: `
  
  `,
  response: <
    {
      storeOrder: Ec_Order_Cart_Store & {
        products: Array<Ec_Order_Cart_Store_Product>;
      };
    }
  >{},
  error: {
    trackingCodeTiming: {
      status: 400,
      messageText: '追跡番号、運送会社は発送待機中にのみつけることができます',
    },
    waitForShippingTiming: {
      status: 400,
      messageText: '発送待機中にできるのは発送準備待ちの時のみです',
    },
    completedTiming: {
      status: 400,
      messageText: '発送完了にできるのは発送待機中の時のみです',
    },
    needShippingCompany: {
      status: 400,
      messageText: '発送完了にするには運送会社を登録する必要があります',
    },
    cancelAndProducts: {
      status: 400,
      messageText: 'キャンセルと同時に欠品登録することはできません',
    },
    invalidStatus: {
      status: 400,
      messageText: 'このステータスは指定できません',
    },
    missingItemTiming: {
      status: 400,
      messageText: '欠品登録できるのは発送準備待ちの時のみです',
    },
    alreadyMissingItem: {
      status: 400,
      messageText: 'この注文ではすでに欠品登録されています',
    },
    invalidMissingItemCount: {
      status: 400,
      messageText: '欠品報告数の指定が不適切です',
    },
  } as const,
};

/**
 * @deprecated Use listShippingMethodApi from api-generator instead
 */
//配送方法取得API
export const listShippingMethodDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/ec/shipping-method',
  privileges: {
    role: [apiRole.pos], //Account.kindは廃止予定
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    query: {
      includesFeeDefs: Optional<true>(Boolean), //地域別配送料や重量別などの定義まで取得するかどうか
      id: Optional<Shipping_Method['id']>(Number), //配送方法ID
    },
  },
  process: `
  `,
  response: <
    {
      shippingMethods: Array<
        Shipping_Method & {
          //以下、includesFeeDefを指定してた時に取得できる
          regions?: Array<Shipping_Region> | null; //地域別配送料の定義 ※重量別にしてた時もここは入る。使うデータではないため，weightsの方のregionsを用いる
          weights?: Array<
            //地域別にしてる時はここは入らない
            Shipping_Weight & {
              //重量別配送料の定義
              regions: Array<Shipping_Region>; //その中での地域別配送料の定義
            }
          > | null;
        }
      >;
    }
  >{},
};

//地域別の定義
export const regionsDef = [
  {
    region_handle: Required<Shipping_Region['region_handle']>(), //「全国一律」「東北エリア一律」「神奈川県」など
    fee: Required<Shipping_Region['fee']>(), //送料
  },
];

//重量別の定義
export const weightDef = [
  {
    display_name: Required<Shipping_Weight['display_name']>(), //サイズ名
    weight_gte: Required<Shipping_Weight['weight_gte']>(), //重量制限開始ポイント
    weight_lte: Required<Shipping_Weight['weight_lte']>(), //重量制限終了ポイント
    regions: regionsDef, //料金は地域別に指定する
  },
];

/**
 * @deprecated Use createOrUpdateShippingMethodApi from api-generator instead
 */
//配送方法作成、更新API
export const createOrUpdateShippingMethodDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/ec/shipping-method',
  privileges: {
    role: [apiRole.pos], //Account.kindは廃止予定 [TODO] apiRole.posに書き換え
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    body: {
      id: Optional<Shipping_Method['id']>(), //既存のID（更新時）
      display_name: Optional<Shipping_Method['display_name']>(), //名前
      enabled_tracking: Optional<Shipping_Method['enabled_tracking']>(), //追跡を有効にするかどうか
      enabled_cash_on_delivery:
        Optional<Shipping_Method['enabled_cash_on_delivery']>(), //代引きを許可する支払い方法かどうか
      regions: regionsDef as typeof regionsDef | undefined, //地域別で送料を指定する時 更新時、指定しなくても大丈夫
      weights: weightDef as typeof weightDef | undefined, //重量別で送料を指定する時 更新時、指定しなくても大丈夫
    },
  },
  process: `
  `,
  response: <
    {
      id: Shipping_Method['id'];
    }
  >{},
};

/**
 * @deprecated Use deleteShippingMethodApi from api-generator instead
 */
//配送方法削除API
export const deleteShippingMethodDef = {
  method: apiMethod.DELETE,
  path: 'store/[store_id]/ec/shipping-method/[shipping_method_id]',
  privileges: {
    role: [apiRole.pos], //Account.kindは廃止予定 [TODO] apiRole.posに書き換え
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      shipping_method_id: Required<Shipping_Method['id']>(Number),
    },
  },
  process: `
  `,
  response: {
    ok: '配送方法の削除に成功しました',
  },
};

/**
 * @deprecated Use publishAllProductsToEcApi from api-generator instead
 */
//EC全出品
export const publishAllProductsToEcDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/ec/publish-all-products',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
  },
  process: `
  `,
  response: {
    ok: 'すべての商品がECに出品できました',
  },
};

/**
 * ECお問い合わせ返信
 * @deprecated Use replyEcOrderStoreContactApi from api-generator instead
 */
export const replyEcOrderStoreContactDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/ec/order/[order_id]/contact',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number), //ストアID
      order_id: Required<Ec_Order_Cart_Store['order_id']>(Number), //オーダーID
    },
    body: {
      status:
        Optional<Ec_Order_Cart_Store_Contact['status']>(EcOrderContactStatus), //ステータス
      content: Optional<Ec_Order_Cart_Store_Contact_Message['content']>(), //内容 これをundefinedにして、ステータスだけ更新することができる
    },
  },
  process: `
  `,
  response: <
    {
      //この注文、このストアに関するお問い合わせ
      thisOrderContact: Ec_Order_Cart_Store_Contact & {
        messages: Array<Ec_Order_Cart_Store_Contact_Message>;
      };
    }
  >{},
  error: {
    noStarted: {
      status: 400,
      messageText: 'まだメッセージがないので返信できません',
    },
  } as const,
};

/**
 * @deprecated Use getEcOrderStoreContactApi from api-generator instead
 */
//お店向け、ECオーダーお問合せ取得
export const getEcOrderStoreContactDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/ec/order/contact',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number), //ストアID
    },
    query: {
      order_id: Optional<Ec_Order_Cart_Store['order_id']>(Number), //オーダーID
      code: Optional<Ec_Order_Cart_Store['code']>(), //ストアごとのオーダーコード
      kind: Optional<Ec_Order_Cart_Store_Contact['kind']>(), //お問い合わせの種類
      skip: Optional<number>(Number), //スキップする件数
      take: Optional<number>(Number), //取得する件数
      orderBy: Optional<string>(
        defOrderBy([
          'last_sent_at', //最後のメッセージ送信時間の順番
          'order_id', //オーダーIDの順番
        ]),
      ),
      status:
        Optional<Ec_Order_Cart_Store_Contact['status']>(EcOrderContactStatus),
      includesMessages: Optional<true>(Boolean), //メッセージを含めるかどうか
    },
  },
  process: `
  `,
  response: <
    {
      orderContacts: Array<
        Ec_Order_Cart_Store_Contact & {
          order_store: {
            order: {
              id: Ec_Order['id']; //オーダーID
              code: Ec_Order['code']; //オーダーコード
            };
            code: Ec_Order_Cart_Store['code']; //オーダーコード（店舗ごとのやつ）
          };
          messages: Array<{
            id: Ec_Order_Cart_Store_Contact_Message['id']; //メッセージID
            content?: Ec_Order_Cart_Store_Contact_Message['content']; //メッセージ内容
            created_at: Ec_Order_Cart_Store_Contact_Message['created_at']; //作成日時
            myca_user_id: Ec_Order_Cart_Store_Contact_Message['myca_user_id']; //メッセージを送信したユーザーID
            staff_account_id: Ec_Order_Cart_Store_Contact_Message['staff_account_id']; //メッセージを送信したスタッフのID
          }>;
        }
      >;
    }
  >{},
};
