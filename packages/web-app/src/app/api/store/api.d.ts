import { Ec_Setting, Store } from '@prisma/client';

export type api = [
  // 店舗作成API[0]
  {
    // path: '/api/store/';
    // method: 'POST';
    // request: {
    //   privileges: {
    //     role: [AccountKind.corp]; // 法人アカウントのみ作成可能
    //     policies: []; //実行に必要なポリシー
    //   };
    //
    //
    //   body: {
    //     store_name: Store['display_name']; // 店舗表示名
    //     representative_name: Account['display_name']; // 代表者名
    //     email: Account['email']; // メールアドレス
    //     password: Account['hashed_password']; // パスワード
    //     account_id: Account['id']; // 本部アカウントID
    //     corp_password: Account['hashed_password']; // 本部アカウントパスワード
    //     zip_code: Store['zip_code']; // 郵便番号
    //     full_address: Store['full_address']; // 住所
    //     phone_number: Store['phone_number']; // 電話番号
    //     receipt_logo_url: Store['receipt_logo_url']; // 画像URL
    //   };
    // };
    // response: {
    //   200: {
    //     id: Store['id']; // 作成された店舗のID
    //   };
    // };
  },
  //店情報更新API[1]
  {
    path: '/api/store/{store_id}/';
    method: 'PUT';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      params: {
        id: Store['id'];
      };
      body: {
        // opened?: Store['opened']; 廃止
        buy_term?: Store['buy_term']; //買取の規約
        use_wholesale_price_order_column?: Store['use_wholesale_price_order_column']; //仕入れ値の使い方のカラム指定
        use_wholesale_price_order_rule?: Store['use_wholesale_price_order_rule']; //仕入れ値の使い方の並び替えルール
        wholesale_price_keep_rule?: Store['wholesale_price_keep_rule']; //仕入れ値の保持ルール
        display_name?: Store['display_name']; //店舗表示名
        leader_name?: Store['leader_name']; //代表者名
        image_url?: Store['image_url']; //画像URL
        receipt_logo_url?: Store['receipt_logo_url']; //レシートのロゴ画像
        full_address?: Store['full_address']; //住所
        zip_code?: Store['zip_code']; //郵便番号
        phone_number?: Store['phone_number']; //電話番号
        point_enabled?: Store['point_enabled']; //ポイント機能を利用するか否か
        //ポイント付与周り
        visit_point_enabled?: Store['visit_point_enabled']; //来店ポイントを付与するか否か
        visit_point_per?: Store['visit_point_per']; //来店ポイントの付与機会
        visit_point_amount?: Store['visit_point_amount']; //来店ポイントの量
        sell_point_enabled?: Store['sell_point_enabled']; //販売ポイントを付与するか否か
        sell_point_per?: Store['sell_point_per']; //何円につき販売ポイントを付与するのか
        sell_point_limit_enabled?: Store['sell_point_limit_enabled']; //販売ポイント上限
        sell_point_limit_per?: Store['sell_point_limit_per']; //販売ポイント制限の機会
        sell_point_limit_amount?: Store['sell_point_limit_amount']; //販売ポイント制限の量
        buy_point_enabled?: Store['buy_point_enabled']; //買取ポイントを付与するか否か
        buy_point_per?: Store['buy_point_per']; //何円につき買取ポイントを付与するのか
        buy_point_limit_enabled?: Store['buy_point_limit_enabled']; //買取ポイント上限
        buy_point_limit_per?: Store['buy_point_limit_per']; //買取ポイント制限の機会
        buy_point_limit_amount?: Store['buy_point_limit_amount']; //買取ポイント制限の量
        sell_point_payment_method?: Store['sell_point_payment_method']; //販売ポイントの支払い方法 cash,square,paypay,felica,bankみたいにカンマ区切り
        buy_point_payment_method?: Store['buy_point_payment_method']; //買取ポイントの支払い方法 cash,bankみたいにカンマ区切り
        //ポイント利用周り
        point_rate?: Store['point_rate']; //1ポイントを利用する時現金の何円相当になるか
        point_spend_limit_enabled?: Store['point_spend_limit_enabled']; //ポイント消費の制限を設けるか否か
        point_spend_limit_per?: Store['point_spend_limit_per']; //ポイント消費の制限の機会
        point_spend_limit_amount?: Store['point_spend_limit_amount']; //ポイント消費の制限の量
        point_expire_enabled?: Store['point_expire_enabled']; //ポイントの有効期限を設定するか否か
        point_expire_day?: Store['point_expire_day']; //何日でポイントの有効期限がくるようにするか（自動でポイントが0になる）

        //お金
        price_adjustment_round_rule?: Store['price_adjustment_round_rule']; //丸め方
        price_adjustment_round_rank?: Store['price_adjustment_round_rank']; //デフォルトでは桁は動かさない

        //SquareのロケーションID
        square_location_id?: Store['square_location_id'];
        payment_service?: Store['payment_service']; //支払い方法

        //レジ
        register_cash_reset_enabled?: Store['register_cash_reset_enabled']; //レジ金のリセットを有効にするかどうか
        register_cash_check_timing?: Store['register_cash_check_timing']; //レジ点検のタイミング
        register_cash_manage_by_separately?: Store['register_cash_manage_by_separately']; //レジ現金を個別で管理するか一括で管理するか

        //従業員アカウント
        staff_barcode_timeout_minutes?: Store['staff_barcode_timeout_minutes']; //従業員バーコードのタイムアウト時間（分）

        //請求元
        billing_source_corporation_name?: Store['billing_source_corporation_name']; //請求元法人名
        billing_source_address?: Store['billing_source_address']; //請求元所在地
        billing_source_phone_number?: Store['billing_source_phone_number']; //請求元電話番号
        billing_source_email?: Store['billing_source_email']; //請求元email
        billing_source_bank_name?: Store['billing_source_bank_name']; //請求元金融機関名
        billing_source_bank_branch_name?: Store['billing_source_bank_branch_name']; //請求元金融機関支店名
        billing_source_bank_account_type?: Store['billing_source_bank_account_type']; //請求元金融機関口座種別
        billing_source_bank_account_number?: Store['billing_source_bank_account_number']; //請求元金融機関口座番号
        billing_source_bank_account_name_ruby?: Store['billing_source_bank_account_name_ruby']; //請求元金融機関口座名義（カナ）

        //EC設定
        mycalinks_ec_terms_accepted?: Store['mycalinks_ec_terms_accepted']; //Mycalinks ECの利用規約に同意したかどうか これをtrueにしないと下をtrueにできない
        mycalinks_ec_enabled?: Store['mycalinks_ec_enabled']; //Mycalinks ECをオンにしているかどうか
        ochanoko_ec_enabled?: Store['ochanoko_ec_enabled']; //おちゃのこECをオンにしているかどうか
        shopify_ec_enabled?: Store['shopify_ec_enabled']; //Shopify ECをオンにしているかどうか
        ec_setting?: {
          //ECの詳細設定（各フィールドの詳しい説明はprismaで）
          auto_listing?: Ec_Setting['auto_listing'];
          auto_stocking?: Ec_Setting['auto_stocking'];
          auto_sell_price_adjustment?: Ec_Setting['auto_sell_price_adjustment'];
          price_adjustment_round_rank?: Ec_Setting['price_adjustment_round_rank'];
          price_adjustment_round_rule?: Ec_Setting['price_adjustment_round_rule'];
          reserved_stock_number?: Ec_Setting['reserved_stock_number'];
          enable_same_day_shipping?: Ec_Setting['enable_same_day_shipping'];
          same_day_limit_hour?: Ec_Setting['same_day_limit_hour'];
          shipping_days?: Ec_Setting['shipping_days'];
          closed_day?: Ec_Setting['closed_day'];
          free_shipping_price?: Ec_Setting['free_shipping_price'];
          delayed_payment_method?: Ec_Setting['delayed_payment_method'];
          order_change_request_deadline_days_when_missing_item?: Ec_Setting['order_change_request_deadline_days_when_missing_item'];
          notification_email?: Ec_Setting['notification_email']; //通知がいくメールアドレス

          //以下お茶の子
          ochanoko_email?: Ec_Setting['ochanoko_email'];
          ochanoko_account_id?: Ec_Setting['ochanoko_account_id'];
          ochanoko_password?: Ec_Setting['ochanoko_password'];
          ochanoko_api_token?: Ec_Setting['ochanoko_api_token'];
        };

        //ラベル
        allow_print_no_price_label?: Store['allow_print_no_price_label']; //販売価格が0の商品のラベルを印刷するかどうか
      };
    };
    response: {
      200: {
        ok: string;
      };
    };
  },

  //管理アカウントに紐づく店舗の一覧を取得するAPI[2]
  {
    path: '/api/store/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        id?: Store['id']; //店舗のID
        includesCorp?: boolean; //法人情報を含めるかどうか[廃止予定]
        includesEcSetting?: boolean; //EC設定を含めるかどうか
      };
    };
    response: {
      200: Array<{
        id: Store['id'];
        receipt_logo_url: Store['receipt_logo_url'];
        opened: Store['opened'];
        leader_name: Store['leader_name']; //代表者名
        display_name: Store['display_name'];
        total_cash_price: Store['total_cash_price']; //ロールによって厳しく制限する必要がありそう
        buy_term: Store['buy_term'];
        full_address: Store['full_address']; //住所
        zip_code: Store['zip_code']; //郵便番号
        phone_number: Store['phone_number']; //電話番号
        status_message: Store['status_message']; //処理などのステータスメッセージ
        status_message_updated_at: Store['status_message_updated_at']; //ステータスメッセージが最後に更新された日時
        auto_print_receipt: Store['auto_print_receipt']; //レシートを自動印刷するかどうか
        allow_print_no_price_label: Store['allow_print_no_price_label']; //販売価格が0の商品のラベルを印刷するかどうか
        use_wholesale_price_order_column?: Store['use_wholesale_price_order_column']; //仕入れ値の使い方のカラム指定
        use_wholesale_price_order_rule?: Store['use_wholesale_price_order_rule']; //仕入れ値の使い方の並び替えルール
        wholesale_price_keep_rule?: Store['wholesale_price_keep_rule']; //仕入れ値の保持ルール
        point_enabled?: Store['point_enabled']; //ポイント機能を利用するか否か
        //ポイント付与周り
        visit_point_enabled?: Store['visit_point_enabled']; //来店ポイントを付与するか否か
        visit_point_per?: Store['visit_point_per']; //来店ポイントの付与機会
        visit_point_amount?: Store['visit_point_amount']; //来店ポイントの量
        sell_point_enabled?: Store['sell_point_enabled']; //販売ポイントを付与するか否か
        sell_point_per?: Store['sell_point_per']; //何円につき販売ポイントを付与するのか
        sell_point_limit_enabled?: Store['sell_point_limit_enabled']; //販売ポイント上限
        sell_point_limit_per?: Store['sell_point_limit_per']; //販売ポイント制限の機会
        sell_point_limit_amount?: Store['sell_point_limit_amount']; //販売ポイント制限の量
        sell_point_payment_method?: Store['sell_point_payment_method']; //販売ポイントの支払い方法 cash,square,paypay,felica,bankみたいにカンマ区切り
        buy_point_enabled?: Store['buy_point_enabled']; //買取ポイントを付与するか否か
        buy_point_per?: Store['buy_point_per']; //何円につき買取ポイントを付与するのか
        buy_point_limit_enabled?: Store['buy_point_limit_enabled']; //買取ポイント上限
        buy_point_limit_per?: Store['buy_point_limit_per']; //買取ポイント制限の機会
        buy_point_limit_amount?: Store['buy_point_limit_amount']; //買取ポイント制限の量
        buy_point_payment_method?: Store['buy_point_payment_method']; //買取ポイントの支払い方法 cash,bankみたいにカンマ区切り
        //ポイント利用周り
        point_rate?: Store['point_rate']; //1ポイントを利用する時現金の何円相当になるか
        point_spend_limit_enabled?: Store['point_spend_limit_enabled']; //ポイント消費の制限を設けるか否か
        point_spend_limit_per?: Store['point_spend_limit_per']; //ポイント消費の制限の機会
        point_spend_limit_amount?: Store['point_spend_limit_amount']; //ポイント消費の制限の量
        point_expire_enabled?: Store['point_expire_enabled']; //ポイントの有効期限を設定するか否か
        point_expire_day?: Store['point_expire_day']; //何日でポイントの有効期限がくるようにするか（自動でポイントが0になる）

        //税金
        include_tax?: Store['include_tax']; //内税にするかどうか
        tax_rate?: Store['tax_rate']; //税率
        tax_mode: Store['tax_mode']; //内税or外税
        price_adjustment_round_rule: Store['price_adjustment_round_rule']; //丸方
        price_adjustment_round_rank: Store['price_adjustment_round_rank']; //桁
        enabled_staff_account: Store['enabled_staff_account']; //スタッフアカウントが有効かどうか
        square_location_id: Store['square_location_id']; //Squareと連携していてロケーションが紐づいている場合、そのID

        register_cash_reset_enabled: Store['register_cash_reset_enabled']; //レジ金のリセットを有効にするかどうか
        register_cash_check_timing: Store['register_cash_check_timing']; //レジ点検のタイミング
        register_cash_manage_by_separately: Store['register_cash_manage_by_separately']; //レジ現金を個別で管理するか一括で管理するか

        //請求元
        billing_source_corporation_name: Store['billing_source_corporation_name']; //請求元法人名
        billing_source_address: Store['billing_source_address']; //請求元所在地
        billing_source_phone_number: Store['billing_source_phone_number']; //請求元電話番号
        billing_source_email: Store['billing_source_email']; //請求元email
        billing_source_bank_name: Store['billing_source_bank_name']; //請求元金融機関名
        billing_source_bank_branch_name: Store['billing_source_bank_branch_name']; //請求元金融機関支店名
        billing_source_bank_account_type: Store['billing_source_bank_account_type']; //請求元金融機関口座種別
        billing_source_bank_account_number: Store['billing_source_bank_account_number']; //請求元金融機関口座番号
        billing_source_bank_account_name_ruby: Store['billing_source_bank_account_name_ruby']; //請求元金融機関口座名義（カナ）

        mycalinks_ec_terms_accepted: Store['mycalinks_ec_terms_accepted']; //Mycalinks ECの利用規約に同意したかどうか
        mycalinks_ec_enabled: Store['mycalinks_ec_enabled']; //Mycalinks ECが公開中かどうか
        ochanoko_ec_enabled: Store['ochanoko_ec_enabled']; //おちゃのこECが公開中かどうか
        //上二つだけEc_Settingの方に含まれない

        ec_setting: Ec_Setting | null; //includesEcSetting=trueの時 EC設定まで取得できる
      }>;
    };
  },

  //店の詳細情報を取得するAPI[3]
  {
    path: '/api/store/{store_id}/';
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
        id: Store['id']; //店舗ID
        display_name: Store['display_name']; //店舗表示名
        receipt_logo_url: Store['receipt_logo_url']; //レシートロゴURL
        image_url: Store['image_url']; //画像URL
        buy_term: Store['buy_term']; //買取規約
        full_address: Store['full_address']; //住所
        zip_code: Store['zip_code']; //郵便番号
        phone_number: Store['phone_number']; //電話番号
      };
    };
  },
];
