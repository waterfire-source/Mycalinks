import { ApiEventObj } from 'backend-core';
import {
  apiMethod,
  apiRole,
  defOrderBy,
  Optional,
  Required,
  StreamRes,
} from '@/api/backendApi/main';
import { ItemType } from 'backend-core';
import {
  Account,
  Ec_Order,
  Ec_Order_Cart_Store_Product,
  Item,
  Item_Category_Condition_Option,
  Loss,
  Loss_Genre,
  Loss_Product,
  Pack_Open_History,
  Pack_Open_Products,
  PackOpenStatus,
  Product,
  Product_Stock_History,
  Store,
} from '@prisma/client';

// /**
//  * @deprecated Use attachTagsToProductApi from api-generator instead
//  */
// //在庫にタグを結びつけるAPI
// export const attachTagsToProductDef = {
//   method: apiMethod.POST,
//   path: 'store/[store_id]/product/tag/attach/',
//   privileges: {
//     role: [apiRole.pos], //法人アカウントでのみ実行できる（とりあえず）
//   },
//   request: {
//     params: {
//       store_id: Required<Store['id']>(Number),
//     },
//     body: {
//       products: [
//         //タグをつける対象の在庫リスト
//         {
//           product_id: Required<Product['id']>(), //在庫ID
//           tag_id: Required<Tag['id']>(), //タグのID
//         },
//       ],
//     },
//   },
//   process: `
//   指定した在庫に指定したタグをつける
//   `,
//   response: <
//     {
//       ok: 'タグを付与することができました';
//     }
//   >{},
//   error: {
//     invalidProductOrTag: {
//       status: 400,
//       messageText: '指定できない在庫やタグが含まれています',
//     },
//   } as const,
// };

// /**
//  * @deprecated Use detachTagsFromProductApi from api-generator instead
//  */
// //在庫のタグ取り外しAPI
// export const detachTagsFromProductDef = {
//   method: apiMethod.DELETE,
//   path: 'store/[store_id]/product/[product_id]/tag/[tag_id]/',
//   privileges: {
//     role: [apiRole.pos], //法人アカウントでのみ実行できる
//   },
//   request: {
//     params: {
//       store_id: Required<Store['id']>(Number),
//       product_id: Required<Product['id']>(Number),
//       tag_id: Required<Tag['id']>(Number), //取り外す対象のタグID
//     },
//   },
//   process: `
//   処理の説明
//   `,
//   response: <
//     {
//       tags: Array<{
//         tag: Tag; //タグの情報
//       }>;
//     }
//   >{},
// };

/**
 * @deprecated Use getOpenPackHistoryApi from api-generator instead
 */
//パック開封履歴を取得するAPI
export const getOpenPackHistoryDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/product/open-pack/',
  privileges: {
    role: [apiRole.pos], //法人アカウントでのみ実行できる（とりあえず）
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    query: {
      id: Optional<Pack_Open_History['id']>(Number), //パック開封のID
      from_product_id: Optional<Pack_Open_History['from_product_id']>(Number), //開封対象の在庫のID
      item_id: Optional<Item['id']>(Number), //商品マスタのIDからも攻めれるようにする
      item_type: Optional<ItemType>(), //ORIGINAL_PACK or BUNDLE or NORMAL カンマ区切り
      status: Optional<Pack_Open_History['status']>(PackOpenStatus), //ステータス
    },
  },
  process: `
  パックの開封履歴を取得する
  `,
  response: <
    {
      openPackHistories: Array<
        Pack_Open_History & {
          from_product: {
            //開封対象の在庫についての情報 ここに関しては欲しいフィールドがあれば増やします
            stock_number: Product['stock_number']; //開封対象の現在の在庫数
            item: {
              id: Item['id']; //開封対象の在庫の商品マスタのID
              type: Item['type']; //開封対象の在庫の商品マスタのタイプ（ORIGINAL_PACK or NORMAL） NORMALだったら通常のボックス
              //ボックスの中身定義についてはフロント側で取得する想定
            };
          };
          to_products: Array<
            Pack_Open_Products & {
              //開封した結果の在庫リスト この中の在庫の情報の取得については product取得APIを使いたい
              staff_account: {
                display_name: Account['display_name']; //担当者名
                // kind: Account['kind']; //このアカウントの種類
              };
            }
          >;
        }
      >;
    }
  >{},
  error: {} as const,
};

