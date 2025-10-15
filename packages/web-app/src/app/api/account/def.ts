import { apiMethod, apiRole, Optional, Required } from '@/api/backendApi/main';
import { Validation } from '@/utils/validation';
import { Account, Account_Group, Store } from '@prisma/client';
import { defPolicies } from 'api-generator';

//アカウントグループ作成・更新API
/**
 * @deprecated Use createOrUpdateAccountGroupApi from api-generator instead
 */
export const createOrUpdateAccountGroup = {
  method: apiMethod.POST,
  path: 'account/group',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    body: {
      id: Optional<Account_Group['id']>(Number), //更新したい場合はそのID
      display_name: Optional<Account_Group['display_name']>(), //権限名 新規作成の場合は必須

      //以下、ポリシーたち 自分のアカウントで不可になっているものを可とすることはできない
      create_account: Required<Account_Group['create_account']>(),
      update_corporation: Required<Account_Group['update_corporation']>(),
      admin_mode: Required<Account_Group['admin_mode']>(),
      update_store: Required<Account_Group['update_store']>(),
      sales_mode: Required<Account_Group['sales_mode']>(),
      update_store_setting: Required<Account_Group['update_store_setting']>(),
      get_transaction_customer_info:
        Required<Account_Group['get_transaction_customer_info']>(),
      set_transaction_manual_discount:
        Required<Account_Group['set_transaction_manual_discount']>(),
      create_transaction_return:
        Required<Account_Group['create_transaction_return']>(),
      create_buy_reception: Required<Account_Group['create_buy_reception']>(),
      assess_buy_transaction:
        Required<Account_Group['assess_buy_transaction']>(),
      finish_buy_transaction:
        Required<Account_Group['finish_buy_transaction']>(),
      set_buy_transaction_manual_product_price:
        Required<Account_Group['set_buy_transaction_manual_product_price']>(),
      list_item: Required<Account_Group['list_item']>(),
      list_product: Required<Account_Group['list_product']>(),
      list_inventory: Required<Account_Group['list_inventory']>(),
      list_stocking_supplier:
        Required<Account_Group['list_stocking_supplier']>(),
      list_stocking: Required<Account_Group['list_stocking']>(),
      list_cash_history: Required<Account_Group['list_cash_history']>(),
      list_transaction: Required<Account_Group['list_transaction']>(),
      list_customer: Required<Account_Group['list_customer']>(),
      get_stats: Required<Account_Group['get_stats']>(),
    },
  },
  process: `
  アカウントグループの作成・更新を行う
  `,
  response: <
    Account_Group //作ったアカウントグループの情報をそのまま返す
  >{},
};

//アカウントグループ削除API
/**
 * @deprecated Use deleteAccountGroupApi from api-generator instead
 */
export const deleteAccountGroup = {
  method: apiMethod.DELETE,
  path: 'account/group/[account_group_id]/',
  privileges: {
    role: [apiRole.pos], //法人アカウントでのみ実行できる
  },
  request: {
    params: {
      account_group_id: Required<Account_Group['id']>(Number), //削除するアカウントグループのID()
    },
  },
  process: `
  アカウントグループの削除を行う
  `,
  response: {
    ok: 'アカウントグループの削除に成功しました', //定義書で定義しているため、ハンドラー関数内では何もreturnしなくて大丈夫
  },
};

//アカウントグループ取得API
/**
 * @deprecated Use getAccountGroupApi from api-generator instead
 */
export const getAccountGroup = {
  method: apiMethod.GET,
  path: 'account/group',
  privileges: {
    role: [apiRole.pos],
    //この法人に結びついているアカウントグループのみ取得することができる
    //自分の管理が及ぶ範囲内の権限グループのみ
  },
  request: {
    query: {
      id: Optional<Account_Group['id']>(Number),
    },
  },
  process: `
  アカウントグループの取得を行う
  `,
  response: <
    {
      account_groups: Array<
        Account_Group & {
          accountsCount: number; //このアカウントグループに所属しているアカウントの数
        }
      >;
    }
  >{},
};

//アカウント削除API
/**
 * @deprecated Use deleteAccountApi from api-generator instead
 */
export const deleteAccountDef = {
  method: apiMethod.DELETE,
  path: 'account/[account_id]/',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      account_id: Required<Account['id']>(Number), //削除するアカウント 現在は従業員アカウントのみ（論理削除）
    },
  },
  process: `
  アカウントの論理削除を行う
  `,
  response: {
    ok: 'アカウントの削除に成功しました',
  },
  error: {
    invalidAccount: {
      status: 400,
      messageText: 'このアカウントが存在しないか、削除する権限がありません',
    },
  } as const,
};

//アカウント作成API
/**
 * @deprecated Use createAccountApi from api-generator instead
 */
export const createAccountDef = {
  method: apiMethod.POST,
  path: 'account/',
  privileges: {
    role: [apiRole.pos],
    policies: defPolicies(['create_account']),
  },
  request: {
    body: {
      //パスワードはサーバー側で自動生成してメール通知
      email: Required<Account['email']>(
        String,
        (e) => Validation.email(e) || 'Emailの形式が正しくありません',
      ), //メールアドレス 確実にメールが送信できるようにバリデーションをかける
      stores: [
        //所属店舗
        {
          store_id: Required<Store['id']>(),
        },
      ],
      group_id: Required<Account_Group['id']>(), //このスタッフに結びつけるアカウントグループ このストアに結びついている法人が管理しているものからしか選べない
      display_name: Required<Account['display_name']>(), //アカウント名 スタッフの名前に相当する
      nick_name: Optional<Account['nick_name']>(), //ニックネーム
    },
  },
  process: `
  `,
  response: <
    {
      id: Account['id']; //つくられたアカウントのID
      code: Account['code'];
    }
  >{},
};
