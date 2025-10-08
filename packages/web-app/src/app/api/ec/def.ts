//お客さん向けのEC API
//EC系のAPIの定義

import {
  apiMethod,
  apiRole,
  defOrderBy,
  Optional,
  Required,
} from '@/api/backendApi/main';
import { mycaItem } from '@/app/api/store/[store_id]/myca-item/api';
import { MycaAppGenre, MycaItem, Ec_Message_Center } from 'backend-core';
import {
  ConditionOptionHandle,
  Ec_Banner,
  Ec_Order,
  Ec_Order_Cart_Store,
  Ec_Order_Cart_Store_Contact,
  Ec_Order_Cart_Store_Contact_Message,
  Ec_Order_Cart_Store_Product,
  Ec_Setting,
  EcBannerPlace,
  EcOrderStatus,
  EcPaymentMethod,
  Gmo_Credit_Card,
  Item,
  Item_Category_Condition_Option,
  Product,
  Shipping_Method,
  Specialty,
  Store,
} from '@prisma/client';

//ECのアプリバナー取得
export const getEcBannerDef = {
  method: apiMethod.GET,
  path: 'ec/banner',
  privileges: {
    role: [apiRole.everyone], //誰でも
  },
  request: {
    params: {},
    query: {
      place: Optional<Ec_Banner['place']>(EcBannerPlace), //バナーの位置
    },
  },
  process: `
  `,
  response: <
    {
      banners: Array<{
        place: Ec_Banner['place'];
        image_url: Ec_Banner['image_url'];
        url: Ec_Banner['url'];
      }>;
    }
  >{},
};

// パスワード再発行 API
export const forgetPasswordDef = {
  method: apiMethod.POST,
  path: 'user/account/forget-password/',
  privileges: {
    role: [apiRole.everyone], // 誰でもアクセス可能
  },
  request: {
    params: {},
    body: {
      mail: Required<string>(), // ユーザーのメールアドレス
    },
  },
  process: `
  `,
  response: <
    {
      ok?: boolean; // 成功時は'ok'プロパティが存在する
      error?: 'mail unsended'; // エラー時のエラーコード
    }
  >{},
};

// パスワード変更 API
export const changePasswordDef = {
  method: apiMethod.POST,
  path: 'user/account/change-password/',
  privileges: {
    role: [apiRole.mycaUser], // Mycaユーザーである必要がある
  },
  request: {
    params: {},
    body: {
      user: Required<number>(Number), // ユーザーID
      hashed_password: Required<string>(), // SHA-256でハッシュ化された新しいパスワード
    },
  },
  process: `
  `,
  response: <
    {
      status: number; // 200: 成功、その他: 失敗
    }
  >{},
};

//ECのジャンル取得
//出品があるジャンルのみを表示する形
export const getEcGenreDef = {
  method: apiMethod.GET,
  path: 'ec/genre',
  cache: 180, //3分間有効
  privileges: {
    role: [apiRole.everyone], //誰でも
  },
  request: {
    params: {},
    query: {
      //バージョニングとかはやるかも
    },
  },
  process: `
  `,
  response: <
    {
      genres: Array<MycaAppGenre>; //アプリで取得できるやつベース
    }
  >{},
};

