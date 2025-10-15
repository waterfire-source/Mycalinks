import { ItemType } from '@/api/backendApi/model/item';
import { ProductCsvUploadOptions } from '@/constants/mycapos';
import { LabelPrinterOptions } from '@/contexts/LabelPrinterContext';
import {
  Product,
  Store,
  Item,
  Bundle_Product,
  Sale,
  Product_Stock_History,
  Product_Wholesale_Price_History,
  Set_Deal,
  Set_Deal_Product,
  WholesalePriceHistoryResourceType,
  Tag,
  AccountKind,
  Transaction,
  Item_Category,
  Item_Genre,
  Product_Card_Info,
  Inventory,
  Product_Image,
  Specialty,
} from '@prisma/client';

export const ProductGetAllOrderType = {
  ActualSellPriceAsc: 'actual_sell_price', // 実際販売価格の昇順
  ActualSellPriceDesc: '-actual_sell_price', // 実際販売価格の降順
  ActualBuyPriceAsc: 'actual_buy_price', // 実際買取価格の昇順
  ActualBuyPriceDesc: '-actual_buy_price', // 実際買取価格の降順
  SellPriceUpdatedAtAsc: 'sell_price_updated_at', // 販売価格の最終更新日時の昇順
  SellPriceUpdatedAtDesc: '-sell_price_updated_at', // 販売価格の最終更新日時の降順
  BuyPriceUpdatedAtAsc: 'buy_price_updated_at', // 買取価格の最終更新日時の昇順
  BuyPriceUpdatedAtDesc: '-buy_price_updated_at', // 買取価格の最終更新日時の降順
  StockNumberAsc: 'stock_number', // 在庫数の昇順
  StockNumberDesc: '-stock_number', // 在庫数の降順
  IdAsc: 'id', // IDの昇順
  IdDesc: '-id', // IDの降順
  EcStockNumberAsc: 'ec_stock_number', //EC上での在庫数
  EcStockNumberDesc: '-ec_stock_number', //EC上での在庫数
  EcPriceAsc: 'actual_ec_sell_price', //EC上での値段
  EcPriceDesc: '-actual_ec_sell_price', //EC上での値段
} as const;
export type ProductGetAllOrderType =
  (typeof ProductGetAllOrderType)[keyof typeof ProductGetAllOrderType];

