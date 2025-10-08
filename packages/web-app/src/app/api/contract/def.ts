import { apiMethod, apiRole, Required } from '@/api/backendApi/main';
import { Account, Contract, Corporation } from '@prisma/client';

//契約作成API
/**
 * @deprecated Use createContractApi from api-generator instead
 */
export const createContractDef = {
  method: apiMethod.POST,
  path: 'contract',
  privileges: {
    role: [apiRole.admin, apiRole.pos],
  },
  request: {
    body: {
      start_at: Required<Contract['start_at']>(Date), //利用開始日
      main_account_monthly_fee:
        Required<Contract['main_account_monthly_fee']>(), //メインアカウント月額利用料
      corporation_management_account_fee:
        Required<Contract['corporation_management_account_fee']>(), //本部管理アカウント利用料
      mobile_device_connection_fee:
        Required<Contract['mobile_device_connection_fee']>(), //スマホ・タブレット連携費用
      initial_fee: Required<Contract['initial_fee']>(), //初期費用
    },
  },
  process: `
  `,
  response: <Contract>{},
  error: {
    pastStartAt: {
      status: 400,
      messageText: '利用開始日を過去にすることはできません',
    },
  } as const,
};

//契約支払いAPI
/**
 * @deprecated Use payContractApi from api-generator instead
 */
export const payContractDef = {
  method: apiMethod.POST,
  path: 'contract/pay',
  privileges: {
    role: [apiRole.everyone], //トークンがあれば誰でもOK
  },
  request: {
    body: {
      token: Required<Contract['token']>(), //トークン（クエリパラメータから取得）
      corporation: {
        //本部情報
        name: Required<Corporation['name']>(), //法人名
        ceo_name: Required<Corporation['ceo_name']>(), //法人代表者名
        head_office_address: Required<Corporation['head_office_address']>(), //本社所在地
        phone_number: Required<Corporation['phone_number']>(), //電話番号
      },
      account: {
        //本部用アカウント用
        email: Required<Account['email']>(), //本部アカウントメールアドレス
      },
      card: {
        //クレジットカード情報
        token: Required<string>(), //MyToken.jsで発行したクレジットカードトークン
      },
    },
  },
  process: `
  `,
  response: <
    {
      contract: {
        status: Contract['status']; //ここがNOT_STARTEDだったら決済ができていない＝3Dセキュアが必要か、何らかのエラー STARTEDだったら3Dセキュアをせずに決済完了した感じ
      };
      tds?: {
        //3Dセキュア情報（必要だったら）
        redirectUrl: string; //3Dセキュアの手続きを進めるためのURL このURLにアクセスして3Dセキュアの手続きをすすめたら、自動的にThanks画面に遷移する
      };
    }
  >{},
  error: {} as const,
};

//契約月額料API
/**
 * @deprecated Use payContractSubscriptionApi from api-generator instead
 */
export const payContractSubscriptionDef = {
  method: apiMethod.POST,
  path: 'contract/pay/subscription',
  privileges: {
    role: [apiRole.bot, apiRole.pos], //BOT
  },
  request: {},
  process: `
  `,
  response: {
    ok: '処理が完了しました',
  },
  error: {} as const,
};

//契約取得API
/**
 * @deprecated Use getContractsApi from api-generator instead
 */
export const getContractsDef = {
  method: apiMethod.GET,
  path: 'contract',
  privileges: {
    role: [apiRole.everyone], //トークンがあれば誰でもOK
  },
  request: {
    query: {
      token: Required<Contract['token']>(), //トークンを指定する
    },
  },
  process: `
  `,
  response: <
    {
      token_expires_at: Contract['token_expires_at'];
      start_at: Contract['start_at'];
      main_account_monthly_fee: Contract['main_account_monthly_fee']; //メインアカウント利用料
      corporation_management_account_fee: Contract['corporation_management_account_fee']; //本部管理アカウント利用料
      mobile_device_connection_fee: Contract['mobile_device_connection_fee']; //スマホ・タブレット連携費用
      initial_fee: Contract['initial_fee']; //初期費用
      initial_payment_price: Contract['initial_payment_price']; //初期支払い料 自動計算
      monthly_payment_price: Contract['monthly_payment_price']; //月額支払い料 自動計算
    }
  >{},
  error: {} as const,
};