//EC検索API
export const getEcItemDef = {
  method: apiMethod.GET,
  path: 'ec/item',
  cache: 30, //キャッシュは30秒間有効
  privileges: {
    role: [apiRole.everyone], //誰でも
  },
  request: {
    params: {},
    query: {
      hasStock: Optional<true>(Boolean), //在庫があるもののみ表示するか
      itemCategory: Optional<string>(), //enum ItemCategoryHandleをカンマ区切りで指定
      conditionOption: Optional<string>(), //enum ConditionOptionHandleをカンマ区切りで指定
      itemGenre: Required<string>(), //アイテムジャンル MycaAppGenre.nameを使う
      rarity: Optional<mycaItem['rarity']>(), //レアリティ 以下、部分一致の時は %値% のように指定、カンマ区切りで複数指定可能
      expansion: Optional<mycaItem['expansion']>(), //エキスパンション
      name: Optional<string>(), //カード名とキーワード
      cardnumber: Optional<mycaItem['cardnumber']>(), //型番
      cardseries: Optional<mycaItem['cardseries']>(), //シリーズ
      card_type: Optional<mycaItem['type']>(), //タイプ
      option1: Optional<mycaItem['option1']>(),
      option2: Optional<mycaItem['option2']>(),
      option3: Optional<mycaItem['option3']>(),
      option4: Optional<mycaItem['option4']>(Number),
      option5: Optional<mycaItem['option5']>(),
      option6: Optional<mycaItem['option6']>(),
      release_date: Optional<mycaItem['release_date']>(), //公開日
      displaytype1: Optional<mycaItem['displaytype1']>(), //ディスプレイタイプ1
      displaytype2: Optional<mycaItem['displaytype2']>(), //ディスプレイタイプ2
      store_id: Optional<string>(), //ストアID カンマ区切りで複数指定可能
      specialty: Optional<string>(), //スペシャリティ カンマ区切りで複数指定可能
      id: Optional<string>(), //myca_item_id カンマ区切りで複数可能
      myca_primary_pack_id: Optional<string>(), //封入パックID カンマ区切りで複数指定可能

      //並び替えの定義
      orderBy: Optional<string>(
        defOrderBy([
          'actual_ec_sell_price', //価格
        ]),
      ),

      //ページネーションの指定は必ず必要
      take: Required<number>(
        Number,
        (v) => v < 100 || 'takeの指定は100以下でないといけません',
      ), //取得する数
      skip: Optional<number>(Number), //飛ばす数
    },
  },
  process: `
  `,
  response: <
    {
      items: Array<
        mycaItem & {
          //Mycalinksアプリ上でのアイテム情報は全て含まれる
          topPosProduct: {
            //状態が一番高いPOSのProduct
            id: Product['id']; //POS上のproduct_id
            condition_option_handle: Item_Category_Condition_Option['handle']; //状態ハンドル
            actual_ec_sell_price: Product['actual_ec_sell_price']; //EC販売価格（税込） この
            ec_stock_number: Product['ec_stock_number']; //この在庫の在庫数
          };
          productCount: number; //合計で何件の出品があるか
        }
      >;
    }
  >{},
};

//ECお問い合わせ
export const submitEcContactDef = {
  method: apiMethod.POST,
  path: 'ec/contact',
  privileges: {
    role: [apiRole.everyone, apiRole.mycaUser], //誰でも
  },
  request: {
    params: {},
    body: {
      kind: Required<string>(), //お問い合わせの種類
      content: Required<string>(), //お問合せ本文
      myca_item_id: Optional<number>(Number), //MycaアプリのアイテムID
    },
  },
  process: `
  `,
  response: {
    ok: 'お問い合わせが送信されました',
  },
};

//EC商品取得API（ページネーションなし）
export const getEcProductDef = {
  method: apiMethod.GET,
  path: 'ec/item/[myca_item_id]/product',
  privileges: {
    role: [apiRole.everyone], //誰でも
  },
  request: {
    params: {
      myca_item_id: Required<number>(Number), //Myca上でのitem_id
    },
    query: {
      conditionOption: Optional<ConditionOptionHandle>(ConditionOptionHandle), //状態
      hasStock: Optional<boolean>(Boolean), //在庫のあるものだけを取得するかどうか
      specialty: Optional<string>(), //スペシャリティ カンマ区切りで指定する
    },
  },
  process: `
  `,
  response: <
    {
      mycaItem: mycaItem;
      products: Array<{
        id: Product['id']; //在庫ID
        ec_stock_number: Product['ec_stock_number']; //EC用の在庫数
        actual_ec_sell_price: Product['actual_ec_sell_price']; //EC用の税込価格
        store: {
          id: Store['id']; //ストアID
          display_name: Store['display_name']; //ストア名
          ec_setting: {
            same_day_limit_hour: Ec_Setting['same_day_limit_hour']; //即時発送をする時、期限の時間
            shipping_days: Ec_Setting['shipping_days']; //発送までにかかる営業日数
            free_shipping: boolean; //送料無料かどうか
          };
        };
        condition_option: {
          //状態
          handle: Item_Category_Condition_Option['handle']; //状態ハンドル
        };
        specialty: {
          handle: Specialty['handle']; //特殊状態ハンドル
        } | null;
      }>;
    }
  >{},
};

export enum DeckAvailableProductsPriorityOption {
  //優先するオプション
  COST = 'COST', //安さ重視
  SHIPPING_DAYS = 'SHIPPING_DAYS', //発送までの日数重視
}