export type BackendProductAPI = [
  //商品情報検索&取得API[0]
  {
    path: '/api/store/{store_id}/product/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp, '']; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        id?: Product['id'] | Product['id'][] | string; //カンマ区切りをすることで複数指定可能
        item_genre_id?: Item['genre_id']; //ジャンルID
        item_category_id?: Item['category_id']; //商品種別ID
        condition_option_id?: Product['condition_option_id']; //状態ID
        condition_option_display_name?: Item_Category_Condition_Option['display_name']; //状態名
        display_name?:
          | Product['display_name']
          | Item['display_name']
          | Item['display_name_ruby'] //商品名、結びついている商品マスタの名前、ふりがなを対象として、部分一致で検索
          | number; //商品コードが完全一致した場合それも含まれるようにした
        is_active?: Product['is_active']; //アクティブ商品かどうか 指定していなかったらtrue
        isMycalinksItem?: boolean; //Mycaアプリで管理されている商品か
        mycalinks_ec_enabled?: Product['mycalinks_ec_enabled']; //MycalinksECで出品しているかどうか
        product_code?: number | Product['readonly_product_code']; //商品コード readonly_product_code内も検索する
        skip?: number; //何個目の要素から取得するか
        take?: number; //何個分取得するか 指定してなかったら50個 -1で指定してたら無限に取得
        item_id?: Item['id']; //商品マスタID

        tag_name?: Tag['display_name']; //タグの名前で検索（文字列部分一致）

        stock_number_gte?: number; //指定数以上の在庫数のものだけ取得
        ec_stock_number_gte?: number; //指定数以上のEC在庫数のものだけ取得
        ecAvailable?: boolean; //ECで販売可能な商品かどうか（mycalinks_ec_enabledとは関係ない）
        someEcEnabled?: true; //EC有効にしているプラットフォームが一つでもあるもの
        isPack?: true; //パックかどうかを指定する
        type?: ItemType; //商品タイプ
        priceChangeDateGte?: Date; // 価格の変動があった日時の開始
        priceChangeDateLt?: Date; // 価格の変動があった日時の開始
        stockChangeDateGte?: Date; // 在庫数の変動があった日時の開始
        stockChangeDateLt?: Date; // 在庫数の変動があった日時の開始
        item_rarity?: Item['rarity']; // 在庫のカードレアリティの検索
        item_expansion?: Item['expansion'];
        item_cardseries?: Item['cardseries'];
        item_card_type?: Item['card_type'];
        item_option1?: Item['option1'];
        item_option2?: Item['option2'];
        item_option3?: Item['option3'];
        item_option4?: Item['option4'];
        item_option5?: Item['option5'];
        item_option6?: Item['option6'];
        item_release_date?: Item['release_date'];
        item_displaytype1?: Item['displaytype1'];
        item_displaytype2?: Item['displaytype2'];
        item_cardnumber?: string; // 在庫の型番検索
        item_myca_primary_pack_id?: Item['myca_primary_pack_id'];
        item_infinite_stock?: Item['infinite_stock']; //trueだと無限在庫のみ falseだと無限在庫を省く 未指定だと全て取得
        myca_item_id?: Item['myca_item_id'];
        // condition_name?: string; // 在庫の状態名の検索 廃止済み

        is_special_price_product?: Product['is_special_price_product']; //特価商品かどうか

        //特定のオリパに含まれる在庫のみを取得する場合
        original_pack_item_id?: Item['id'];

        specialty_id?: Specialty['id'] | false; //特定のスペシャリティに含まれる在庫のみを取得する場合

        //特定の棚卸に含まれる在庫のみを取得する場合
        inventory_id?: Inventory['id'];

        is_consignment_product?: boolean; //委託商品かどうか
        forStoreShipment?: Store['id']; //店舗間在庫移動のために、特定の店舗に対してマッピングが形成されているものだけを出したい時のやつ

        transactionFinishedAtGte?: Transaction['finished_at']; //取引の終了日時で絞り込み 開始
        transactionFinishedAtLt?: Transaction['finished_at']; //取引の終了日時で絞り込み 終了

        //並び替え指定
        orderBy?: ProductGetAllOrderType;

        includesTransaction?: true; //取引情報（この商品に対しての取引件数など）まで含めたい場合
        includesSummary?: true; //合計数（在庫数など）も求めたい時にtrue

        includesImages?: true; //画像情報まで含めたい場合
        hasManagementNumber?: boolean; //管理番号(management_number)を持っているかどうか
      };
      params: {
        store_id: Store['id'];
      };
    };
    response: {
      200: {
        products: Array<
          Product & {
            product_code: number;
            displayNameWithMeta: string;
            id: Product['id'];
            item_id: Product['item_id'];
            item_name: Item['display_name'];
            displayNameWithMeta: string;
            item_infinite_stock: Item['infinite_stock'];
            item_rarity: Item['rarity'];
            item_expansion: Item['expansion'];
            item_cardnumber: string; //型番
            item_category_id: Item_Category['id'];
            item_category_display_name: Item_Category['display_name'];
            item_genre_id: Item_Genre['id'];
            item_genre_display_name: Item_Genre['display_name'];
            item_allow_auto_print_label: Item['allow_auto_print_label'];
            item_myca_item_id: Item['myca_item_id'];
            condition_option_display_name: Item_Category_Condition_Option['display_name'];
            store_tax_mode: Store['tax_mode'];
            images?: Product_Image[]; //画像情報
            card_info: Product_Card_Info | null; //カード特有の情報
            ecPublishStockNumber: Product['ecPublishStockNumber'];
            consignment_client__full_name: Product['consignment_client']['full_name'];
            consignment_client__display_name: Product['consignment_client']['display_name'];
            specialty__display_name: Specialty['display_name'];
          }
        >;
        totalValues: {
          customerBase: number;
          costBase: number;
          inventoryCount: number;
          totalSellPrice: number;
          totalBuyPrice: number;
          itemCount: number;
        };
      };
    };
  },
  //バンドル商品登録[1] [廃止予定]
  {
    path: '/api/store/{store_id}/product/bundle/';
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
        // staff_account_id: Account['id']; //登録するスタッフのID
        // ヘッダーで指定が必要

        specific_sell_price?: Product['specific_sell_price'];
        specific_buy_price?: Product['specific_buy_price'];
        stock_number?: Product['stock_number'];
        display_name?: Product['display_name'];
        description?: Product['description'];
        retail_price?: Product['retail_price'];
        wholesale_price?: Product['wholesale_price'];
        image_url?: Product['image_url'];
        child_products: Array<//束ねている商品のリスト
        {
          product_id: Bundle_Product['child_product_id'];
          item_count: Bundle_Product['item_count'];
        }>;
      };
    };
    response: {
      200: Product; //作られたバンドル商品の情報
      400: {
        error: string; //在庫数が足りなくて指定数バンドル商品が作れなかった時など
      };
    };
  },
  //商品情報変+更API[2]
  {
    path: '/api/store/{store_id}/product/{product_id}/';
    method: 'PUT';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
        product_id: Product['id'];
      };
      body: {
        //最低でも一つは必要だが、基本全てオプショナル
        specific_sell_price?: Product['specific_sell_price'];
        specific_buy_price?: Product['specific_buy_price'];
        retail_price?: Product['retail_price'];
        allowed_point?: Product['allowed_point']; //この在庫に対してポイントを許可するか否か
        display_name?: Product['display_name'];
        image_url?: Product['image_url'];
        description?: Product['description'];
        // staff_account_id: Account['id'];
        //Headerで指定が必要

        readonly_product_code?: Product['readonly_product_code']; //JANコードなどの紐付け
        // needBundleAdjust?: boolean; //バンドル商品の場合、バンドル対象の商品の在庫数もあわせて変動させるかどうか 廃止
        mycalinks_ec_enabled?: Product['mycalinks_ec_enabled']; //mycalinks ecに出品するかどうか（同意してないとだめ）
        disable_ec_auto_stocking?: Product['disable_ec_auto_stocking']; //自動在庫補充
        pos_reserved_stock_number?: Product['pos_reserved_stock_number']; //POSように取っておきたい在庫数 これは0以上だったら何でもOK（在庫数を超えても大丈夫）
        specific_ec_sell_price?: Product['specific_ec_sell_price']; //ECでの指定価格 nullを指定することで解除できる
        ecPublishStockNumber?: number; //EC出品数を指定する

        tablet_allowed?: Product['tablet_allowed']; //在庫検索タブレットで許可されているかどうか
        allow_buy_price_auto_adjustment?: Product['allow_buy_price_auto_adjustment']; //自動価格調整を許すかどうか
        allow_sell_price_auto_adjustment?: Product['allow_sell_price_auto_adjustment']; //自動価格調整を許すかどうか
        management_number?: Product['management_number']; //管理番号
      };
    };
    response: {
      200: {
        updateResult: Product;
        productsToPrint: Array<{
          //プリントしないといけないラベルのデータ
          id: Product['id'];
          stock_number: Product['stock_number'];
        }>;
      };
      400: {
        //情報が足りない時など
      };
      401: {
        //フィールド指定が不正な時や権限がない時
      };
    };
  },

  //商品在庫変動履歴取得API[3]
  {
    path: '/api/store/{store_id}/product/{product_id}/history/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        start_datetime: Date; //DateTime形式 検索の条件の開始日時
        end_datetime: Date; //DateTime形式 検索の条件の終了日時
        source_kind: Product_Stock_History['source_kind']; //transaction_sell | transaction_buy | transaction_sell_return | transaction_buy_return | product | loss | stocking
      };
      params: {
        store_id: Store['id'];
        product_id: Product['id'];
      };
    };
    response: {
      200: Product_Stock_History[];
    };
  },

  //商品用QRコード発行API[4] [廃止予定]
  {
    path: '/api/store/{store_id}/product/{product_id}/qr/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
        product_id: Product['id'];
      };
    };
    response: {
      200: {
        qrToken: string; //署名付きのQRコード
      };
      404: {
        error: string; //存在しない商品の時など
      };
    };
  },

  //商品転送API[5]
  {
    path: '/api/store/{store_id}/product/{product_id}/transfer/';
    method: 'POST';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
        product_id: Product['id'];
      };
      body: {
        to_product_id: Product['id']; //変更後の商品ID
        item_count: number; //変更する在庫数
        specificWholesalePrice?: number; //特定の仕入れ値を利用したい時指定する、 自動で良い時はundefined
        description: Product_Stock_History['description']; //備考など
        // staff_account_id: Product_Stock_History['staff_account_id']; //担当者ID
        //スタッフIDはヘッダーで指定が必要
      };
    };
    response: {
      200: {
        id: Product['id'];
        resultStockNumber: number; //変動後の在庫数
      }; //変更後の商品の情報（在庫数を含む）
      404: {
        error: string; //存在しない商品の時など
      };
      400: {
        error: string; //在庫数が足りない時など
      };
    };
  },

  //在庫のCSV取得API[6]
  {
    path: '/api/store/{store_id}/product/csv/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        specificDate?: Date; //特定の日付の在庫数を取得したい時に指定する
        item_genre_id?: (Item_Genre['id'] | string)[]; //カンマ区切りで複数指定可能
        item_category_id?: (Item_Category['id'] | string)[]; //カンマ区切りで複数指定可能
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

  //商品がセールの対象に入っているか確認する[7]
  {
    path: '/api/store/{store_id}/product/{product_id}/sale/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        transaction_kind: Sale['transaction_kind']; //セールの種類（sell or buy）　必須パラメータ
      };
      params: {
        store_id: Store['id'];
        product_id: Product['id'];
      };
    };
    response: {
      200: Array<{
        //当てはまったセールのリスト 基本的に要素数は1なはず
        sale: Sale; //該当セールの情報、IDを確認するためなど
        originalPrice: number; //この商品の元々の価格
        discountPrice: number; //割引額 割引だったら負の数、割り増しだったら正の数となる
        resultPrice: number; //結果、この商品の単価は何円なのか
        allowedItemCount: number; //個数制限があるセールの場合は、後何個その商品にセールを適用できるかの個数 特に制限がない場合は -1が返される
      }>;
      404: {
        error: string; //存在しない商品の時など
      };
    };
  },

  //パックの開封を行い、在庫登録をする [8]
  //こちらのAPIを使ってオリジナルパックの解体も行えるようにする
  //APIの更新ついでにdef.tsに書き換えたためこちらは廃止
  {
    // path: '/api/store/{store_id}/product/{product_id}/open-pack/';
    // method: 'POST';
    // request: {
    //   privileges: {
    //     role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
    //     policies: []; //実行に必要なポリシー
    //   };
    //
    //   params: {
    //     store_id: Store['id'];
    //     product_id: Product['id']; //開封するパック（在庫）のID
    //   };
    //   body: {
    //     id?: Pack_Open_History['id']; //既存のパック開封に対して処理をするとき
    //     asDraft?: boolean; //下書きとしてパック開封を登録するとき
    //     item_count: Pack_Open_History['item_count']; //開封するパックの部数
    //     item_count_per_pack: Pack_Open_History['item_count_per_pack']; //パックの一枚あたりの枚数
    //     staff_account_id: Pack_Open_History['staff_account_id']; //担当者
    //     to_products: Array<{
    //       //登録したい中身の商品
    //       product_id: Pack_Open_Products['product_id']; //商品ID
    //       item_count: Pack_Open_Products['item_count']; //商品の登録枚数
    //     }>;
    //     unregister_product_id: Pack_Open_History['unregister_product_id']; //未登録カードの扱い方 nullだったらロス登録をし、特定の商品IDを入力したらその商品の在庫として登録される
    //     unregister_item_count: Pack_Open_History['unregister_item_count']; //未登録カードの枚数
    //   };
    // };
    // response: {
    //   200: Pack_Open_History;
    //   404: {
    //     error: string; //存在しない商品の時など
    //   };
    // };
  },

  //仕入れ値を取得する [9]
  {
    path: '/api/store/{store_id}/product/{product_id}/wholesale-price/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        itemCount?: number; //消費したい商品の数を指定する 指定しなくても仕入れ値の履歴だけなら取得できる
        reverse?: true; //逆順で取得するかどうか 逆にしない場合はパラメータを指定しないこと
        resource_type?: WholesalePriceHistoryResourceType; //特定のリソースに結びついている仕入れ値を取得する時には、そのリソースのタイプを指定する
        resource_id?: Product_Wholesale_Price_History['resource_id']; //特定のリソースに結びついている仕入れ値を取得する時に、特定のリソースのIDを指定する バンドル・オリパの場合商品マスタのID、取引の場合取引のIDなど
      };
      params: {
        store_id: Store['id'];
        product_id: Product['id']; //開封するパック（在庫）のID
      };
    };
    response: {
      200: {
        //今後はここでresource_kindやresource_idなどを指定してあらゆる条件でレコードが取得できるようにしたい
        originalWholesalePrices: Array<Product_Wholesale_Price_History>; //この商品に紐づけられている仕入れ値の履歴
        totalWholesalePrice: number; //仕入れ値を計算する時に使える、有効な在庫の仕入れ値の合計値 *a
        totalItemCount: number; //仕入れ値を計算する時に使える、有効な在庫数量（仕入れ値情報が指定した数だけない時、この値は指定数よりも少なくなる） *b
        noWholesalePriceCount: number; //指定した数だけ仕入れ値情報がなかった時、何個分不足したかの値 基本的に在庫数分だけ仕入れ値情報が完璧に揃っていれば良いが、現時点では抜けているものがあるため
        //※ つまり仕入れ単価は *a / *bで求められるが、noWholesalePriceCountが0より大きい場合、有効な仕入れ値として使っていいのか疑問
      };
      404: {
        error: string; //存在しない商品の時など
      };
    };
  },

  //セット販売を定義する [10]
  {
    path: '/api/store/{store_id}/product/set-deal/';
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
        id?: Set_Deal['id']; //更新する時はIDを指定する

        // staff_account_id: Set_Deal['id']; //登録・更新処理をした担当者ID 更新の場合でも必ず指定しなければならない
        //スタッフIDはヘッダーで指定が必要

        display_name?: Set_Deal['display_name']; //登録の時は必須
        image_url?: Set_Deal['image_url']; //画像
        discount_amount?: Set_Deal['discount_amount']; //適用割引の量 30円引きだったら-30 30%引きだったら70%（他のと統一するためこうしてます） 登録の時は必須
        expire_at?: Set_Deal['expire_at']; //セット販売の有効期限
        start_at?: Set_Deal['start_at']; //セット販売の開始日時 新規作成時は必ず指定しなければならない
        products: Array<{
          product_id: Set_Deal_Product['product_id']; //在庫ID
          item_count: Set_Deal_Product['item_count']; //商品数
        }>;
      };
    };
    response: {
      200: Set_Deal; //無事更新できた時
      201: Set_Deal; //無事登録できた時
    };
  },

  //セット販売を削除する [11]
  {
    path: '/api/store/{store_id}/product/set-deal/{set_deal_id}/';
    method: 'DELETE';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
        set_deal_id: Set_Deal['id'];
      };
    };
    response: {
      200: {
        ok: string; //無事削除できた時
      };
    };
  },

  //セット販売を取得する [12]
  {
    path: '/api/store/{store_id}/product/set-deal/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        id?: Set_Deal['id']; //セット販売のID直指定
        status?: Set_Deal['status']; //ステータス PUBLISH:適用中 DELETED:終了済み DRAFT:適用前
      };
      params: {
        store_id: Store['id'];
      };
    };
    response: {
      200: {
        set_deals: Array<
          Set_Deal & {
            products: Array<Set_Deal_Product>;
          }
        >;
      };
    };
  },

  //セット販売が適用できるか確認する [13]
  //下の方で別で定義
  {
    // path: '/api/store/{store_id}/product/set-deal/check/';
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
    //     products: Array<{
    //       product_id: Product['id']; //商品のIDを指定
    //       item_count: number; //商品数を指定
    //     }>;
    //   };
    // };
    // response: {
    //   200: {
    //     set_deals: Array<//複数のセット販売が適用できる場合は複数入る
    //     {
    //       id: Set_Deal['id']; //適用できるセットのID
    //       products: Array<Set_Deal_Product>; //このセットの定義商品（念の為）
    //       apply_count: number; //このセット販売をこの商品の組み合わせに適用できる回数
    //       set_deal_unit_discount_price: number; //このセット割引一回あたりの、今回における割引額 割引の場合負の数になる
    //     }>;
    //   };
    // };
  },

  //バンドルの解体を行う [14]
  {
    path: '/api/store/{store_id}/product/{product_id}/release-bundle/';
    method: 'POST';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
        product_id: Product['id'];
      };
      body: {
        item_count: number; //解体するバンドルの数
        // staff_account_id: Product_Stock_History['staff_account_id']; //担当者ID
        //スタッフIDはヘッダーで指定が必要
      };
    };
    response: {
      200: Product_Stock_History;
    };
  },

  //在庫数を直接変動させる[15]
  {
    path: '/api/store/{store_id}/product/{product_id}/adjust-stock/';
    method: 'POST';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
        product_id: Product['id'];
      };
      body: {
        changeCount: number; //変動させる数 増加させる場合は正の数、減少させる場合は負の数で指定する
        // staff_account_id: Product_Stock_History['staff_account_id']; //担当者ID
        //スタッフIDはヘッダーで指定が必要
        wholesalePrice?: number; //在庫を増加させる場合、仕入れ値の指定が必要
        reason?: string; //変動の理由などを記述する
      };
    };
    response: {
      200: Product_Stock_History; //作られた変動履歴レコード
    };
  },
];

