import { ApiEventObj } from 'backend-core';
import {
  apiMethod,
  apiRole,
  defOrderBy,
  Optional,
  Required,
  ResponseMsgKind,
  StreamRes,
} from '@/api/backendApi/main';
import { mycaItem } from '@/app/api/store/[store_id]/myca-item/api';
import { MycaAppGenre } from 'backend-core';
import {
  Account,
  Bundle_Item_Product,
  Condition_Option_Rate,
  ConditionOptionHandle,
  Customer,
  Ec_Order,
  Ec_Order_Cart_Store_Product,
  Item,
  Item_Category,
  Item_Category_Condition_Option,
  Item_Genre,
  Item_Group,
  Original_Pack_Product,
  Product,
  Store,
  Tablet_Allowed_Genre_Category,
  Transaction,
  Transaction_Cart,
} from '@prisma/client';

//商品マスタベースで取引の統計情報を取得したい時のAPI
/**
 * @deprecated
 */
export const listItemWithTransaction = {
  method: apiMethod.GET,
  path: 'store/[store_id]/item/transaction/',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    query: {
      transactionFinishedAtGte: Optional<Transaction['finished_at']>(Date), //取引終了日時の開始時間指定
      transactionFinishedAtLt: Optional<Transaction['finished_at']>(Date), //取引終了日時の終了時間指定
      transaction_kind: Optional<Transaction['transaction_kind']>(), //取引種類
      item_id: Optional<Item['id']>(Number), //商品マスタID
      display_name: Optional<Item['display_name']>(), //名前
      category_id: Optional<Item['category_id']>(Number), //商品種別
      genre_id: Optional<Item['genre_id']>(Number), //商品ジャンル
      rarity: Optional<Item['rarity']>(), //レアリティ
      cardnumber: Optional<Item['cardnumber']>(), //型番
      expansion: Optional<Item['expansion']>(), //エキスパンション
      // productsTagName: Optional<Tag['display_name']>(), //タグ名（完全一致） このタグが含まれているproductsがある商品マスタのみ取得する形
      customer_id: Optional<Customer['id']>(Number), //顧客ID

      orderBy: Optional<string>( //ソートの定義
        defOrderBy([
          'transactionCount', //取引件数
          'transactionProductsCount', //取引点数
          'transactionTotalPrice', //取引総額
        ]),
      ),

      take: Optional<number>(Number), //飛ばす数
      skip: Optional<number>(Number), //取得する数

      includesTransactions: Optional<true>(Boolean), //内訳の取引情報まで取得するかどうか
      includesSummary: Optional<true>(Boolean), //合計件数まで取得するかどうか
    },
  },
  process: `
  `,
  response: <
    {
      items: Array<{
        item: Item; //商品マスタ自体の情報
        item_id: Item['id'];
        transaction_kind: Transaction['transaction_kind']; //取引の種類
        transactionStats: {
          transactionCount: number; //取引件数
          transactionProductsCount: number; //取引点数
          transactionTotalPrice: number; //取引総額
        };
        //includesTransactions=trueの時のみ
        transactions?: Array<{
          transaction: {
            //この取引の情報
            id: Transaction['id'];
            finished_at: Transaction['finished_at'];
            payment_method: Transaction['payment_method'];
          };
          item_count: Transaction_Cart['item_count']; //この在庫の点数
          total_unit_price: Transaction_Cart['total_unit_price']; //最終的な単価
          total_discount_price: Transaction_Cart['total_discount_price']; //最終的な割引額（セール、手動込み）
          product: {
            id: Product['id']; //この在庫のID
            condition_option: {
              id: Item_Category_Condition_Option['id']; //状態の選択肢ID
              display_name: Item_Category_Condition_Option['display_name']; //状態の選択肢名
            } | null;
          };
        }>;
      }>;
      summary?: {
        //includesSummary=trueを指定したら返ってくるフィールド
        totalCount: number; //合計件数
        totalSellPrice: number; //合計販売価格
        totalBuyPrice: number; //合計買取価格
      };
    }
  >{},
};

//オリパの作成を行うAPI（移動してきた）
/**
 * @deprecated Use createOriginalPackApi from api-generator instead
 */