//デッキで利用可能な在庫を取得するAPI
export const getEcDeckAvailableProductsDef = {
  method: apiMethod.GET,
  path: 'ec/item/deck-available-products',
  privileges: {
    role: [apiRole.everyone], //誰でも
  },
  request: {
    query: {
      deckId: Optional<number>(Number), //デッキID（ポケカ公式デッキ以外の時に指定する）
      code: Optional<string>(), //デッキコード（ポケカ公式デッキの時は指定する）
      anyRarity: Required<boolean>(Boolean), //レアリティ問わず trueだったら問わないことになる
      anyCardnumber: Required<boolean>(Boolean), //型番問わず trueだったら問わないことになる
      conditionOption: Optional<string>(String), //状態 カンマ区切りで指定 問わない時は何もしていしなくてOK
      priorityOption: Optional<DeckAvailableProductsPriorityOption>(
        DeckAvailableProductsPriorityOption,
      ), //優先するオプション
    },
  },
  process: `
  `,
  response: <
    {
      //このデッキで必要なアイテム
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
    }
  >{},
};

// ECオーダー領収書発行API
export const getEcOrderReceiptDef = {
  method: apiMethod.GET,
  path: 'ec/order/[order_id]/receipt',
  privileges: {
    role: [apiRole.mycaUser],
  },
  request: {
    params: {
      order_id: Required<Ec_Order['id']>(Number),
    },
    query: {
      store_id: Required<Store['id']>(Number),
      customer_name: Optional<string>(),
    },
  },
  response: <
    {
      receiptUrl: string; // 領収書URL（署名付） 30分間有効
    }
  >{},
  error: {} as const,
};

//顧客側、ECオーダー作成・更新（確定はまた別のAPI）
export const createOrUpdateEcOrderDef = {
  method: apiMethod.POST,
  path: 'ec/order',
  privileges: {
    role: [apiRole.everyone, apiRole.mycaUser, apiRole.pos], //支払い方法以降はMycaユーザーじゃないとすすめない 一旦開発用にcorpも入れる
  },
  request: {
    params: {},
    query: {
      includesShippingMethodCandidates: Optional<true>(Boolean), //配送方法候補を含めるかどうか（支払い方法を選択する前のみ）
      includesPaymentMethodCandidates: Optional<true>(Boolean), //支払い方法の候補を取得するかどうか（配送方法を選択した後のみ）
    },
    body: {
      code: Optional<Ec_Order['code']>(), //既存のカートを更新する場合、オーダーコードを指定しなければならない すでにあるのに指定しなかった場合、Mycaユーザーだったら上書きされる
      shipping_address_prefecture:
        Optional<Ec_Order['shipping_address_prefecture']>(), //お届け先の県だけ指定できる（実際に使う住所はshipping_address）
      cart_stores: [
        //カート定義は毎回指定しないといけない（空配列にするとリセットされる）
        {
          store_id: Required<Ec_Order_Cart_Store['store_id']>(), //ストアID
          shipping_method_id:
            Optional<Ec_Order_Cart_Store['shipping_method_id']>(), //配送方法ID
          products: [
            //こちらも毎回指定しないといけない
            {
              product_id: Required<Ec_Order_Cart_Store_Product['product_id']>(), //在庫ID
              original_item_count:
                Required<Ec_Order_Cart_Store_Product['original_item_count']>(), //希望個数
            },
          ],
        },
      ],
    },
  },
  process: `
  `,
  response: <
    {
      id: Ec_Order['id']; //オーダーID（オーダー確定時とかに使う）
      code: Ec_Order['code']; //コード（オーダー更新時とかに使う）
      customer_name: Ec_Order['customer_name']; //顧客名
      shipping_address: Ec_Order['shipping_address']; //お届け先住所
      shipping_address_prefecture: Ec_Order['shipping_address_prefecture'];
      shipping_total_fee: Ec_Order['shipping_total_fee']; //送料合計（配送方法が指定されていた場合）
      total_price: Ec_Order['total_price']; //合計金額
      paymentMethodCandidates?: Array<EcPaymentMethod>; //利用できる決済方法 クエリパラメータで指定したときのみ返す

      cart_stores: Array<{
        //カート内訳
        store_id: Ec_Order_Cart_Store['store_id'];
        total_price: Ec_Order_Cart_Store['total_price']; //ストアごとの合計金額（送料も含める）
        shipping_method_id: Ec_Order_Cart_Store['shipping_method_id'];
        shipping_fee: Ec_Order_Cart_Store['shipping_fee']; //配送料
        shippingMethodCandidates?: Array<{
          //配送方法候補（includesShippingMethodCandidates=true時）
          id: Shipping_Method['id']; //ID
          display_name: Shipping_Method['display_name']; //名前
          // is_all_in_one_fee: Shipping_Method['is_all_in_one_fee']; //まとめて一点として送料を計算するかどうか
          fee: number; //この商品重量、配送先地域、配送方法だった時の配送料
        }>;

        products: Array<{
          //商品定義
          product_id: Ec_Order_Cart_Store_Product['product_id']; //在庫ID
          total_unit_price: Ec_Order_Cart_Store_Product['total_unit_price']; //単価
          original_item_count: Ec_Order_Cart_Store_Product['original_item_count']; //希望個数
          product: {
            condition_option: {
              handle: Item_Category_Condition_Option['handle']; //状態ハンドル
            };
            specialty: {
              handle: Specialty['handle']; //特殊性ハンドル
            } | null;
            item: {
              myca_item_id: Item['myca_item_id']; //Myca上のアイテムID
            };
          };
        }>;
      }>;

      //不足在庫があった時
      insufficientProducts?: Array<{
        product_id: Ec_Order_Cart_Store_Product['product_id']; //在庫ID
        insufficient_count: number; //不足している個数
        item: {
          id: mycaItem['id']; //MycaアイテムID
          cardname: mycaItem['cardname']; //カード名
          rarity: mycaItem['rarity']; //レアリティ
          expansion: mycaItem['expansion']; //エキスパンション
          cardnumber: mycaItem['cardnumber']; //型番
          full_image_url: mycaItem['full_image_url']; //画像URL
        }; //Mycaアイテム情報
        condition_option: {
          handle: Item_Category_Condition_Option['handle']; //状態ハンドル
        };
      }>;
    }
  >{},
};