//オリパパの解体 def.tsに移動したためコメントアウト
export type releaseOriginalPackDef = {
  // path: '/api/store/{store_id}/product/{product_id}/release-original-pack/';
  // method: 'POST';
  // request: {
  //   privileges: {
  //     role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
  //     policies: []; //実行に必要なポリシー
  //   };
  //
  //   params: {
  //     store_id: Store['id'];
  //     product_id: Product['id']; //商品マスタIDではなく在庫の方のIDであることに注意
  //   };
  //   body: {
  //     staff_account_id: Account['id']; //担当者のID
  //     to_products: Array<{
  //       //解体後の商品定義
  //       product_id: Original_Pack_Product['product_id']; //在庫ID
  //       item_count: Original_Pack_Product['item_count']; //数
  //     }>;
  //   };
  // };
  // response: {
  //   200: {
  //     ok: string;
  //   };
  // };
};

export type getTagDef = {
  path: '/api/store/{store_id}/product/tag/';
  method: 'GET';
  request: {
    privileges: {
      role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
      policies: []; //実行に必要なポリシー
    };
    query: {
      id?: Tag['id']; //タグのID
      genre1?: Tag['genre1']; //ジャンル1完全一致で絞り込める
      genre2?: Tag['genre2']; //ジャンル2完全一致で絞り込める
      includesAuto?: boolean; //自動で生成されたタグ（PSA用など）まで含めたい場合true デフォルトでは含めない
    };
    params: {
      store_id: Store['id']; // 店舗のID
    };
  };
  response: {
    200: {
      tags: Array<
        Tag & {
          productsCount: number; //紐付けられている商品の個数
        }
      >;
    };
  };
};