/**
 * @deprecated Use subscribeUpdateOpenPackHistoryApi from api-generator instead
 */
//パック開封履歴の更新イベントを取得する（リアルタイムAPI）
export const subscribeUpdateOpenPackHistoryDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/product/open-pack/[pack_open_history_id]/subscribe/',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      pack_open_history_id: Required<Pack_Open_History['id']>(Number),
    },
  },
  process: `
  パック開封の履歴が更新されたときに通知する
  `,
  response: StreamRes<ApiEventObj.PackOpenHistory>(),
};

/**
 * @deprecated Use openPackApi from api-generator instead
 */
//パック開封を行うAPI（移動してきた）
export const openPackDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/product/[product_id]/open-pack/',
  privileges: {
    role: [apiRole.pos], //スタッフアカウントでも実行できる
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      product_id: Required<Product['id']>(Number), //開封する対象の在庫ID
    },
    body: {
      id: Optional<Pack_Open_History['id']>(), //既存のパック開封に対しての処理
      asDraft: Optional<boolean>(), //下書きとして登録する場合はasDraft 指定しなかったら完了処理に入る（スマホ版から実行する時は原則trueを指定する）

      item_count: Optional<Pack_Open_History['item_count']>(), //開封するパックの部数 完了させるには必要
      item_count_per_pack: Optional<Pack_Open_History['item_count_per_pack']>(), //パックの一枚あたりの枚数 完了させるには必要
      staff_account_id: Optional<Pack_Open_History['staff_account_id']>(), //このパック開封を作った担当者ID idを指定してないとき（新規作成時）は必要
      //スタッフIDはヘッダーで指定が必要
      unregister_product_id:
        Optional<Pack_Open_History['unregister_product_id']>(), //未登録カードの扱い方 nullだったらロス登録をし、特定の商品IDを入力したらその商品の在庫として登録される オリパ開封の時は指定しなくて大丈夫
      unregister_item_count:
        Optional<Pack_Open_History['unregister_item_count']>(), //未登録カードの枚数 オリパ開封の時は指定しなくて大丈夫
      to_products: [
        //開封結果の在庫（PCから実行するときここを指定する 指定しない時は空配列ではなくてundefinedにすること）
        {
          product_id: Required<Pack_Open_Products['product_id']>(), //在庫ID
          staff_account_id: Required<Pack_Open_Products['staff_account_id']>(), //担当者ID PCから送信の場合でも入れる ここは必要
          item_count: Required<Pack_Open_Products['item_count']>(), //個数
        },
      ],
      additional_products: [
        //開封結果を追加するときに指定する（スマホから実行するときここを指定する 指定しない時は空配列ではなくてundefinedにすること）
        {
          product_id: Required<Pack_Open_Products['product_id']>(), //在庫ID
          // staff_account_id: Required<Pack_Open_Products['staff_account_id']>(), //担当者ID PCから送信の場合でも入れる
          //上はヘッダーで指定が必要
          item_count: Required<Pack_Open_Products['item_count']>(), //個数
        },
      ],
    },
  },
  process: `
  
  `,
  response: <
    //リアルタイムAPIとおんなじような形式
    Pack_Open_History & {
      to_products: Array<
        Pack_Open_Products & {
          //開封した結果の在庫リスト この中の在庫の情報の取得については product取得APIを使いたい
          staff_account: {
            display_name: Account['display_name']; //担当者名
            // kind: Account['kind']; //このアカウントの種類
          };
        }
      >;
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
    noItemCount: {
      status: 400,
      messageText:
        'パック開封を完了させるためにはitem_count, item_count_per_packの指定が必要です',
    },
    invalidCount: {
      status: 400,
      messageText: '合計カード枚数と登録、未登録カード数が合いません',
    },
  } as const,
};

/**
 * @deprecated Use releaseOriginalPackApi from api-generator instead
 */