export const createOriginalPackDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/item/original-pack',
  privileges: {
    role: [apiRole.pos], //スタッフアカウントでも実行できる
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    body: {
      id: Optional<Item['id']>(), //既存の下書きオリパ（商品マスタ）に対しての処理を行うとき
      asDraft: Optional<boolean>(), //下書きとして登録する場合はasDraft 指定しなかったら完了処理に入る（スマホ版から実行する時は原則trueを指定する）

      staff_account_id: Optional<Account['id']>(), //このオリパを作り始めた担当者ID 完了時に必要
      //スタッフはHeaderで指定が必要

      display_name: Optional<Item['display_name']>(), //表示名 新規作成時に必要
      init_stock_number: Optional<Item['init_stock_number']>(), //初期在庫数 作成完了時に必要
      sell_price: Optional<Item['sell_price']>(), //販売価格 作成完了時に必要
      image_url: Optional<Item['image_url']>(), //画像
      genre_id: Optional<Item['genre_id']>(), //ジャンル
      category_id: Optional<Item['category_id']>(), //カテゴリID オリパ or 福袋（LUCKY_BAG）から選ばないといけない

      products: [
        //オリパの定義（PCから実行するときここを指定する 指定しない時は空配列ではなくてundefinedにすること）
        {
          product_id: Required<Original_Pack_Product['product_id']>(), //在庫ID
          staff_account_id:
            Required<Original_Pack_Product['staff_account_id']>(), //担当者ID PCから送信の場合でも入れる ここは指定が必要
          item_count: Required<Original_Pack_Product['item_count']>(), //個数
        },
      ],
      additional_products: [
        //定義を追加するときに指定する（スマホから実行するときここを指定する 指定しない時は空配列ではなくてundefinedにすること）
        {
          product_id: Required<Original_Pack_Product['product_id']>(), //在庫ID
          // staff_account_id:
          //   Required<Original_Pack_Product['staff_account_id']>(), //担当者ID PCから送信の場合でも入れる
          //ここはヘッダーで指定が必要
          item_count: Required<Original_Pack_Product['item_count']>(), //個数
        },
      ],
    },
  },
  process: `
  
  `,
  response: <
    //リアルタイムAPIとおんなじような形式
    Item & {
      original_pack_products: Array<
        Original_Pack_Product & {
          //オリパ定義の在庫リスト この中の在庫の情報の取得については product取得APIを使いたい
          staff_account: {
            display_name: Account['display_name']; //担当者名
            // kind: Account['kind']; //このアカウントの種類
          };
        }
      >;
      products?: Array<Product>; //作成を完了させた場合、自動生成された在庫の情報も返ってくる
    }
  >{},
  error: {
    invalidProductsParameter: {
      status: 400,
      messageText:
        'to_productsとadditional_productsを同時に指定することはできません',
    },
    additionalProductsWhenCreate: {
      status: 400,
      messageText: '新規登録時にadditional_productsは指定できません',
    },
    invalidDepartment: {
      status: 400,
      messageText: 'オリパ・福袋登録では指定できない部門です',
    },
    failedToCreateProducts: {
      status: 500,
      messageText: '正常に在庫が作成されませんでした',
    },
    notEnoughToFinish: {
      status: 400,
      messageText:
        'オリパの作成を完了させるためにはinit_stock_nunmberとsell_priceの登録が必要です',
    },
    noStaffAccountId: {
      status: 400,
      messageText:
        'オリパの登録を完了させるためには担当者のIDを指定する必要があります',
    },
  } as const,
};

//既存オリパの補充API
/**
 * @deprecated Use addOriginalPackApi from api-generator instead
 */
export const addOriginalPackDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/item/[item_id]/add-original-pack',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      item_id: Required<Item['id']>(Number), //既存オリパの商品マスタID
    },
    body: {
      additionalStockNumber: Required<number>(), //追加する在庫数
      additionalProducts: [
        //オリパの定義
        {
          product_id: Required<Original_Pack_Product['product_id']>(), //在庫ID
          item_count: Required<Original_Pack_Product['item_count']>(), //個数
        },
      ],
    },
  },
  process: `
  
  `,
  response: <typeof createOriginalPackDef.response>{},
  error: {} as const,
};

//商品マスタの更新イベントを取得するリアルタイムAPI
/**
 * @deprecated こいつは普通に廃止する
 */
export const subscribeUpdateItemDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/item/[item_id]/subscribe/',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      item_id: Required<Item['id']>(Number),
    },
  },
  process: `
  商品マスタの定義などが更新された時に通知する
  現在は主にオリパ用
  `,
  response: StreamRes<ApiEventObj.Item>(),
};