//顧客側、ECオーダー注文確定
//決済導入に合わせて指定するフィールド増えそうです
//nonceとか導入するかも
export const payEcOrderDef = {
  method: apiMethod.POST,
  path: 'ec/order/[order_id]/pay',
  privileges: {
    role: [apiRole.mycaUser, apiRole.pos], //Mycaユーザーじゃないと確定できない
  },
  request: {
    params: {
      order_id: Required<Ec_Order['id']>(Number), //オーダーID
    },
    query: {},
    body: {
      payment_method: Required<Ec_Order['payment_method']>(EcPaymentMethod), //支払い方法
      total_price: Required<Ec_Order['total_price']>(), //単価変動時にエラーを発するためにここで合計金額を指定する
      card_id: Optional<Gmo_Credit_Card['id']>(), //カードID
      convenience_code: Optional<string>(), //コンビニ決済のコード
      //支払いに関する情報を入力するかも（カードトークンなど）
    },
  },
  process: `
  `,
  response: <
    //在庫数が足りない時、エラーになる
    {
      id: Ec_Order['id']; //オーダーID（オーダー確定時とかに使う）
      code: Ec_Order['code']; //コード（オーダー更新時とかに使う）
      status: Ec_Order['status']; //支払い終わったかどうかなどのステータス
      payment_method: Ec_Order['payment_method']; //支払い方法
      payment_info: Ec_Order['payment_info']; //支払い情報
      customer_name: Ec_Order['customer_name']; //顧客名
      shipping_address: Ec_Order['shipping_address']; //お届け先住所
      shipping_address_prefecture: Ec_Order['shipping_address_prefecture'];
      shipping_total_fee: Ec_Order['shipping_total_fee']; //送料合計（配送方法が指定されていた場合）
      total_price: Ec_Order['total_price']; //合計金額
      ordered_at: Ec_Order['ordered_at']; //注文日時
      cart_stores: Array<{
        //カート内訳
        store_id: Ec_Order_Cart_Store['store_id'];
        store: {
          display_name: Store['display_name']; //ストア名
        };
        total_price: Ec_Order_Cart_Store['total_price']; //ストアごとの合計金額（送料も含める）
        shipping_method_id: Ec_Order_Cart_Store['shipping_method_id'];
        shipping_method: {
          display_name: Shipping_Method['display_name']; // 配送方法名
        } | null;
        shipping_fee: Ec_Order_Cart_Store['shipping_fee']; //配送料
        status: Ec_Order_Cart_Store['status']; //ステータス
        code: Ec_Order_Cart_Store['code']; //オーダーコード（ストアごと）
        products: Array<{
          //商品定義
          product_id: Ec_Order_Cart_Store_Product['product_id']; //在庫ID
          total_unit_price: Ec_Order_Cart_Store_Product['total_unit_price']; //単価
          original_item_count: Ec_Order_Cart_Store_Product['original_item_count']; //希望個数
          product: {
            ec_stock_number: Product['ec_stock_number']; //EC在庫数
            condition_option: {
              handle: Item_Category_Condition_Option['handle']; //状態ハンドル
            };
            specialty: {
              handle: Specialty['handle']; //特殊性ハンドル
            } | null;
            item: {
              myca_item_id: Item['myca_item_id']; //Myca上のアイテムID
            };
            mycaItem: {
              id: mycaItem['id']; //MycaアイテムID
              cardname: mycaItem['cardname']; //カード名
              rarity: mycaItem['rarity']; //レアリティ
              expansion: mycaItem['expansion']; //エキスパンション
              cardnumber: mycaItem['cardnumber']; //型番
              full_image_url: mycaItem['full_image_url']; //画像URL
            }; //Mycaアイテム情報
          };
        }>;
      }>;
    }
  >{},
  error: {
    noShippingMethod: {
      status: 400,
      messageText: '決済を行う前に配送方法の指定が必要です',
    },
    noShippingAddress: {
      status: 400,
      messageText: '決済を行う前に配送先の指定が必要です',
    },
    noProducts: {
      status: 400,
      messageText: '商品が選択されていません',
    },
    invalidShippingMethod: {
      status: 400,
      messageText: '利用できない配送方法です',
    },
    invalidTotalPrice: {
      status: 500,
      messageText:
        '合計金額が変動しました、再度商品価格が変更された可能性があります',
    },
  } as const,
};

