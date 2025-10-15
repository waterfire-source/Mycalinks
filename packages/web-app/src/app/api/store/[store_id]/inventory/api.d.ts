import {
  Store,
  Product,
  Inventory,
  Department,
  Inventory_Products,
  Inventory_Shelf,
} from '@prisma/client';

export type BackendInventoryAPI = [
  //棚卸登録・更新API
  {
    path: '/api/store/{store_id}/inventory/';
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
        id?: Inventory['id']; //更新をする時のid 完了していない棚卸のみ編集できる
        department_id?: Department['id'] | null; //対象部門のID nullだと「全て」ということになる 編集モードの時は指定する必要がない
        products: Array<{
          //棚卸し対象の商品
          shelf_id: Inventory_Products['shelf_id']; //棚のID
          product_id: Inventory_Products['product_id']; //商品のID
          item_count: Inventory_Products['item_count']; //この棚におけるこの商品の数
        }>;
      };
    };
    response: {
      201: Inventory; //作成された棚卸の情報
      200: Inventory; //更新された棚卸の情報
    };
  },
  //棚卸情報取得
  {
    path: '/api/store/{store_id}/inventory/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        id?: Inventory['id']; //ID
        title?: Inventory['title']; //タイトル
        status?: Inventory['status']; //ステータス
      };
      params: {
        store_id: Store['id'];
      };
    };
    response: {
      200: {
        inventories: Array<
          Inventory & {
            item_categories: Array<{
              item_category_id: number;
            }>;
            item_genres: Array<{
              item_genre_id: number;
            }>;
            products: Array<{
              shelf_id: Inventory_Products['shelf_id']; //棚のID
              shelf_name: Inventory_Products['shelf_name']; //棚のその時点での名前
              product_id: Inventory_Products['product_id']; //商品ID
              product_name: Product['display_name']; //商品名
              product__displayNameWithMeta: string;
              item_count: Inventory_Products['item_count']; //この商品の、この棚における実際の
              input_total_wholesale_price: Inventory_Products['input_total_wholesale_price']; //棚卸で入力した分の仕入れ値合計
              current_stock_number: Inventory_Products['current_stock_number']; //この商品の、棚作成時の在庫数
              product__average_wholesale_price: Product['average_wholesale_price']; //商品の平均仕入価格
            }>;
          }
        >;
      };
    };
  },
  //棚卸削除API
  {
    path: '/api/store/{store_id}/inventory/{inventory_id}/';
    method: 'DELETE';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
        inventory_id: Inventory['id'];
      };
    };
    response: {
      200: { ok: string }; //正しく削除できた時
    };
  },
  //棚卸確定API
  {
    path: '/api/store/{store_id}/inventory/{inventory_id}/apply/';
    method: 'POST';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
        inventory_id: Inventory['id'];
      };
      body: {
        adjust?: boolean; //ズレていた場合、理論値に調整するかどうか trueにしたら調整することになる（調整ではそこそこ時間がかかる可能性がある）
      };
    };
    response: {
      200: Inventory; //正しく確定できた後の最終的な棚卸情報 これを元に実際のギャップを計算できる
    };
  },
  //棚の登録・更新API
  {
    path: '/api/store/{store_id}/inventory/shelf/';
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
        id?: Inventory['id']; //更新をする時のid
        display_name: Inventory_Shelf['display_name']; //棚の名前
        order_number?: Inventory_Shelf['order_number']; //並び順
      };
    };
    response: {
      201: { id: Inventory_Shelf['id'] }; //作成された棚のID
      200: { id: Inventory_Shelf['id'] }; //更新された棚のID
    };
  },
  //棚の取得API
  {
    path: '/api/store/{store_id}/inventory/shelf/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        id?: Inventory_Shelf['id']; //ID指定
      };
      params: {
        store_id: Store['id'];
      };
    };
    response: {
      200: {
        shelfs: Array<Inventory_Shelf>; //shelfの複数形はshelvesだったりするが、shelfsの方が分かりやすいため
      };
    };
  },
  //棚の削除API 論理削除にする
  {
    path: '/api/store/{store_id}/inventory/shelf/{shelf_id}/';
    method: 'DELETE';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
        shelf_id: Inventory_Shelf['id'];
      };
    };
    response: {
      200: {
        ok: string; //無事削除できたら
      };
    };
  },
];