//商品種別取得API
/**
 * @deprecated Use getItemCategoryApi from api-generator instead
 */
export const getItemCategoryDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/item/category',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    query: {
      //数が多くならないため、絞り込みは想定しない
    },
  },
  process: `
  状態選択肢もついでに返す（%は返さない）
  `,
  response: <
    {
      itemCategories: Array<
        Item_Category & {
          //カテゴリ自体の情報
          condition_options: Array<
            Item_Category_Condition_Option & {
              _count: {
                products: number; //この選択肢に紐づいている在庫数
              };
              rate_variants: Array<Condition_Option_Rate>;
            }
          >; //カテゴリに結びついている状態選択肢の定義
          groups: Array<Item_Group>; //商品マスタグループ（高額など）
        }
      >;
    }
  >{},
};

//商品種別作成・更新API
/**
 * @deprecated Use createOrUpdateItemCategoryApi from api-generator instead
 */
export const createOrUpdateItemCategoryDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/item/category',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    body: {
      id: Optional<Item_Category['id']>(), //既存のID
      display_name: Optional<Item_Category['display_name']>(), //種別名
      hidden: Optional<Item_Category['hidden']>(), //非表示
      order_number: Optional<Item_Category['order_number']>(), //表示順
    },
  },
  process: `

  `,
  response: <Item_Category>{},
};

//商品種別削除API
/**
 * @deprecated Use deleteItemCategoryApi from api-generator instead
 */
export const deleteItemCategoryDef = {
  method: apiMethod.DELETE,
  path: 'store/[store_id]/item/category/[item_category_id]',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      item_category_id: Required<Item_Category['id']>(Number),
    },
  },
  process: `
  システムで管理しているものは削除できないようにする
  `,
  response: {
    ok: ResponseMsgKind.deleted,
  },
};

// export enum CardConditionOptionHandle {
//   A = 'A',
//   B = 'B',
//   C = 'C',
//   D = 'D',
// }

const rateVariantsDef = [
  //コンディション選択肢の価格調整%定義 追加も削除もしない場合はundefined 追加する場合などでも、既存のすべてのvariantsを配列にぶちこむ
  {
    group_id: Optional<Condition_Option_Rate['group_id']>(), //特定の商品マスタグループについての選択肢ならこれを入れる nullは規定
    genre_id: Optional<Condition_Option_Rate['genre_id']>(), //特定の商品マスタジャンルについての選択肢ならこれを入れる nullは規定

    auto_sell_price_adjustment:
      Required<Condition_Option_Rate['auto_sell_price_adjustment']>(), //販売価格 調整量 %指定と円指定可能
    auto_buy_price_adjustment:
      Required<Condition_Option_Rate['auto_buy_price_adjustment']>(), //買取価格 調整量 %指定と円指定可能
  },
];

//コンディション選択肢作成・更新API 商品グループについては別のAPIで作成等を行う
//選択肢の追加はカードコンディションのみ可能
/**
 * @deprecated Use createOrUpdateConditionOptionApi from api-generator instead
 */
export const createOrUpdateConditionOptionDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/item/category/[item_category_id]/condition-option',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      item_category_id: Required<Item_Category['id']>(Number),
    },
    body: {
      id: Optional<Item_Category_Condition_Option['id']>(), //既存のID
      display_name: Optional<Item_Category_Condition_Option['display_name']>(), //名前
      handle: Optional<ConditionOptionHandle | null>(ConditionOptionHandle), //カードコンディションの選択肢を「A」「B」などシステムで管理できる値と結びつけるためのフィールド（更新時のみ指定可能）
      order_number: Optional<Item_Category_Condition_Option['order_number']>(), //カードコンディションの選択肢をシステムで管理できる値と結びつけるためのフィールド（更新時のみ指定可能）
      description: Optional<Item_Category_Condition_Option['description']>(),
      rate_variants: rateVariantsDef as typeof rateVariantsDef | undefined,
    },
  },
  process: `
  `,
  response: <
    Item_Category_Condition_Option & {
      rate_variants: Array<Condition_Option_Rate>;
    }
  >{},
};

//コンディション選択肢削除API
/**
 * @deprecated Use deleteConditionOptionApi from api-generator instead
 */