export type createTagDef = {
  path: '/api/store/{store_id}/product/tag/';
  method: 'POST';
  request: {
    privileges: {
      role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
      policies: []; //実行に必要なポリシー
    };

    params: {
      store_id: Store['id']; // 店舗のID
    };
    body: {
      id?: Tag['id']; //更新する場合、そのID
      display_name?: Tag['display_name']; //表示名
      description?: Tag['description']; //説明など
      genre1?: Tag['genre1']; //ジャンル1
      genre2?: Tag['genre2']; //ジャンル2
    };
  };
  response: {
    200: Tag;
  };
};

//タグの削除
export type deleteTagDef = {
  path: '/api/store/{store_id}/product/tag/{tag_id}/';
  method: 'DELETE';
  request: {
    privileges: {
      role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
      policies: []; //実行に必要なポリシー
    };

    params: {
      store_id: Store['id']; // 店舗のID
      tag_id: Tag['id']; //タグのID
    };
  };
  response: {
    200: {
      ok: string;
    };
  };
};

//指定したカート内容にどのセット販売を適用することができるのか算出するAPI
export type checkSetDealsDef = {
  path: '/api/store/{store_id}/product/set-deal/check/';
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
      carts: Array<{
        product_id: Product['id']; //商品のID
        unit_price: number; //単価
        item_count: number; //個数
      }>;
    };
  };
  response: {
    200: {
      availableSetDeals: Array<{
        setDealId: Set_Deal['id'];
        applyCount: number; //このセット販売を何回適用できるか
        totalDiscountPrice: number; //全て適用した時の割引額
        display_name: Set_Deal['display_name'];
        targetProducts: Array<{
          //適用対象のカート内の商品
          product_id: Product['id'];
          item_count: number;
          unit_price: number;
        }>;
      }>;
    };
  };
};

