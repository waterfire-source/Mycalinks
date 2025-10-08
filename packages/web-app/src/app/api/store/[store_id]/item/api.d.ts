import {
  Product,
  Store,
  Item,
  Original_Pack_Product,
  Bundle_Item_Product,
  Item_Category,
  Item_Category_Condition_Option,
  Item_Genre,
} from '@prisma/client';
import { ItemType } from '@/api/backendApi/model/item';
import { ItemGetAllOrderType } from '@/feature/products/components/searchTable/const';
import { ItemCsvUploadOptions } from '@/constants/mycapos';
//[TODO] 今後不確定多数の絞り込みメタ要素が増えていくなら、それ用のクエリ言語を書けるようにするか、POSTで検索できるようにする
export type BackendItemAPI = [
  //商品マスタ情報検索&取得API[0]
  /**
   * @deprecated
   */
  {
    path: '/api/store/{store_id}/item/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        id?: Item['id'] | string | number[]; //カンマ区切りにすることで複数指定できる
        code?: Item['code'];
        genre_id?: Item['genre_id']; //ジャンルID
        category_id?: Item['category_id']; //商品種別ID
        is_buy_only?: Item['is_buy_only']; //買取専用商品かどうか
        rarity?: Item['rarity']; //レアリティのみ部分一致で検索
        expansion?: Item['expansion'];
        cardnumber?: string; //型番
        cardseries?: Item['cardseries'];
        card_type?: Item['card_type'];
        option1?: Item['option1'];
        option2?: Item['option2'];
        option3?: Item['option3'];
        option4?: Item['option4']; //ここだけ整数
        option5?: Item['option5'];
        option6?: Item['option6'];
        release_date?: Item['release_date'];
        displaytype1?: Item['displaytype1'];
        displaytype2?: Item['displaytype2'];
        modelNumber?: string;
        display_name?: string; //商品名とか
        skip?: number; //先頭から何要素目までは取得しないか
        hasStock?: boolean; //在庫数を持っているもの限定にするかどうか
        isPack?: boolean; //パックかどうか
        isMycalinksItem?: boolean; //Mycaアプリで管理されている商品か
        fromTablet?: boolean; //在庫検索タブレットからのリクエストかどうか（取得できる商品カテゴリ、ジャンル等が制限される）
        infinite_stock?: Item['infinite_stock']; //trueを指定すると無限在庫のみを取得 falseだと無限在庫を除く 未指定だとすべて
        hasMarketPriceGap?: boolean; //trueを指定すると、相場価格（market_price）と商品マスタ販売価格（sell_price）の差があるもののみを取得する
        marketPriceUpdatedAtGte?: string; //相場価格が指定した日時以降に変動しているもののみ取得
        includesMycaItemInfo?: boolean; //Mycaアイテム情報を取得するかどうか
        includesInnerBoxItemInfo?: boolean;
        type?: ItemType; //商品マスタタイプの指定 NORMAL or BUNDLE or ORIGINAL_PACK
        take?: number; //何要素分を取得するか 指定してなかったら50個 -1を指定してたら無制限
        // orderBy?: string; //並び順 カンマ区切りで複数指定 products_stock_number:descのように使う [廃止]

        status?: Item['status'] | Item['status'][]; //基本的に論理削除されたものは取得できないが、ここでDELETEDを指定することで取得することができる また、カンマ区切りで複数指定可能
        //バンドル商品マスタの場合、statusがDRAFTだったら適用前 PUBLISHだったら適用中 DELETEDだったら終了済み

        orderBy?: ItemGetAllOrderType | ItemGetAllOrderType[];

        //※skipとtakeを組み合わせてページネーション機能をつける
        includesSummary?: true; //統計情報を入れるかどうか（入れない場合は未指定）
        includesProducts?: true; //productsの情報まで同時に取得するかどうか
      };
      params: {
        store_id: Store['id'];
      };
    };
    response: {
      200: {
        items: Array<
          Item & {
            displayNameWithMeta: string;
            genre_display_name: Item_Genre['display_name']; //ジャンル
            category_handle: Item_Category['handle'];
            category_display_name: Item_Category['display_name']; //商品種別
            category_condition_options: Array<{
              //この商品マスタで利用できる状態の選択肢
              id: Item_Category_Condition_Option['id'];
              display_name: Item_Category_Condition_Option['display_name'];
            }>;
            metas: Array<{
              label: string; //メタ情報のラベル
              value: string | number; //値
              columnOnPosItem: keyof Item; //Item上でのカラム名
            }>;
            products: Array<
              Product & {
                product_code: number;
                item_infinite_stock: Item['infinite_stock']; //無限在庫かどうか
                displayNameWithMeta: string;
                ecPublishStockNumber?: number;
                actual_ec_publishable_stock_number: number;
                //この在庫に結びついている状態
                condition_option_display_name: Item_Category_Condition_Option['display_name'];
                tags: Array<{
                  //この在庫に結びついているタグ
                  tag_id: Tag['id']; //タグのID
                  tag_name: Tag['display_name']; //タグの名前
                  genre1: Tag['genre1'];
                  genre2: Tag['genre1'];
                }>;
                specialty__display_name: Specialty['display_name']; // 特殊状態の名前
                tablet_limit_count?: number; // 店舗用タブレットの制限数、タブレットからのリクエストの場合のみ取得
                consignment_client__full_name?: Consignment_Client['full_name']; // 委託者の名前
                consignment_client__display_name?: Consignment_Client['display_name']; // 委託者の表示名
              }
            >;
            bundle_item_products?: Array<Bundle_Item_Product>; //type=BUNDLEを指定した時
            original_pack_products?: Array<
              Original_Pack_Product & {
                product__display_name: Product['display_name'];
                product__displayNameWithMeta: string;
                product__item__rarity: Item['rarity'];
                product__item__cardnumber: Item['cardnumber'];
                product__item__expansion: Item['expansion'];
                product__image_url: Product['image_url'];
              }
            >; //type=ORIGINAL_PACKを指定した時
            inner_box_item?: Item; //includesInnerBoxItemInfo=trueの時、値が入る可能性がある
          }
        >;
        totalValues: {
          itemCount: number; //ヒットした件数
        };
      };
    };
  },
  //商品マスタ登録API[1]
  {
    path: '/api/store/{store_id}/item/';
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
        myca_item_id?: number;
        myca_pack_id?: number; //MycaデータベースにおけるパックID
        display_name?: Item['display_name']; //ない場合、Mycaのものが使われる
        display_name_ruby?: Item['display_name_ruby'];
        sell_price?: Item['sell_price']; //ない場合、Mycaのpriceが使われる
        buy_price?: Item['buy_price']; //ない場合、Mycaのpriceが使われる
        rarity?: Item['rarity']; //ない場合、Mycaのものが使われる
        expansion?: Item['expansion']; //ない場合、Mycaのものが使われる
        cardnumber?: Item['cardnumber']; //ない場合、Mycaのものが使われる
        keyword?: Item['keyword']; //ない場合、Mycaのものが使われる
        pack_name?: Item['pack_name']; //ない場合、Mycaのものが使われる
        description?: Item['description'];
        image_url?: Item['image_url']; //ない場合、Mycaのものが使われる
        category_id?: Item['category_id']; //ない場合、Mycaの商品種別が自動的にPOSにインポートされる
        genre_id?: Item['genre_id']; //ない場合、Mycaのジャンルが自動的にPOSにインポートされる
        is_buy_only?: Item['is_buy_only']; //買取専用商品かどうか
        order_number?: Item['order_number']; //表示順
        readonly_product_code?: Item['readonly_product_code']; //JAN

        allow_auto_print_label?: Item['allow_auto_print_label']; //自動でラベル印刷させるかどうか
        allow_round?: Item['allow_round']; //端数処理を有効にするかどうか
        infinite_stock?: Item['infinite_stock']; //在庫数を無限にするかどうか
      };
    };
    response: {
      200: Item;
    };
  },

  //商品マスタ登録（CSV）API 価格更新APIも兼ねてる[2]
  {
    path: '/api/store/{store_id}/item/csv/';
    method: 'POST';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
      };
      body: FormData<{
        json: {
          options: ItemCsvUploadOptions;
        };
        file: File<{
          name: '*.csv';
          type: 'text/csv';
        }> | null; //CSVファイル（UTF-8 カンマ区切り） item_template.csvを参照
      }>;
    };
    response: {
      200: {
        ok: string;
        errorInfo: {
          successCount: number;
          errorCount: number;
          fileUrl: string;
        };
      };
    };
  },
  //商品マスタ情報変更API[3]
  {
    path: '/api/store/{store_id}/item/{item_id}/';
    method: 'PUT';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
        item_id: Item['id'];
      };
      body: {
        //最低でも一つは必要だが、基本全てオプショナル
        display_name?: Item['display_name'];
        display_name_ruby?: Item['display_name_ruby'];
        // allowed_point?: Item['allowed_point']; //更新でしか設定できない
        sell_price?: Item['sell_price'];
        buy_price?: Item['buy_price'];
        rarity?: Item['rarity'];
        pack_name?: Item['pack_name'];
        description?: Item['description'];
        image_url?: Item['image_url'];
        readonly_product_code?: Item['readonly_product_code']; //JANなどの読み取り専用コード
        allow_auto_print_label?: Item['allow_auto_print_label']; //自動でラベル印刷させるかどうか
        hide?: boolean; //trueにするとこの商品マスタを非表示にすることができる　一応論理削除とは区別
        delete?: boolean; //trueにするとこの商品マスタを削除することができる
        allow_round?: Item['allow_round']; //端数処理を有効にするかどうか
        expansion?: Item['expansion'];
        cardnumber?: Item['cardnumber'];
        order_number?: Item['order_number']; //表示順
        keyword?: Item['keyword'];
        infinite_stock?: Item['infinite_stock']; //在庫数を無限にするかどうか
        is_buy_only?: Item['is_buy_only'];
        tablet_allowed?: Item['tablet_allowed']; //在庫検索タブレットで表示するのを許可されているかどうか
        release_date?: Item['release_date']; //発売日（YYYY-MM-DD）
        box_pack_count?: Item['box_pack_count']; //ボックスの中にいくつのパックが入っているか カートンマスタにも対応
      };
    };
    response: {
      200: Item;
      400: {
        //情報が足りない時など
      };
      401: {
        //フィールド指定が不正な時や権限がない時
      };
    };
  },
  //部門取得API[4]
  {
    // path: '/api/store/{store_id}/item/department/';
    // method: 'GET';
    // request: {
    //   privileges: {
    //     role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
    //     policies: []; //実行に必要なポリシー
    //   };
    //   query: {
    //     id?: Department['id']; //ID直指定
    //     includesStats?: true; //結びついている在庫の個数などの統計情報を取得する時
    //   };
    //   params: {
    //     store_id: Store['id'];
    //   };
    //
    // };
    // response: {
    //   200: {
    //     ok: Array<
    //       Department & {
    //         stat?: {
    //           hasStockProductsCount: number; //在庫数をもっている商品マスタの数
    //         };
    //       }
    //     >;
    //   };
    //   400: {
    //     //情報が足りない時など
    //   };
    //   401: {
    //     //フィールド指定が不正な時や権限がない時
    //   };
    // };
  },
  //商品マスタのCSV取得API[5]
  {
    path: '/api/store/{store_id}/item/csv/';
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
      200: {
        fileUrl: string; //S3にアップロードされたCSVファイルのURL
      };
    };
  },
  //商品マスタ（パック）の中身取得[6]
  {
    path: '/api/store/{store_id}/item/{item_id}/open-pack/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        isPack: boolean; //パック（ボックスの中身）だけ取得するかどうか falseだとカードだけ取得になる
      };
      params: {
        store_id: Store['id'];
        item_id: Item['id'];
      };
    };
    response: {
      200: {
        itemsInPack: Array<{
          pos_item_id?: Item['id']; //POS上に登録されていたら、そのItem ID
          pos_item_products_stock_number?: Item['products_stock_number']; //POS上に登録されていたら、その合計在庫数
          myca_item_id: mycaItem['id']; //Mycaデータベース上でのID
          image_url: mycaItem['full_image_url']; //画像URL
          genre_name: mycaItem['cardgenre']; //ジャンル名
          display_name: mycaItem['cardname']; //カード名
          cardnumber: mycaItem['cardnumber']; //カード番号
          cardseries: mycaItem['cardseries']; //カードシリーズ
          expansion: mycaItem['expansion']; //エキスパンション
          rarity: mycaItem['rarity']; //レアリティ
          myca_pack_id: mycaItem['cardpackid']; //Mycaデータベース上でのpack_id
          pack_item_count: mycaItem['pack_item_count']; //このパックの中のこのアイテムのアイテム数（決まっている場合）
          displayNameWithMeta: string; //メタ情報付きの表示名
        }>;
      };
    };
  },
  //在庫再生成API[7]
  {
    path: '/api/store/{store_id}/item/{item_id}/regenerate-products/';
    method: 'POST';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
        item_id: Item['id'];
      };
    };
    response: {
      200: {
        ok: string;
      };
    };
  },

  //オリジナルパック作成API 更新機能は特になくて大丈夫そう[8]
  {
    // path: '/api/store/{store_id}/item/original-pack/';
    // method: 'POST';
    // request: {
    //   privileges: {
    //     role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
    //     policies: []; //実行に必要なポリシー
    //   };
    //
    //   params: {
    //     store_id: Store['id'];
    //   };
    //   body: {
    //     display_name: Item['display_name']; //オリパの名前
    //     init_stock_number: Item['init_stock_number']; //商品数 これが最初の在庫数となる
    //     sell_price: Item['sell_price']; //販売単価
    //     image_url: Item['image_url']; //明示的にフロントから指定させる
    //     department_id?: Item['department_id']; //部門のID
    //     staff_account_id: Product_Stock_History['staff_account_id']; //担当者ID
    //     products: Array<{
    //       //商品定義
    //       product_id: Original_Pack_Product['product_id']; //在庫ID
    //       item_count: Original_Pack_Product['item_count']; //その数
    //     }>;
    //   };
    // };
    // response: {
    //   201: Item & {
    //     original_pack_products: Array<Original_Pack_Product>;
    //     products: Array<Product>; //自動生成された在庫の情報も帰ってくる
    //   };
    // };
  },

  //オリジナルパック定義取得API ※あくまでも定義を取得するだけで、在庫の一覧ではない（商品マスタベース）が、在庫情報もついでに取ってくる[9]
  //未開発
  {
    path: '/api/store/{store_id}/item/original-pack/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        id?: Item['id']; //ID直指定
      };
      params: {
        store_id: Store['id'];
      };
    };
    response: {
      200: {
        items: Array<
          Item & {
            total_wholesale_price: number; //仕入れ値合計値
            original_pack_products: Array<Original_Pack_Product>;
            products: Array<Product>; //自動生成された在庫の情報も帰ってくる
          }
        >;
      };
    };
  },

  //部門登録API[10]
  {
    // path: '/api/store/{store_id}/item/department/';
    // method: 'POST';
    // request: {
    //   privileges: {
    //     role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
    //     policies: []; //実行に必要なポリシー
    //   };
    //
    //   params: {
    //     store_id: Store['id'];
    //   };
    //   body: {
    //     staff_account_id: Department['staff_account_id']; //担当者ID
    //     myca_genre_id?: MycaAppGenre['id']; //Mycaのジャンルから追加する場合、そのIDを指定する
    //     parent_department_id?: Department['parent_department_id']; //追加する部門の親部門のID Mycaのジャンルから追加する場合は必ず必要 nullだったら一番親の部門となる
    //     display_name?: Department['display_name']; //表示名
    //   };
    // };
    // response: {
    //   201: Department;
    // };
  },

  //部門変更・削除API[11]
  {
    // path: '/api/store/{store_id}/item/department/{department_id}/';
    // method: 'PUT';
    // request: {
    //   privileges: {
    //     role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
    //     policies: []; //実行に必要なポリシー
    //   };
    //
    //   params: {
    //     store_id: Store['id'];
    //     department_id: Department['id']; //変更する対象の部門のID
    //   };
    //   body: {
    //     display_name?: Department['display_name']; //表示名
    //     hidden?: Department['hidden']; //非表示にする時true 表示にする時false
    //     auto_update?: Department['auto_update']; //自動更新をオンにする時true
    //     is_deleted?: Department['is_deleted']; //削除する時true 自動生成部門は削除できない
    //   };
    // };
    // response: {
    //   200: Department;
    // };
  },
];

//バンドル作成API
// export type createBundleDef = {
//   path: '/api/store/{store_id}/item/bundle/';
//   method: 'POST';
//   request: {
//     privileges: {
//       role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
//       policies: []; //実行に必要なポリシー
//     };
//
//     params: {
//       store_id: Store['id'];
//     };
//     body: {
//       staff_account_id: Account['id'];
//       sell_price: Item['sell_price']; //販売価格
//       init_stock_number: Item['init_stock_number']; //初期在庫数
//       display_name: Item['display_name']; //商品名
//       expire_at?: Item['expire_at']; //バンドルの有効期限（自動解体日）
//       department_id?: Department['id']; //部門ID
//       image_url?: Item['image_url']; //画像URL
//       products: Array<{
//         //バンドルの商品定義
//         product_id: Bundle_Item_Product['product_id']; //在庫ID
//         item_count: Bundle_Item_Product['item_count']; //商品数
//       }>;
//     };
//   };
//   response: {
//     201: Item & {
//       bundle_item_products: Array<Bundle_Item_Product>;
//     };
//   };
// };