export const deleteConditionOptionDef = {
  method: apiMethod.DELETE,
  path: 'store/[store_id]/item/category/[item_category_id]/condition-option/[condition_option_id]',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      item_category_id: Required<Item_Category['id']>(Number),
      condition_option_id:
        Required<Item_Category_Condition_Option['id']>(Number),
    },
    // body: {
    //   replaceToOptionId: Required<
    //     Item_Category_Condition_Option['id'] | null
    //   >(), //この状態をどの状態に変更するか nullを指定したら状態なしに変更される
    // },
  },
  process: `
  `,
  response: {
    ok: ResponseMsgKind.deleted,
  },
  error: {
    stillHasProducts: {
      status: 400,
      messageText:
        '状態選択肢を削除するためには、紐づいている在庫の在庫数がすべて0でないといけません',
    },
  } as const,
};

//商品グループ作成・更新API
/**
 * @deprecated Use createOrUpdateItemGroupApi from api-generator instead
 */
export const createOrUpdateItemGroupDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/item/category/[item_category_id]/group',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      item_category_id: Required<Item_Category['id']>(Number),
    },
    body: {
      id: Optional<Item_Group['id']>(), //更新する場合、そのID

      display_name: Required<Item_Group['display_name']>(), //名前
    },
  },
  process: `
  `,
  response: <Item_Group>{},
};

//商品グループ削除API
/**
 * @deprecated Use deleteItemGroupApi from api-generator instead
 */
export const deleteItemGroupDef = {
  method: apiMethod.DELETE,
  path: 'store/[store_id]/item/category/[item_category_id]/group/[item_group_id]',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      item_category_id: Required<Item_Category['id']>(Number),
      item_group_id: Required<Item_Group['id']>(Number),
    },
  },
  process: `
  `,
  response: {
    ok: ResponseMsgKind.deleted,
  },
};

//バンドル作成
/**
 * @deprecated Use createBundleApi from api-generator instead
 */
export const createBundleDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/item/bundle',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    body: {
      id: Optional<Item['id']>(), //編集を行うときに必要なID
      // staff_account_id: Required<Account['id']>(),
      //スタッフIDはHeaderで指定が必要

      sell_price: Required<Item['sell_price']>(), //販売価格
      init_stock_number: Required<Item['init_stock_number']>(
        Number,
        (e) => e! > 0 || '在庫の指定が不正です',
      ), //初期在庫数
      display_name: Required<Item['display_name']>(), //商品名
      expire_at: Optional<Item['expire_at']>(), //バンドルの有効期限（自動解体日）
      start_at: Optional<Item['start_at']>(Date), //バンドルの開始日（今すぐの場合は今日の日を指定 2/13の場合は、日本TZ上での「2025-02-13T00:00:00」を指定すること 指定しない場合「今すぐ」と同義
      genre_id: Optional<Item['genre_id']>(), //商品ジャンル
      image_url: Optional<Item['image_url']>(), //画像URL
      products: [
        //商品定義
        {
          product_id: Required<Bundle_Item_Product['product_id']>(), //在庫ID
          item_count: Required<Bundle_Item_Product['item_count']>(), //商品数
        },
      ],
    },
  },
  process: `
  `,
  response: <
    Item & {
      bundle_item_products: Array<Bundle_Item_Product>;
    }
  >{},
};

//商品ジャンル取得
/**
 * @deprecated Use getItemGenreApi from api-generator instead
 */
export const getItemGenreDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/item/genre',
  privileges: {
    role: [apiRole.pos, apiRole.everyone],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    query: {
      fromTablet: Optional<true>(Boolean), //在庫検索タブレットからかどうか
    },
  },
  process: `
  `,
  response: <
    {
      itemGenres: Array<Item_Genre>;
    }
  >{},
};

//ジャンル作成API
/**
 * @deprecated
 */
export const createItemGenreDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/item/genre',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    body: {
      // staff_account_id: Required<Account['id']>(),
      //スタッフIDはHeaderで指定が必要

      myca_genre_id: Optional<MycaAppGenre['id']>(), //Mycaのジャンルから追加する場合、そのIDを指定する
      display_name: Optional<Item_Genre['display_name']>(), //表示名
    },
  },
  process: `
  `,
  response: <Item_Genre>{},
  error: {
    invalidAppGenre: {
      status: 404,
      messageText: '存在しないMycaジャンルを指定しています',
    },
    alreadyRegistered: {
      status: 400,
      messageText: 'すでに存在するMycaジャンルです',
    },
  } as const,
};

//ジャンル更新・削除API
/**
 * @deprecated
 */