//在庫の変動履歴を取得するAPI
export type getProductStockHistoryDef = {
  path: '/api/store/{store_id}/product/stock-history/';
  method: 'GET';
  request: {
    privileges: {
      role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
      policies: []; //実行に必要なポリシー
    };
    query: {
      source_kind?: Product_Stock_History['source_kind']; //変動の種類を指定
      product_id?: Product_Stock_History['product_id']; //変動対象の商品ID
      datetime_gte?: Product_Stock_History['datetime']; //期間指定開始
      datetime_lt?: Product_Stock_History['datetime']; //期間指定終了
    };
    params: {
      store_id: Store['id']; // 店舗のID
    };
  };
  response: {
    200: {
      histories: Array<{
        id: Product_Stock_History['id']; //変動のID
        staff_account_id: Product_Stock_History['staff_account_id']; //担当者
        product_id: Product_Stock_History['product_id']; //対象商品
        type: Product_Stock_History['type']; //変動のタイプ 基本的にすべてupdate 廃止する可能性が高い
        source_kind: Product_Stock_History['source_kind']; //変動の種類 詳しくはenum参照 在庫直接変動は「product」
        source_id: Product_Stock_History['source_kind']; //在庫変動に関連しているリソースのID
        item_count: Product_Stock_History['item_count']; //変動の量 負の数もある
        unit_price: Product_Stock_History['unit_price']; //増加の場合仕入れ値に相当 減少の場合販売価格に相当
        description: Product_Stock_History['description']; //変動の説明 在庫直接変動をさせた時はここに理由も含まれる
        result_stock_number: Product_Stock_History['result_stock_number']; //変動した結果、在庫数が何になったのか
        datetime: Product_Stock_History['datetime']; //変動させた日時
        product: {
          display_name: Product['display_name'];
          displayNameWithMeta: string;
          image_url: Product['image_url'];
          created_at: Product['created_at'];
        };
      }>;
    };
  };
};