//顧客側、ECオーダー取得API
export const getEcOrderDef = {
  method: apiMethod.GET,
  path: 'ec/order',
  privileges: {
    role: [apiRole.mycaUser, apiRole.everyone], //ログインしてない場合、codeを指定する必要がある
  },
  request: {
    params: {},
    query: {
      code: Optional<Ec_Order['code']>(), //ログインしてない場合必要
      status: Optional<Ec_Order['status']>(EcOrderStatus), //オーダー自体のステータス ログインしてない場合指定できない
      //おそらくここにストアカートごとのステータスを追加する
      id: Optional<Ec_Order['id']>(Number), //ログインしてない場合指定できない

      includesInsufficientProducts: Optional<true>(Boolean), //不足在庫を含めるかどうか（下書きだけ） 処理が重たいため、必要ないときは必ず指定しないこと
    },
  },
  process: `
  `,
  response: <
    {
      orders: Array<
        typeof payEcOrderDef.response & {
          //不足在庫があった時
          insufficientProducts?: Array<{
            product_id: Ec_Order_Cart_Store_Product['product_id']; //在庫ID
            insufficient_count: number; //不足している個数
            item: {
              id: mycaItem['id']; //MycaアイテムID
              cardname: mycaItem['cardname']; //カード名
              rarity: mycaItem['rarity']; //レアリティ
              expansion: mycaItem['expansion']; //エキスパンション
              cardnumber: mycaItem['cardnumber']; //型番
              full_image_url: mycaItem['full_image_url']; //画像URL
            }; //Mycaアイテム情報
            condition_option: {
              handle: Item_Category_Condition_Option['handle']; //状態ハンドル
            };
            specialty: {
              handle: Specialty['handle']; //特殊状態ハンドル
            } | null;
          }>;
        }
      >;
    }
  >{},
};

/**
 * ECオーダーお問合せ返信、変更API
 */
