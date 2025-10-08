import { apiMethod, apiRole, Required } from '@/api/backendApi/main';
import { Account, Corporation } from '@prisma/client';

//法人作成
/**
 * @deprecated Use createCorporationApi from api-generator instead
 */
export const createCorporationDef = {
  method: apiMethod.POST,
  path: 'corporation',
  privileges: {
    role: [apiRole.pos], //法人アカウントでのみ実行できる
  },
  request: {
    body: {
      email: Required<Account['email']>(), //メールアドレス
    },
  },
  process: `
  ID: 1 or ステージング上の法人アカウントじゃないと実行できない
  `,
  response: <
    {
      account: Account & {
        corporation: Corporation;
      };
    }
  >{},
  error: {} as const,
};

//法人取得
/**
 * @deprecated Use getCorporationApi from api-generator instead
 */
export const getCorporationDef = {
  method: apiMethod.GET,
  path: 'corporation',
  privileges: {
    role: [apiRole.pos],
  },
  request: {},
  process: `
  `,
  response: <
    {
      corporation: {
        id: Corporation['id']; // 法人ID
        name: Corporation['name']; // 法人名
        ceo_name: Corporation['ceo_name']; // 代表者名
        head_office_address: Corporation['head_office_address']; // 本社住所
        phone_number: Corporation['phone_number']; // 電話番号
        kobutsusho_koan_iinkai: Corporation['kobutsusho_koan_iinkai']; // 古物商公安委員会名
        kobutsusho_number: Corporation['kobutsusho_number']; // 古物商許可番号
        invoice_number: Corporation['invoice_number']; //インボイス番号
        zip_code: Corporation['zip_code']; //郵便番号
        square_available: Corporation['square_available']; //スクエア連携済みかどうか

        //以下、ストアデフォルト
        tax_mode: Corporation['tax_mode']; //内税か外税か
        price_adjustment_round_rule: Corporation['price_adjustment_round_rule']; //丸め方
        price_adjustment_round_rank: Corporation['price_adjustment_round_rank']; //丸める桁
        use_wholesale_price_order_column: Corporation['use_wholesale_price_order_column']; //仕入れ値使う時の順番
        use_wholesale_price_order_rule: Corporation['use_wholesale_price_order_rule']; //仕入れ値使う時の順番のやつ
        wholesale_price_keep_rule: Corporation['wholesale_price_keep_rule']; //仕入れ値保持ルール（個別or平均値）
      };
    }
  >{},
  error: {} as const,
};
