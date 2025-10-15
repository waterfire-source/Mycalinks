import { Corporation } from '@prisma/client';

export type BackendCorporationAPI = [
  // 法人情報更新API
  {
    path: '/api/corporation/{corporation_id}/';
    method: 'PUT';
    request: {
      privileges: {
        role: [AccountKind.corp, AccountKind.store];
        policies: []; //実行に必要なポリシー
      };
      params: {
        corporation_id: Corporation['id']; // 更新対象の法人ID
      };
      body: {
        name?: Corporation['name']; // 法人名
        ceo_name?: Corporation['ceo_name']; // 代表者名
        head_office_address?: Corporation['head_office_address']; // 本社住所
        phone_number?: Corporation['phone_number']; // 電話番号
        kobutsusho_koan_iinkai?: Corporation['kobutsusho_koan_iinkai']; // 古物商公安委員会名
        kobutsusho_number?: Corporation['kobutsusho_number']; // 古物商許可番号

        invoice_number?: Corporation['invoice_number']; //インボイス
        zip_code?: Corporation['zip_code']; //郵便番号

        //以下、ストアデフォルト（この値を変えても現在のストアの値が変わるわけではない）
        tax_mode?: Corporation['tax_mode']; //内税か外税か
        price_adjustment_round_rule?: Corporation['price_adjustment_round_rule']; //丸め方
        price_adjustment_round_rank?: Corporation['price_adjustment_round_rank']; //丸める桁
        use_wholesale_price_order_column?: Corporation['use_wholesale_price_order_column']; //仕入れ値使う時の順番
        use_wholesale_price_order_rule?: Corporation['use_wholesale_price_order_rule']; //仕入れ値使う時の順番のやつ
        wholesale_price_keep_rule?: Corporation['wholesale_price_keep_rule']; //仕入れ値保持ルール（個別or平均値）

        // current_password: string; // 現在のパスワード
      };
    };
    response: {
      200: {
        corporation: Corporation; // 更新後の法人情報
      };
    };
  },
];