//オリパの解体を行うAPI（移動してきた）
export const releaseOriginalPackDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/product/[product_id]/release-original-pack',
  privileges: {
    role: [apiRole.pos], //スタッフアカウントでも実行できる
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      product_id: Required<Product['id']>(Number), //開封する対象の在庫ID
    },
    body: {
      id: Optional<Pack_Open_History['id']>(), //既存のパック開封に対しての処理
      asDraft: Optional<boolean>(), //下書きとして登録する場合はasDraft 指定しなかったら完了処理に入る（スマホ版から実行する時は原則trueを指定する）
      itemCount: Optional<number>(), //解体する個数 完了時に必要

      staff_account_id: Optional<Pack_Open_History['staff_account_id']>(), //このパック開封を作った担当者ID idを指定してないとき（新規作成時）は必要
      //スタッフIDはヘッダーで指定が必要

      to_products: [
        //開封結果の在庫（PCから実行するときここを指定する 指定しない時は空配列ではなくてundefinedにすること）
        {
          product_id: Required<Pack_Open_Products['product_id']>(), //在庫ID
          staff_account_id: Required<Pack_Open_Products['staff_account_id']>(), //担当者ID PCから送信の場合でも入れる ここは指定が必要
          item_count: Required<Pack_Open_Products['item_count']>(), //個数
        },
      ],
      additional_products: [
        //開封結果を追加するときに指定する（スマホから実行するときここを指定する 指定しない時は空配列ではなくてundefinedにすること）
        {
          product_id: Required<Pack_Open_Products['product_id']>(), //在庫ID
          // staff_account_id: Required<Pack_Open_Products['staff_account_id']>(), //担当者ID PCから送信の場合でも入れる
          //スタッフIDはヘッダーで指定が必要
          item_count: Required<Pack_Open_Products['item_count']>(), //個数
        },
      ],
    },
  },
  process: `
  
  `,
  response: <
    //リアルタイムAPIとおんなじような形式
    Pack_Open_History & {
      to_products: Array<
        Pack_Open_Products & {
          //開封した結果の在庫リスト この中の在庫の情報の取得については product取得APIを使いたい
          staff_account: {
            display_name: Account['display_name']; //担当者名
            // kind: Account['kind']; //このアカウントの種類
          };
        }
      >;
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
    noWholesalePrice: {
      status: 500,
      messageText:
        '指定された在庫の仕入れ値がオリパに結びついていません、もしくはオリパ定義に含まれない在庫が指定されています',
    },
    noItemCount: {
      status: 400,
      messageText: '解体を完了させるためには解体数を指定する必要があります。',
    },
  } as const,
};

/**
 * @deprecated Use getLossProductsApi from api-generator instead
 */
//ロス登録された在庫を取得するAPI
export const getLossProducts = {
  method: apiMethod.GET,
  path: 'store/[store_id]/product/loss',
  privileges: {
    role: [apiRole.pos], //法人アカウントでのみ実行できる（とりあえず）
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    query: {
      loss_genre_id: Optional<Loss_Genre['id']>(Number), //ロス区分ID
      staff_account_id: Optional<Loss['staff_account_id']>(Number), //担当者
      orderBy: Optional<string>( //ソートの定義
        defOrderBy([
          'datetime', //発生日時
          'productDisplayName', //商品名
          'lossGenreDisplayName', //ロス区分
        ]),
      ),
      take: Optional<number>(Number), //飛ばす数
      skip: Optional<number>(Number), //取得する数
    },
  },
  process: `

  `,
  response: <
    {
      lossProducts: Array<
        Loss_Product & {
          product: Product & {
            displayNameWithMeta: string;
            condition_option: {
              display_name: Item_Category_Condition_Option['display_name'];
            };
          };
          loss: Loss & {
            loss_genre: {
              display_name: Loss_Genre['display_name'];
            };
            staff_account: {
              display_name: Account['display_name'];
            };
          };
        }
      >;
    }
  >{},
  error: {} as const,
};

export enum ProductTransferKind {
  FROM = 'FROM',
  TO = 'TO',
}