export const updateItemGenreDef = {
  method: apiMethod.PUT,
  path: 'store/[store_id]/item/genre/[item_genre_id]',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      item_genre_id: Required<Item_Genre['id']>(Number),
    },
    body: {
      display_name: Optional<Item_Genre['display_name']>(),
      hidden: Optional<Item_Genre['hidden']>(), //非表示にする時true
      auto_update: Optional<Item_Genre['auto_update']>(), //自動更新をオンにする時true
      deleted: Optional<Item_Genre['deleted']>(), //削除する時true
      order_number: Optional<Item_Genre['order_number']>(),
    },
  },
  process: `
  `,
  response: <Item_Genre>{},
  error: {
    cantDeleteSystemGenre: {
      status: 400,
      messageText: '自動生成部門は削除できません',
    },
    cantAutoUpdateSystemGenre: {
      status: 400,
      messageText: '自動生成部門以外は自動更新設定ができません',
    },
  } as const,
};

//アプリから指定ジャンルのアイテムを一気にインポートするAPI
/**
 * @deprecated Use importAllItemsFromAppByGenreApi from api-generator instead
 */
export const importAllItemsFromAppByGenreDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/item/genre/[item_genre_id]/import-items-from-app',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      item_genre_id: Required<Item_Genre['id']>(Number),
    },
  },
  process: `
  `,
  response: {
    ok: 'アイテムのインポートを開始しました',
  },
  error: {
    cantDeleteSystemGenre: {
      status: 400,
      messageText: '自動生成部門は削除できません',
    },
    cantAutoUpdateSystemGenre: {
      status: 400,
      messageText: '自動生成部門以外は自動更新設定ができません',
    },
  } as const,
};

//ボックスごとアイテムを一気に追加するAPI
//システム上ではアプリ上のボックスのことを「pack」と称しているためpackで
export const createAllItemsFromPackDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/item/pack',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    body: {
      myca_pack_id: Required<mycaItem['item_pack_id']>(), //Myca上のアイテムIDではなく、パックIDを指定する
    },
  },
  process: `
  
  `,
  response: {
    ok: 'カードの登録が開始されました',
  },
  error: {} as const,
};

//商品マスタを検索するための絞り込み選択肢を取得するAPI
export const getItemFindOptionDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/item/find-option',
  privileges: {
    role: [apiRole.pos, apiRole.everyone],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    query: {
      genre_id: Required<Item_Genre['id']>(Number), //POS上でのジャンルIDを指定しないといけない
      category_id: Required<Item_Category['id']>(Number), //POS上でのカテゴリIDを指定しないといけない
    },
  },
  process: `
  
  `,
  response: <
    {
      searchElements: Array<{
        metaLabel: string; //この絞り込み要素の名前
        columnOnPosItem: keyof Item; //POSのItem上でのカラム名
        options: Array<{
          label: string; //選択肢名
          value: string; //選択肢値 現状labelと同値
        }>;
      }>;
    }
  >{},
  error: {
    invalidCategoryGenre: {
      status: 400,
      messageText: 'カテゴリIDとジャンルIDの指定が不適切です',
    },
  } as const,
};

//在庫検索タブレットで許可するカテゴリ・ジャンルの設定
export const getTabletAllowedGenresCategoriesDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/item/tablet-allowed-genres-categories',
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
  response: <
    {
      tabletAllowedGenresCategories: Array<Tablet_Allowed_Genre_Category>;
    }
  >{},
  error: {} as const,
};

//在庫検索タブレットで許可するカテゴリ・ジャンルの設定
//叩くたびに、全ての設定を入力する　空配列を指定したら設定が全て削除される
/**
 * @deprecated Use setTabletAllowedGenresCategoriesApi from api-generator instead
 */
export const setTabletAllowedGenresCategoriesDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/item/tablet-allowed-genres-categories',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    body: {
      tabletAllowedGenresCategories: [
        {
          //ジャンルID
          genre_id: Required<Tablet_Allowed_Genre_Category['item_genre_id']>(),
          //カテゴリID
          category_id:
            Required<Tablet_Allowed_Genre_Category['item_category_id']>(),
          //状態選択肢ID
          condition_option_id:
            Optional<Tablet_Allowed_Genre_Category['condition_option_id']>(),
          //特殊状態ID
          specialty_id:
            Optional<Tablet_Allowed_Genre_Category['specialty_id']>(),
          //在庫上限
          limit_count: Required<Tablet_Allowed_Genre_Category['limit_count']>(),
        },
      ],
    },
  },
  process: `
  
  `,
  response: <
    {
      tabletAllowedGenresCategories: Array<Tablet_Allowed_Genre_Category>;
    }
  >{},
  error: {} as const,
};