// 指定したプロダクトに対する在庫変動を取得する
export type listProductStockTransferHistoryDef = {
  path: '/api/store/{store_id}/product/{product_id}/transfer-history/';
  method: 'GET';
  request: {
    privileges: {
      role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
      policies: []; //実行に必要なポリシー
    };
    query: {
      kind: string;
      orderBy?: string;
    };
    params: {
      store_id: Store['id'];
      product_id?: Product_Stock_History['product_id']; //変動対象の商品ID
    };
  };
  response: {
    stockHistories: Array<{
      id: Product_Stock_History['id']; //変動のID
      staff_account_id: Product_Stock_History['staff_account_id']; //担当者
      product_id: Product_Stock_History['product_id']; //対象商品
      type: Product_Stock_History['type']; //変動のタイプ 基本的にすべてupdate 廃止する可能性が高い
      source_kind: Product_Stock_History['source_kind']; //変動の種類 詳しくはenum参照 在庫直接変動は「product」
      source_id: Product_Stock_History['source_id']; //在庫変動に関連しているリソースのID
      item_count: Product_Stock_History['item_count']; //変動の量 負の数もある
      unit_price: Product_Stock_History['unit_price']; //増加の場合仕入れ値に相当 減少の場合販売価格に相当
      description: Product_Stock_History['description']; //変動の説明 在庫直接変動をさせた時はここに理由も含まれる
      result_stock_number: Product_Stock_History['result_stock_number']; //変動した結果、在庫数が何になったのか
      datetime: Product_Stock_History['datetime']; //変動させた日時
    }>;
  };
};

export type productCsvUploadDef = {
  path: '/api/store/{store_id}/product/csv';
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
        options: ProductCsvUploadOptions;
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
      productsToPrint?: Array<{
        id: Product['id'];
        stock_number: Product['stock_number'];
        specificPrintCount: number | null; //指定枚数があった場合
        productPrintOption: LabelPrinterOptions['product']['price'];
        cuttingOption: LabelPrinterOptions['cut'];
      }>;
      errorInfo: {
        successCount: number;
        errorCount: number;
        fileUrl: string;
      };
    };
  };
};
