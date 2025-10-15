import {
  apiMethod,
  apiRole,
  Optional,
  Required,
  StreamRes,
} from '@/api/backendApi/main';
import {
  Account,
  Inventory,
  Inventory_Category,
  Inventory_Genre,
  Inventory_Products,
  Pack_Open_History,
  Store,
} from '@prisma/client';
import { defPolicies } from 'api-generator';
import { ApiEventBody } from 'backend-core';

//棚卸し作成・更新API
/**
 * @deprecated Use createOrUpdateInventoryApi from api-generator instead
 */
export const createOrUpdateInventoryDef = {
  method: apiMethod.POST,
  path: 'store/[store_id]/inventory/',
  privileges: {
    role: [apiRole.pos], //スタッフアカウントでも実行できる
    policies: defPolicies(['list_inventory']),
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
    },
    body: {
      id: Optional<Pack_Open_History['id']>(), //既存のパック開封に対しての処理

      //以下二つは新規作成時にのみ指定可能
      item_category_ids: [
        //商品種別ID 複数選択可能
        {
          id: Required<Inventory['item_category_id']>(),
        },
      ],
      item_genre_ids: [
        //商品ジャンルID 複数選択可能
        {
          id: Required<Inventory['item_genre_id']>(),
        },
      ],
      staff_account_id: Optional<Inventory['staff_account_id']>(), //登録したスタッフ 編集モードの時は必要ない
      //スタッフアカウントはHeaderで指定が必要

      products: [
        //棚卸対象の商品（PCから実行するときここを指定する 指定しない時は空配列ではなくてundefinedにすること）
        {
          shelf_id: Required<Inventory_Products['shelf_id']>(), //棚のID
          product_id: Required<Inventory_Products['product_id']>(), //在庫ID
          staff_account_id: Required<Inventory_Products['staff_account_id']>(), //担当者ID PCから送信の場合でも入れる ここのIDは必要
          item_count: Required<Inventory_Products['item_count']>(), //個数
        },
      ],
      additional_products: [
        //棚卸し対象の商品を追加するときに指定する（スマホから実行するときここを指定する 指定しない時は空配列ではなくてundefinedにすること）
        {
          shelf_id: Required<Inventory_Products['shelf_id']>(), //棚のID
          product_id: Required<Inventory_Products['product_id']>(), //在庫ID
          // staff_account_id: Required<Inventory_Products['staff_account_id']>(), //担当者ID PCから送信の場合でも入れる ここのIDは必要ない
          // ↑HeaderでスタッフIDの指定が必要
          item_count: Required<Inventory_Products['item_count']>(), //個数
        },
      ],
    },
  },
  process: `
  
  `,
  response: <
    //リアルタイムAPIとおんなじような形式
    Inventory & {
      products: Array<
        Inventory_Products & {
          staff_account: {
            display_name: Account['display_name']; //担当者名
            // kind: Account['kind']; //このアカウントの種類
          };
        }
      >;
      item_genres: Array<Inventory_Genre>;
      item_categories: Array<Inventory_Category>;
    }
  >{},
  error: {
    invalidProductsParameter: {
      status: 400,
      messageText:
        'productsとadditional_productsを同時に指定することはできません',
    },
    additionalProductsWhenCreate: {
      status: 400,
      messageText: '新規登録時にadditional_productsは指定できません',
    },
  } as const,
};

//棚卸の更新イベントを取得する（リアルタイムAPI） 廃止予定
/**
 * @deprecated Use subscribeUpdateInventoryApi from api-generator instead
 */
export const subscribeUpdateInventoryDef = {
  method: apiMethod.GET,
  path: 'store/[store_id]/inventory/[inventory_id]/subscribe/',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      inventory_id: Required<Inventory['id']>(Number), //棚卸ID
    },
  },
  process: `
  `,
  response: StreamRes<ApiEventBody>(),
};
