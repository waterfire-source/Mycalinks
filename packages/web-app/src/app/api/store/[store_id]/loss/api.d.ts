import {
  Store,
  Loss,
  Loss_Product,
  Loss_Genre,
  Product,
  Item_Category_Condition_Option,
  Account,
  Product_Wholesale_Price_History,
  Item,
} from '@prisma/client';

export type BackendLossAPI = [
  //ロス登録API
  {
    path: '/api/store/{store_id}/loss/';
    method: 'POST';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
      };
      body: {
        datetime?: Loss['datetime']; //ロスの発生日時、指定しない場合今
        reason?: Loss['reason']; //ロスの理由
        loss_genre_id?: Loss['loss_genre_id']; //ロス区分ID
        products: Array<{
          product_id: Loss_Product['product_id'];
          item_count: Loss_Product['item_count'];
          specificWholesalePrice?: Product_Wholesale_Price_History['unit_price']; //特定の仕入れ値を利用したい時指定する、 自動で良い時はundefined
        }>;
      };
    };
    response: {
      201: Loss; //作成されたロスの情報
      400: {
        error: string; //情報が不足している場合など
      };
      401: {
        error: string; //権限がない場合など
      };
    };
  },

  //ロス区分登録・更新API
  {
    path: '/api/store/{store_id}/loss/genre/';
    method: 'POST';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
      };
      body: {
        id?: Loss_Genre['id']; //更新したい場合はIDを指定する
        display_name: Loss_Genre['display_name']; //表示名
      };
    };
    response: {
      201: Loss_Genre; //作成されたロスの情報
      200: Loss_Genre; //更新されたロスの情報
      400: {
        error: string; //情報が不足している場合など
      };
      401: {
        error: string; //権限がない場合など
      };
    };
  },

  //ロス取得API
  {
    path: '/api/store/{store_id}/loss/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
      };
    };
    response: {
      200: Array<{
        id: Loss['id'];
        store_id: Loss['store_id'];
        datetime: Loss['datetime'];
        reason: Loss['reason'];
        staff_account_id: Loss['staff_account_id'];
        staff_account__display_name: Account['display_name']; //ロスの担当者
        loss_genre_id: Loss['loss_genre_id'];
        products: Array<{
          product_id: Loss_Product['product_id'];
          product__displayNameWithMeta: string;
          product__condition_option__display_name: Item_Category_Condition_Option['display_name'];
          item_count: Loss_Product['item_count'];
        }>;
        loss_genre__id: Loss_Genre['id'];
        loss_genre__enabled: Loss_Genre['enabled'];
        loss_genre__code: Loss_Genre['code'];
        loss_genre__display_name: Loss_Genre['display_name'];
        loss_genre__order_number: Loss_Genre['order_number'];
      }>;
    };
  },

  //ロス区分取得API
  {
    path: '/api/store/{store_id}/loss/genre/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
      };
    };
    response: {
      200: Array<{
        id: Loss_Genre['id'];
        store_id: Loss_Genre['store_id'];
        code: Loss_Genre['code'];
        display_name: Loss_Genre['display_name'];
        order_number: Loss_Genre['order_number'];
        enabled: Loss_Genre['enabled'];
      }>;
    };
  },

  //ロス区分削除API
  {
    path: '/api/store/{store_id}/loss/genre/{loss_genre_id}/';
    method: 'DELETE';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
        loss_genre_id: Loss_Genre['id'];
      };
    };
    response: {
      200: {
        ok: string;
      };
    };
  },

  //ロス取得API(パラメータによる絞り込み可能)
  {
    path: '/api/store/{store_id}/products/loss';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
        loss_genre_id: Loss['loss_genre_id'];
        staff_account_id: Loss['staff_account_id'];
        orderBy: [];
      };
    };
    response: {
      200: {
        lossProducts: Array<{
          loss_id: Loss['id'];
          product_id: Product['id'];
          item_count: Loss_Product['item_count'];
          sell_price: Product['sell_price'] | null;
          product: Product<{
            product_code: number;
            display_name: Product['display_name'];
            displayNameWithMeta: Product['display_name_ruby'];
            image_url: Product['image_url'];
            condition_option: { display_name: Product['condition_option_id'] };
            item: Item<{
              cardnumber: Item['cardnumber'];
              expansion: Item['expansion'];
              rarity: Item['rarity'];
            }>;
          }>;
          loss: Loss<{
            created_at: Loss['created_at'];
            id: Loss['id'];
            loss_genre: Loss_Genre<{
              display_name: Loss_Genre['display_name'];
            }>;
            loss_genre_id: Loss_Genre['id'];
            reason: Loss['reason'];
            staff_account: { display_name: string };
            staff_account_id: number;
            store_id: Store['id'];
            total_item_count: Loss['total_item_count'];
          }>;
        }>;
      };
    };
  },
];