/**
 * @deprecated Use getProductTransferHistoryApi from api-generator instead
 */
//在庫変換の履歴
export const getProductTransferHistoryDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/product/[product_id]/transfer-history',
  privileges: {
    role: [apiRole.pos], //法人アカウントでのみ実行できる（とりあえず）
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      product_id: Required<Store['id']>(Number),
    },
    query: {
      kind: Required<ProductTransferKind>(ProductTransferKind), //FROMだったらこの商品が「変換前」になっている在庫変換で、TOだったらこの商品が「変換後」になっている在庫変換
      orderBy: Optional<string>( //ソートの定義
        defOrderBy([
          'datetime', //変換日時
        ]),
      ),
    },
  },
  process: `

  `,
  response: <
    {
      stockHistories: Array<{
        id: Product_Stock_History['id'];
        staff_account_id: Product_Stock_History['staff_account_id'];
        source_id: Product['id']; //kind=FROMだったら変換後の在庫ID kind=TOだったら変換前の在庫ID
        item_count: Product_Stock_History['item_count']; //kind=FROMだったらこの在庫を減らした数（負の数になる） kind=TOだったらこの在庫を増やした数
        description: Product_Stock_History['description'];
        unit_price: Product_Stock_History['unit_price'];
        datetime: Product_Stock_History['datetime']; //変換日時
        result_stock_number: Product_Stock_History['result_stock_number']; //結果在庫が何になったのか
      }>;
    }
  >{},
  error: {} as const,
};

/**
 * @deprecated Use transferToSpecialPriceProductApi from api-generator instead
 */
//特価在庫への移動を行うAPI
export const transferToSpecialPriceProductDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/product/[product_id]/transfer/special-price',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      product_id: Required<Product['id']>(Number), //在庫変動元の在庫ID
    },
    body: {
      itemCount: Required<number>(
        Number,
        (v) => v > 0 || 'itemCountは正の数を指定してください',
      ), //生成する在庫の数
      sellPrice: Required<Product['specific_sell_price']>(), //何円にするか
      specific_auto_sell_price_adjustment:
        Optional<Product['specific_auto_sell_price_adjustment']>(), //価格更新後も%関係を維持するかどうか nullやundefinedだったら維持せず価格調整も今後しない '80%'と指定したら今後自動で80%に調整される
      force_no_price_label: Optional<Product['force_no_price_label']>(), //必ず価格なしラベルにするかどうか
      // staff_account_id: Required<Product_Stock_History['staff_account_id']>(), //担当者ID
      //スタッフIDはヘッダーで指定が必要
    },
  },
  process: `
  
  `,
  response: <
    //生成できた在庫の情報
    Product
  >{},
  error: {
    failedToCreateProduct: {
      status: 500,
      messageText: '特価在庫が生成されませんでした',
    },
  } as const,
};

/**
 * @deprecated Use getProductEcOrderHistoryApi from api-generator instead
 */
//ECの販売履歴 こっちは廃止するかも
export const getProductEcOrderHistoryDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/product/[product_id]/ec-order',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      product_id: Required<Store['id']>(Number),
    },
    query: {
      orderBy: Optional<string>( //ソートの定義
        defOrderBy([
          'ordered_at', //受注日時（販売日時）
          'total_unit_price', //単価
          'item_count', //販売数
        ]),
      ),

      take: Optional<number>(Number), //飛ばす数
      skip: Optional<number>(Number), //取得する数

      includesSummary: Optional<boolean>(Boolean), //trueだったら合計数も取得する
    },
  },
  process: `

  `,
  response: <
    {
      ordersByProduct: Array<{
        order_store: {
          //ストアごとのカート定義
          order: {
            id: Ec_Order['id']; //オーダーのID
            ordered_at: Ec_Order['ordered_at']; //受注日時
          };
        };
        total_unit_price: Ec_Order_Cart_Store_Product['total_unit_price']; //販売単価
        item_count: Ec_Order_Cart_Store_Product['item_count']; //販売数
      }>;
      summary?: {
        totalItemCount: number; //合計数
      };
    }
  >{},
  error: {} as const,
};
