import {
  Account,
  Customer,
  Item_Genre,
  Payment,
  Product,
  Register,
  Store,
  Transaction,
  Transaction_Cart,
  Transaction_Set_Deal,
} from '@prisma/client';

export type BackendTransactionAPI = [
  //取引作成API
  {
    path: '/api/store/{store_id}/transaction/';
    method: 'POST';
    request: {
      privileges: {
        role: [AccountKind.corp, '']; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
      };
      body: {
        asDraft?: boolean; //下書きとして保存するかどうか（主に買取一時保存用）
        id?: Transaction['id']; //既存の取引の変更（下書き中のものに限る）を行うための、ID

        disableGivePoint?: boolean; //ポイント付与を無効にする

        staff_account_id: Account['id'];

        //会員は必須ではない
        customer_id?: Customer['id'];

        register_id?: Register['id']; //管理モードの時は必要 ストアモードの時は必要ない

        transaction_kind: Transaction['transaction_kind'];
        total_price: Transaction['total_price'];
        subtotal_price: Transaction['subtotal_price'];
        tax: Transaction['tax'];
        // tax_kind: Transaction['tax_kind']; //内税 or 外税 or 免税
        discount_price: Transaction['discount_price']; //手動割引
        coupon_discount_price: Transaction['coupon_discount_price']; //クーポン割引
        point_discount_price: Transaction['point_discount_price']; //ポイント割引
        payment_method: Transaction['payment_method'];
        buy__is_assessed: Transaction['buy__is_assessed']; //買取査定が終わったかどうか
        recieved_price: Payment['cash_recieved_price'];
        change_price: Payment['cash__change_price'];
        id_kind?: Transaction['id_kind'];
        id_number?: Transaction['id_number'];
        description?: Transaction['description'];
        parental_consent_image_url?: Transaction['parental_consent_image_url'];
        parental_contact?: Transaction['parental_contact']; //保護者の連絡先
        can_create_signature?: Transaction['can_create_signature']; //買取の署名を作成できる状態にするかどうか
        carts: Array<{
          product_id: Product['id'];
          item_count: Transaction_Cart['item_count'];
          unit_price: Transaction_Cart['unit_price']; //この単価は、セールを適用する前の価格
          sale_id?: Transaction_Cart['sale_id']; //セールを適用したい場合、そのセールIDをここで指定する 会計処理時にこのセールをこの商品に適用できるかリアルタイムで計算し、適用できなかった場合エラーとなり会計が中止される
          sale_discount_price?: Transaction_Cart['sale_discount_price']; //セールによって引かれた額 値引きの場合はここが負の数になる
          discount_price: Transaction_Cart['discount_price']; //[TODO] これも、値引きの場合は負の数にしたい
          reservation_price: Transaction_Cart['reservation_price']; //予約前金の場合はここに予約前金の価格を正の数で入れる 残金支払いの時は、前金の価格を負の数で入れる
          reservation_reception_product_id_for_deposit?: Transaction_Cart['reservation_reception_product_id_for_deposit']; //予約受付の場合、ここに前金の取引IDを入れる
          reservation_reception_product_id_for_receive?: Transaction_Cart['reservation_reception_product_id_for_receive']; //予約受付の場合、ここに受け取りの取引IDを入れる
        }>;
        set_deals: Array<{
          //適用するセット販売の定義
          set_deal_id: Transaction_Set_Deal['set_deal_id']; //セット販売のID
          apply_count: Transaction_Set_Deal['apply_count']; //適用する回数
          total_discount_price: Transaction_Set_Deal['total_discount_price']; //このセット販売のでの合計割引額 割引だったら負の数
        }>;
      };
    };
    response: {
      201: {
        id: Transaction['id']; //作成できたTransactionのID
        status: Transaction['status']; //作成できたTransactionのステータス（COMPLETED | DRAFT）
        reception_number: Transaction['reception_number']; //作成できたTransactionの受付番号
        purchaseReceptionNumberReceiptCommand?: string; //受付番号を印刷するためのコマンド
        purchaseReceptionNumberForStaffReceiptCommand?: string; //店員用の受付番号を印刷するためのコマンド
        autoPrintReceiptEnabled: Register['auto_print_receipt_enabled']; //レジの自動印刷が有効かどうか
      };
      400: {
        error: '在庫が足りません'; //在庫が足りない時
      };
    };
  },

  //返品API
  {
    path: '/api/store/{store_id}/transaction/{transaction_id}/return/';
    method: 'POST';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
        transaction_id: Transaction['id'];
      };
      body: {
        register_id?: Register['id']; //管理モードの時は必須
        dontRefund?: boolean; //返金しない場合はtrue（主に予約前金用 一応予約じゃなくても使える）
        reservation_reception_product_id_for_cancel?: Reservation_Reception_Product['id']; //予約ID（予約前金の返品時に、どの予約の取り消しなのかを明示 productの方のID）
      };
    };
    response: {
      201: {
        id: Transaction['id']; //作成できたTransactionのID
        returnPrice: number; //合計返金金額
      };
      400: {
        error: '在庫が足りません'; //在庫が足りない時
      };
    };
  },

  //取引レシートHTML作成API 下書き買取取引のIDを指定することで見積書の印刷もできる
  {
    path: '/api/store/{store_id}/transaction/{transaction_id}/receipt/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        type: 'receipt' | 'ryoshu'; //領収書かレシートか　現在はレシートのみ対応している
        cash_recieved_price?: Payment['cash_recieved_price']; //現金受け取り額
        cash_change_price?: Payment['cash_change_price']; //現金お釣り額
        is_reprint?: boolean; //再印刷かどうか
      };
      params: {
        store_id: Store['id'];
        transaction_id: Transaction['id'];
      };
    };
    response: {
      200: {
        transactionData: any; //開発用のデータ いろいろ格納されていて危険
        receiptCommand: string; //レシートのコマンド
        receiptCommandForCustomer: string; //顧客用のレシートコマンド
      };
    };
  },

  //見積書用HTML発行API 廃止済み
  {
    path: '/api/store/{store_id}/transaction/{transaction_id}/estimate/';
  },

  //取引キャンセルAPI（下書き用）
  {
    path: '/api/store/{store_id}/transaction/{transaction_id}/cancel/';
    method: 'POST';
    request: {
      privileges: {
        role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };

      params: {
        store_id: Store['id'];
        transaction_id: Transaction['id'];
      };
    };
    response: {
      200: {
        ok: string;
      };
    };
  },

  //取引検索＆情報取得API
  /**
   * @deprecated
   */
  {
    path: '/api/store/{store_id}/transaction/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp, apiRole.everyone]; //アカウントの種類がcorpなら権限に関わらず実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        id?: Transaction['id']; //カンマ区切りで複数指定可能
        customer_id?: Transaction['customer_id'];
        register_id?: Transaction['register_id']; //レジのIDで絞り込み
        staff_account_id?: Transaction['staff_account_id'];
        register_account_id?: Transaction['register_account_id'];
        transaction_kind?: Transaction['transaction_kind']; //sell or buy
        payment_method?: Transaction['payment_method'];
        status?: Transaction['status']; //ステータス
        today?: true; //今回の営業が開始されてからの情報を取得するかどうか（falseは指定できない）
        finishedAtStart?: Date; //期間指定の開始日時（取引完了日時）
        finishedAtEnd?: Date; //期間指定の終了日時（取引完了日時）
        createdAtStart?: Date; //期間指定の開始日時（受付開始日時）
        createdAtEnd?: Date; //期間指定の終了日時（受付開始日時）
        includeSales?: true; //売上などの情報も含めるかどうか
        includeStats?: true; //部門ごとの回数などの統計情報を含めるかどうか 顧客の方のAPIで取得できるため、こちらは廃止する可能性が高い
        includeSummary?: true; //合計数を含めるかどうか
        buy__is_assessed?: Transaction['buy__is_assessed']; //査定のステータスを指定 trueだと査定済 falseだと未査定（なお、デフォルト値がfalseであるため、買取とは関係ない取引もfalseが入っている）
        productName?: string; //取引の中に含まれる商品の名前で検索できる

        take?: number; //取得する件数
        skip?: number; //飛ばす件数
      };
      params: {
        store_id: Store['id'];
      };
    };
    response: {
      200: {
        transactions: Array<{
          is_return: boolean;
          staffAccountDetail: {
            id: Account['id'];
            display_name: Account['display_name'];
            email: Account['email'];
            kind: Account['kind'];
          } | null;
          id: Transaction['id'];
          register_name?: Register['display_name']; //レジの名前
          reception_number?: Transaction['reception_number']; //買取受付番号（販売の方で使う可能性もあり）
          staff_account_id?: Transaction['staff_account_id'];
          staff_account_name?: Account['display_name']; //取引を完了したスタッフのアカウント名
          reception_staff_account_name?: Account['display_name']; //受付担当者のアカウント名（買取受付など）
          input_staff_account_name?: Account['display_name']; //入力担当者のアカウント名（買取査定入力、販売保留など）
          return_staff_account_name?: Account['display_name']; //返品担当者のアカウント名（返品を完了させていた場合）
          store_id: Transaction['store_id'];
          customer_id: Transaction['customer_id'];
          customer_name: Customer['full_name']; //顧客名
          customer_name_ruby: Customer['full_name_ruby']; //顧客名 かな
          transaction_kind: Transaction['transaction_kind'];
          total_price: Transaction['total_price'];
          total_sale_price: Transaction['total_sale_price'];
          total_reservation_price: Transaction['total_reservation_price'];
          subtotal_price: Transaction['subtotal_price'];
          tax: Transaction['tax'];
          discount_price: Transaction['discount_price'];
          total_discount_price: Transaction['total_discount_price'];
          point_amount: Transaction['point_amount'];
          total_point_amount: Transaction['total_point_amount'];
          point_discount_price: Transaction['point_discount_price'];
          buy__is_assessed: Transaction['buy__is_assessed'];
          id_number: Transaction['id_number'];
          id_kind: Transaction['id_kind'];
          parental_consent_image_url: Transaction['parental_consent_image_url']; //保護者の同意画像
          parental_contact: Transaction['parental_contact']; //保護者の連絡先
          can_create_signature: Transaction['can_create_signature']; //買取の署名を作成できる状態になっているかどうか
          payment_method: Transaction['payment_method'];
          status: Transaction['status'];
          original_transaction_id: Transaction['original_transaction_id'];
          return_transaction_id: Transaction['id']; //返品取引のID
          term_accepted_at: Transaction['term_accepted_at'];
          is_valid: Transaction['is_valid'];
          created_at: Transaction['created_at'];
          updated_at: Transaction['updated_at'];
          finished_at: Transaction['finished_at'];
          signature_image_url: Transaction['signature_image_url'];
          description: Transaction['description']; //一時保留などのメモ
          payment: {
            id: Payment['id'];
            mode: Payment['mode'];
            service: Payment['service'];
            method: Payment['method'];
            source_id: Payment['source_id'];
            total_amount: Payment['total_amount'];
            card__card_brand: Payment['card__card_brand'];
            card__card_type: Payment['card__card_type'];
            card__exp_month: Payment['card__exp_month'];
            card__exp_year: Payment['card__exp_year'];
            card__last_4: Payment['card__last_4'];
            cash__recieved_price: Payment['cash__recieved_price'];
            cash__change_price: Payment['cash__change_price'];
            bank__checked: Payment['bank__checked'];
          } | null;
          transaction_carts: [
            //店で作ったカート情報
            {
              product_id: Product['id'];
              product_name: Product['display_name'];
              product__displayNameWithMeta: string;
              product_genre_name: string; //ジャンル名（部門の名前）
              product_category_name: string; //商品種別名（親部門の名前）
              item_count: Transaction_Cart['item_count'];
              unit_price: Transaction_Cart['unit_price'];
              discount_price: Transaction_Cart['discount_price'];
              original_unit_price: Transaction_Cart['original_unit_price'];
              sale_id: Transaction_Cart['sale_id']; //適用されたセールのID
              sale_discount_price: Transaction_Cart['sale_discount_price']; //セールによる値引き額
              total_discount_price: Transaction_Cart['total_discount_price'];
              total_unit_price: Transaction_Cart['total_unit_price'];
              reservation_reception_product_id_for_deposit: Transaction_Cart['reservation_reception_product_id_for_deposit'];
              reservation_reception_product_id_for_receive: Transaction_Cart['reservation_reception_product_id_for_receive'];
              consignment_sale_unit_price: Transaction_Cart['consignment_sale_unit_price'];
              consignment_commission_unit_price: Transaction_Cart['consignment_commission_unit_price'];
              reservation_price: Transaction_Cart['reservation_price'];
            },
          ];
          transaction_customer_carts: [
            //お客さんが提案した、新しいカート情報
            {
              product_id: Product['id'];
              product_name: Product['display_name'];
              product__displayNameWithMeta: string;
              product_genre_name: string; //ジャンル名（部門の名前）
              product_category_name: string; //商品種別名（親部門の名前）
              item_count: Transaction_Customer_Cart['item_count'];
              unit_price: Transaction_Customer_Cart['unit_price'];
              discount_price: Transaction_Customer_Cart['discount_price'];
              original_item_count: Transaction_Customer_Cart['original_item_count'];
            },
          ];
          set_deals: Array<Transaction_Set_Deal>; //結びついているセット販売の情報
        }>;
        sales: Array<{
          total_price: number;
          transaction_kind: Transaction['transaction_kind'];
          payment_method: Transaction['payment_method'];
        }>;
        stats: {
          //統計情報など
          groupByItemGenreTransactionKind?: Array<{
            transaction_kind: Transaction['transaction_kind'];
            genre_display_name: Item_Genre['display_name'];
            total_count: number; //合計数
          }>;
          numberOfVisits?: number; //取引数
        };
        summary: {
          total_count: number; //合計数
        };
      };
    };
  },

  //取引検索＆情報取得API（認証なしVer）[6]
  {
    path: '/api/store/{store_id}/transaction/';
    method: 'GET';
    request: {
      privileges: {
        role: ['']; //誰でも実行できる
        policies: []; //実行に必要なポリシー
      };
      query: {
        id?: Transaction['id'];
        customer_id?: Transaction['customer_id'];
        staff_account_id?: Transaction['staff_account_id'];
        register_account_id?: Transaction['register_account_id'];
        transaction_kind?: Transaction['transaction_kind']; //sell or buy
        payment_method?: Transaction['payment_method'];
        status?: Transaction['status']; //ステータス
        today?: true; //今回の営業が開始されてからの情報を取得するかどうか（falseは指定できない）
        finishedAtStart?: Date; //期間指定の開始日時（取引完了日時）
        finishedAtEnd?: Date; //期間指定の終了日時（取引完了日時）
        createdAtStart?: Date; //期間指定の開始日時（受付開始日時）
        createdAtEnd?: Date; //期間指定の終了日時（受付開始日時）
        includeSales?: true; //売上などの情報も含めるかどうか
        buy__is_assessed?: Transaction['buy__is_assessed']; //査定のステータスを指定 trueだと査定済 falseだと未査定（なお、デフォルト値がfalseであるため、買取とは関係ない取引もfalseが入っている）
      };
      params: {
        store_id: Store['id'];
      };
    };
    response: {
      200: {
        transactions: Array<{
          id: Transaction['id']; //ID
          reception_number: Transaction['reception_number']; //受付番号
          status: Transaction['status']; //ステータス
          buy__is_assessed: Transaction['buy__is_assessed']; //査定済みかどうか
        }>;
      };
    };
  },

  //特定の取引情報取得API（現在はゲスト用 [廃止予定]）
  {
    path: '/api/store/{store_id}/transaction/{transaction_id}/';
    method: 'GET';
    request: {
      privileges: {
        role: ['']; //権限が必要ない
        policies: [];
      };

      params: {
        store_id: Store['id'];
        transaction_id: Transaction['id'];
      };
    };
    response: {
      200: {
        id: Transaction['id']; //ID
        status: Transaction['status']; //ステータス
        buy__is_assessed: Transaction['buy__is_assessed']; //査定中かどうか
      };
    };
  },
];