//ECの在庫別取引一覧
export const listItemWithEcOrder = {
  method: apiMethod.GET,
  path: 'store/[store_id]/item/ec-order',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    query: {
      display_name: Optional<Item['display_name']>(), //商品名
      item_id: Optional<Item['id']>(Number), //商品ID
      cardnumber: Optional<Item['cardnumber']>(), //商品カード番号
      rarity: Optional<Item['rarity']>(), //レアリティ
      genre_id: Optional<Item_Genre['id']>(Number), //商品マスタジャンルID
      orderCreatedAtGte: Optional<Ec_Order['created_at']>(Date), //注文日時（開始）
      orderCreatedAtLt: Optional<Ec_Order['created_at']>(Date), //注文日時（終了）

      //並び替え定義
      orderBy: Optional<string>( //ソートの定義
        defOrderBy([
          'total_item_count', //合計取引点数
          'total_order_count', //合計注文数
          'total_price', //取引総額
        ]),
      ),

      take: Optional<number>(Number), //飛ばす数
      skip: Optional<number>(Number), //取得する数

      includesSummary: Optional<boolean>(Boolean), //trueだったら合計数も取得する
      includesEcOrders: Optional<boolean>(Boolean), //trueだったらECの注文履歴情報も取得する
    },
  },
  process: `
  パスパラムで指定されているストアのECの注文履歴を商品マスタベースで取得する
  対象のEC取引は、Ec_Order_Cart_Store.statusがCOMPLETEDのもののみ（キャンセルや下書きなどは入れない）
  `,
  response: <
    {
      items: Array<{
        item: Item; //商品マスタ自体の情報
        item_id: Item['id'];
        ecOrderStats: {
          ecOrderCount: number; //ECの取引件数
          ecOrderItemCount: number; //ECの取引点数
          ecOrderTotalPrice: number; //ECの取引総額
        };
        //includesEcOrders=trueの時のみ
        ecOrderCartStoreProducts?: Array<{
          //EC取引の商品内訳
          order_store: {
            //店舗ごとのカート情報
            order: {
              //注文自体の情報
              id: Ec_Order['id']; //注文ID
              ordered_at: Ec_Order['ordered_at']; //注文日時
            };
          };
          product: {
            //在庫の詳細情報
            id: Product['id']; //在庫ID
            condition_option: {
              id: Item_Category_Condition_Option['id']; //状態の選択肢ID
              display_name: Item_Category_Condition_Option['display_name']; //状態の選択肢名
            } | null;
          };
          item_count: Ec_Order_Cart_Store_Product['item_count']; //この在庫の点数
          total_unit_price: Ec_Order_Cart_Store_Product['total_unit_price']; //最終的な単価
        }>;
      }>;
      summary?: {
        //includesSummary=trueを指定したら返ってくるフィールド
        totalCount: number; //合計件数
        totalSellPrice: number; //合計販売価格
      };
    }
  >{},
  error: {} as const,
};

//相場価格とギャップがある商品マスタをスリムに取得する
//adjustAllオプションをつけたら相場価格に是正するリクエストが送信される（非同期処理）
/**
 * @deprecated Use adjustItemsWithMarketPriceGapApi from api-generator instead
 */
export const adjustItemsWithMarketPriceGapDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/item/market-price/adjust-gap',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    query: {
      genre_id: Optional<Item_Genre['id']>(Number), //対象ジャンルID
      category_id: Optional<Item_Category['id']>(Number), //対象カテゴリID
    },
    body: {
      adjustAll: Optional<true>(Boolean), //価格の調整を行うかどうか
    },
  },
  process: `
  
  `,
  response: <
    {
      //対象の商品マスタたち
      targetItems: Array<{
        id: Item['id'];
        display_name: Item['display_name'];
        market_price: Item['market_price'];
        sell_price: Item['sell_price'];
        cardnumber: Item['cardnumber']; //型番
        expansion: Item['expansion']; //エキスパンション
        rarity: Item['rarity']; //レアリティ
      }>;
      adjustRequested: boolean; //価格調整リクエストが送信されたかどうか
    }
  >{},
  error: {} as const,
};
