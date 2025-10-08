/**
 * おちゃのこの在庫詳細
 */
export interface OchanokoProductDetail {
  id: number;
  name: string;
  model_number: string;
  category: {
    id: number;
    name: string;
    parent_id: number;
    parent_name: string;
  };
  // groups: any[];
  prerelease: boolean; //準備中だとtrue
  price: number; //販売価格
  price_unspecified: boolean; //販売価格未設定
  // list_price: number | null;
  stock: number; //在庫数
  stock_unlimited: boolean; //在庫無制限 [TODO] EC連携で在庫数無制限のやつどうする？
  hidden: boolean;
  stock_variation: boolean; //バリエーションの有効可否 falseじゃないといけない
  images: {
    url: string;
    main: boolean;
  }[];
  description: {
    text: string;
  };
  tax_reduce: boolean; //軽減税率
  updated_at: string; //更新日時
}

/**
 * 注文
 */
export interface OchanokoOrderDetail {
  id: number; // 受注番号
  created_at: string; // 受注日時
  updated_at: string; // 受注更新日時
  total_price: number; // 合計金額
  price_detail: {
    // 合計金額内訳（軽減税率を使用していない場合{}のみ）
    standard: number; // 通常価格合計
    reduce: number; // 軽減税率対象価格合計
  };
  total_tax: number; // 消費税合計
  tax_standard_rate: number; // 消費税率
  tax_reduce_rate: number | null; // 軽減税率(設定していない場合null)
  total_tax_detail: {
    // 消費税合計内訳（軽減税率を使用していない場合{}のみ）
    standard: number; // 通常消費税
    reduce: number; // 軽減税率対象消費税
  };
  total_point_discount: number; // ポイント値引き
  point_discount_detail: {
    // ポイント利用内訳（軽減税率を使用していない場合{}のみ）
    standard: number; // 通常ポイント値引き
    reduce: number; // 軽減税率対象ポイント値引き
  };
  total_coupon_discount: number; // クーポン値引き
  coupon_discount_detail: {
    // クーポン利用内訳（軽減税率を使用していない場合{}のみ）
    standard: number; // 通常クーポン値引き
    reduce: number; // 軽減税率対象クーポン値引き
  };
  coupon_code: string; // クーポンコード名
  total_shipping_price: number; // 送料合計
  cash_on_delivery_fee: number; // 代金引換手数料
  total_special_requests_price: number; // オプション代合計
  total_shipping_option_price: number; // 配送オプション金額合計
  total_product_price: number; // 販売価格合計
  product_price_detail: {
    // 販売価格内訳（軽減税率を使用していない場合{}のみ）
    standard: number; // 通常販売価格合計
    reduce: number; // 軽減税率対象販売価格合計
  };
  points_acquired: number; // 付与ポイント
  currency: {
    code: string; // 適用通貨
    symbol: string; // 通貨単位
    symbol_position: string; // 通貨表示位置
    decimal_places: number; // 小数点以下表示桁数
  };
  cancelled: boolean; // キャンセル済み
  payment_method: string; // 支払い方法 銀行振込など
  payment_details: Array<{
    // 支払い方法詳細
    title: string;
    value: string;
  }>;
  confirmation_status: {
    //これはあくまでも手動で変更するやつであるため、あまり信憑性がない
    // 受付状況
    order: boolean; // 受注された時
    shipping: boolean; // 発送された時
    payment: boolean; // 支払いされた時
    other: boolean; // その他
  };
  email_status: {
    // メール送信状況 多分使わない
    order: boolean; // 受注
    shipping: boolean; // 発送
    payment: boolean; // 支払い
    other: boolean; // その他
  };
  customer: {
    // 顧客情報
    id: number;
    account: boolean; // アカウント登録
    corporate: boolean; // 法人会員か否か
    company_name: string | null; // 法人名
    department: string | null; // 部署名
    name: string; // 氏名
    name_katakana: string; // 氏名カタカナ
    email: string; // Eメールアドレス
    country: string | null; // 国
    state: string | null; // 州
    postal_code: string; // 郵便番号
    prefecture: string; // 都道府県
    address: string; // 住所
    phone: string; // 電話番号
    fax: string | null; // FAX
  };
  shipping: Array<{
    shipping_price: number; // 送料
    shipping_method: string | null; // 発送方法
    delivery_date: string | null; // お届け日指定
    delivery_time: string | null; // お届け時間指定
    tracking_company: string; // 宅配便伝票番号：運送会社
    tracking_numbers: string[]; // 宅配便伝票番号
    // order_purpose: string; // 用途
    // special_requests: string; // オプション
    // special_requests_comments: string; // オプション備考欄
    // special_requests_price: number; // オプション代
    product_subtotal_price: number; // 販売価格合計
    sender: {
      type: string; // 送り主種別(店舗(shop)、購入者(customer)、送り主の指定(other))
      corporate: boolean; // 法人か否か
      company_name: string; // 法人名
      department: string | null; // 部署名
      name: string; // 氏名
      name_katakana: string; // 氏名カタカナ
      country: string | null; // 国名
      state: string | null; // 州
      postal_code: string; // 郵便番号
      prefecture: string; // 都道府県
      address: string; // 住所
      phone: string; // 電話番号
    };
    recipient: {
      //こっちが送り先住所
      corporate: boolean; // 法人か否か
      company_name: string; // 法人名
      department: string | null; // 部署名
      name: string; // 氏名
      name_katakana: string; // 氏名カタカナ
      country: string | null; // 国名
      state: string | null; // 州
      postal_code: string; // 郵便番号
      prefecture: string; // 都道府県
      address: string; // 住所
      phone: string; // 電話番号
    };
    products: Array<{
      product_id: number; // 商品番号
      name: string; // 商品名
      model_number: string; // 型番
      quantity: number; // 商品個数
      price: number; // 販売価格
      // variations: Array<{
      //   title: string; // バリエーション名
      //   value: string; // バリエーション選択肢
      // }>;
      // customization: Array<{
      //   title: string; // オーダーメイド名
      //   value: string; // 内容
      //   price: number; // 価格
      // }>;
      tax_reduce: boolean; // 軽減税率使用有無（使用している場合true、していない場合false）
    }>;
  }>;
  transaction_fee: number; // 決済手数料/請求書発行手数料
  checkout_comments: string; // 備考欄（注文の時お客様が書くやつ）
  checkout_questionnaire: Array<{
    // アンケート欄
    title: string; // 質問名
    value: string; // 回答内容
  }>;
}
