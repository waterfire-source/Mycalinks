import {
  Product,
  Store,
  Supplier,
  Stocking,
  Stocking_Product,
} from '@prisma/client';

export type BackendStockingAPI = [
  //仕入れ（CSV）API[0]
  {
    path: '/api/store/{store_id}/stocking/csv/';
    method: 'POST';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: object;
      params: {
        store_id: Store['id'];
      };
      body: FormData<{
        file: File<{
          name: '*.csv';
          type: 'text/csv';
        }> | null; //CSVファイル（UTF-8 カンマ区切り） テンプレートを参照
        // staff_account_id: Product_Stock_History['staff_account_id'];
        //スタッフIDはヘッダーで指定が必要
      }>;
    };
    response: {
      200: {
        ok: string;
      };
    };
  },

  //仕入れ先登録or更新API[1]
  {
    path: '/api/store/{store_id}/stocking/supplier/';
    method: 'POST';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: object;
      params: {
        store_id: Store['id'];
      };
      body: {
        id: Supplier['id']; //IDを指定することで更新モードになる
        display_name: Supplier['display_name']; //仕入れ先名
        zip_code: Supplier['zip_code']; //この辺りは直接schemaを確認ください
        prefecture: Supplier['prefecture'];
        city: Supplier['city'];
        address2: Supplier['address2'];
        building: Supplier['building'];
        phone_number: Supplier['phone_number'];
        fax_number: Supplier['fax_number'];
        order_method: Supplier['order_method'];
        email: Supplier['email'];
        staff_name: Supplier['staff_name'];
        order_number: Supplier['order_number'];
        enabled: Supplier['enabled'];
        description: Supplier['description'];
      };
    };
    response: {
      200: Supplier; //更新された場合は200ステータスコード
      201: Supplier; //新規作成された場合は201ステータスコード
    };
  },

  //仕入れ先取得API[2]
  {
    path: '/api/store/{store_id}/stocking/supplier/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        id: Supplier['id'];
        display_name: string; //名前などで検索できる
        enabled: Supplier['enabled']; //有効かどうか
      };
      params: {
        store_id: Store['id'];
      };
      body: object;
    };
    response: {
      200: Array<Supplier>;
    };
  },

  //入荷登録・更新[3]
  {
    path: '/api/store/{store_id}/stocking/';
    method: 'POST';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: object;
      params: {
        store_id: Store['id'];
      };
      body: {
        id?: Stocking['id']; //更新する場合ID
        // staff_account_id: Stocking['staff_account_id'];
        //スタッフIDはヘッダーで指定が必要
        planned_date?: string;
        supplier_id?: Stocking['supplier_id'];
        stocking_products?: Array<{
          product_id: Stocking_Product['product_id'];
          planned_item_count: Stocking_Product['planned_item_count'];
          unit_price: Stocking_Product['unit_price']; //これは税込価格（税込モードで入力された値を入れる 税抜モードの場合はnullを指定する）
          unit_price_without_tax: Stocking_Product['unit_price_without_tax']; //これは税抜価格（税抜モードの場合は入力された値を入れる　税込モードの場合はnullを指定する）
        }>;
      };
    };
    response: {
      200: Stocking; //更新された場合は200ステータスコード
      201: Stocking; //新規作成された場合は201ステータスコード
    };
  },

  //入荷適用API[4]
  {
    path: '/api/store/{store_id}/stocking/{stocking_id}/apply/';
    method: 'POST';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: object;
      params: {
        store_id: Store['id'];
        stocking_id: Stocking['id'];
      };
      body: {
        // staff_account_id: Stocking['staff_account_id'];
        //スタッフIDはヘッダーで指定が必要
        actual_date: Stocking['actual_date'];
        stocking_products: Array<{
          //商品自体を変えるためには一度入荷内容を変更する必要がある
          id: Stocking_Product['id']; //それぞれのIDを指定する
          actual_item_count: Stocking_Product['planned_item_count'];
        }>;
      };
    };
    response: {
      200: Stocking & {
        stocking_products: Array<Stocking_Product>;
      };
    };
  },

  //入荷情報取得API[5]
  {
    path: '/api/store/{store_id}/stocking/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        status?: Stocking['status'];
        productName?: string; //商品名
        staff_account_id?: Stocking['staff_account_id']; //担当者ID

        skip?: number; //取得開始位置
        take?: number; //取得数
      };
      params: {
        store_id: Store['id'];
      };
      body: object;
    };
    response: {
      200: Array<{
        id: Stocking['id'];
        store_id: Stocking['store_id'];
        status: Stocking['status']; //ステータス
        planned_date: string; //予定入荷日
        actual_date: Stocking['actual_date']; //実際の入荷日
        expected_sales: Stocking['expected_sales']; //見込み売上（入荷が確定したら） 税込額
        total_wholesale_price: Stocking['total_wholesale_price']; //合計仕入れ値（入荷が確定したら） 税込額
        total_item_count: Stocking['total_item_count']; //合計仕入れ量（入荷が確定したら）
        supplier_id: Stocking['supplier_id']; //仕入れ先ID
        staff_account_id: Stocking['staff_account_id'];
        created_at: Stocking['created_at'];
        store_name: Store['display_name']; //仕入れる対象の店の名前
        supplier_name: Supplier['display_name']; //仕入れ先の名前
        from_store_shipment_id?: Store_Shipment['id']; //出荷元のID
        from_store_name?: Store['display_name']; //出荷元の名前
        stocking_products: Array<{
          id: Stocking_Product['id']; //ID
          product_id: Stocking_Product['product_id']; //商品ID
          planned_item_count: Stocking_Product['planned_item_count']; //予定仕入れ数
          actual_item_count: Stocking_Product['actual_item_count']; //実際の仕入れ数（入荷が確定したら）
          unit_price: Stocking_Product['unit_price']; //税込モードで登録したときの値
          unit_price_without_tax: Stocking_Product['unit_price_without_tax']; //税抜の値 税抜モードで登録された時だけ値が入る
          product_name: Product['display_name']; //商品名
          image_url: Product['image_url']; // 商品画像
          actual_sell_price: Product['actual_sell_price']; // 売値
          product__displayNameWithMeta: string; // 商品名（メタデータ込み）
          product__condition_option__display_name: Condition_Option['display_name']; // 商品の状態
        }>;
      }>;
    };
  },

  //入荷キャンセルAPI[6]
  {
    path: '/api/store/{store_id}/stocking/{stocking_id}/cancel/';
    method: 'POST';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: object;
      params: {
        store_id: Store['id'];
        stocking_id: Stocking['id'];
      };
      body: object;
    };
    response: {
      200: Stocking;
    };
  },
];