export const createEcOrderContactDef = {
  method: apiMethod.POST,
  path: 'ec/order/contact',
  privileges: {
    role: [apiRole.mycaUser, apiRole.pos], //Mycaユーザーである必要がある
  },
  request: {
    body: {
      code: Required<Ec_Order_Cart_Store['code']>(), //ストアごとのオーダーコード
      // reply_to_id: Optional<Ec_Order_Cart_Store_Contact['id']>(Number), //返信先のID 初送りの時はnull 廃止
      kind: Optional<Ec_Order_Cart_Store_Contact['kind']>(String), //お問い合わせの種類 //これと件名に関しては、初送りの時のみ指定できる
      title: Optional<Ec_Order_Cart_Store_Contact['title']>(String), //件名
      content: Optional<Ec_Order_Cart_Store_Contact_Message['content']>(String), //内容 これをundefinedにすることで、既読だけつけることができる
    },
  },
  process: `
  `,
  response: <
    {
      //この注文、このストアに関するお問い合わせ
      ecOrderContact: Ec_Order_Cart_Store_Contact & {
        messages: Array<{
          id: Ec_Order_Cart_Store_Contact_Message['id']; //ID
          content: Ec_Order_Cart_Store_Contact_Message['content']; //内容
          created_at: Ec_Order_Cart_Store_Contact_Message['created_at']; //作成日時
          myca_user_id: Ec_Order_Cart_Store_Contact_Message['myca_user_id']; //自分が送信しているメッセージの場合、ここにユーザーIDが入る
        }>;
      };
    }
  >{},
  error: {
    kindTitle: {
      status: 400,
      messageText:
        '新規お問合せではお問合せ種類と件名とメッセージ本文が必須です',
    },
  } as const,
};

//顧客向け、ECオーダーお問合せ取得
export const getEcOrderContactDef = {
  method: apiMethod.GET,
  path: 'ec/order/contact',
  privileges: {
    role: [apiRole.mycaUser], //Mycaユーザーである必要がある
  },
  request: {
    query: {
      code: Optional<Ec_Order_Cart_Store['code']>(), //ストアごとのオーダーコード
      skip: Optional<number>(Number), //スキップする件数
      take: Optional<number>(Number), //取得する件数
      includesMessages: Optional<true>(Boolean), //メッセージContentを含めるかどうか
    },
  },
  process: `
  `,
  response: <
    {
      ecOrderContacts: Array<{
        order_store: {
          order: {
            id: Ec_Order['id']; //オーダーID
            code: Ec_Order['code']; //オーダーコード
          };
          code: Ec_Order_Cart_Store['code']; //オーダーコード（店舗ごとのやつ）
          store: {
            display_name: Store['display_name']; //ストア名
          };
        };
        last_sent_at: Ec_Order_Cart_Store_Contact['last_sent_at']; //最後に送信した日時
        myca_user_last_read_at: Ec_Order_Cart_Store_Contact['myca_user_last_read_at']; //最終既読時間
        kind: Ec_Order_Cart_Store_Contact['kind']; //お問い合わせの種類
        title: Ec_Order_Cart_Store_Contact['title']; //件名
        messages: Array<{
          //メッセージ内容
          id: Ec_Order_Cart_Store_Contact_Message['id']; //ID
          content?: Ec_Order_Cart_Store_Contact_Message['content']; //内容 includesMessagesした時のみ
          created_at: Ec_Order_Cart_Store_Contact_Message['created_at']; //作成日時
          myca_user_id: Ec_Order_Cart_Store_Contact_Message['myca_user_id']; //自分が送信しているメッセージの場合、ここにユーザーIDが入る
        }>;
      }>;
    }
  >{},
};

// ECメッセージセンター既読API
export const readEcMessageCenterDef = {
  method: apiMethod.POST,
  path: 'ec/message-center/[message_id]/read',
  privileges: {
    role: [apiRole.mycaUser],
  },
  request: {
    params: {
      message_id: Required<Ec_Message_Center['id']>(Number),
    },
    query: {},
  },
  process: `
  `,
  response: <Ec_Message_Center>{},
} as const;

// ECメッセージセンター取得API
export const getEcMessageCenterDef = {
  method: apiMethod.GET,
  path: 'ec/message-center',
  privileges: {
    role: [apiRole.mycaUser],
  },
  request: {
    params: {},
    query: {
      id: Optional<Ec_Message_Center['id']>(Number),
      take: Optional<number>(Number),
      skip: Optional<number>(Number),
    },
  },
  process: `
  `,
  response: <
    {
      messageCenters: Array<
        Ec_Message_Center & {
          order_store: {
            code: string;
            store: {
              display_name: Store['display_name'];
            };
          } | null;
        }
      >;
    }
  >{},
} as const;