export type getPurchaseFormUrlDef =
  //買取の非会員用フォームのURL発行
  {
    path: '/api/store/{store_id}/transaction/purchase-form-url/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp];
        policies: [];
      };

      params: {
        store_id: Store['id'];
      };
      query: {
        type?: 'reservation'; //デフォルトはpurchase reservationは予約用
      };
    };
    response: {
      200: {
        formUrl: string; //フォームのURL
        receiptCommand: string; //印刷用コマンド
      };
    };
  };

//取引更新API カートの変更がない場合の変更API
//過去の取引に対して顧客を結びつける
//買取署名をできるようにするための変更
export type putTransactionDef = {
  path: '/api/store/{store_id}/transaction/{transaction_id}/';
  method: 'PUT';
  request: {
    privileges: {
      role: [AccountKind.corp]; //アカウントの種類がcorpなら権限に関わらず実行できる
      policies: []; //実行に必要なポリシー
    };

    params: {
      store_id: Store['id'];
      transaction_id: Transaction['id']; //更新する対象のID
    };
    body: {
      customer_id?: Customer['id']; //結びつける会員IDを変える場合 変えた時、販売取引だったら顧客にポイントが再付与される

      //完了した取引に対して変更できるフィールド
      payment?: {
        bank__checked?: Transaction['bank__checked']; //銀行振込をしたかどうかのチェック
      };

      //下書きに対して変更できるフィールド
      can_create_signature?: Transaction['can_create_signature']; //買取の署名を作成できる状態にするかどうか
      id_kind?: Transaction['id_kind']; //身分証の種類
      id_number?: Transaction['id_number']; //身分証の番号
      parental_consent_image_url?: Transaction['parental_consent_image_url']; //保護者承諾書
      parental_contact?: Transaction['parental_contact']; //保護者の連絡先
    };
  };
  response: {
    // 200: BackendTransactionAPI[5]['response'][200]; //取引取得APIと同じフィールドを取得することができる
    200: Transaction & {
      payment?: Payment;
    };
  };
};
