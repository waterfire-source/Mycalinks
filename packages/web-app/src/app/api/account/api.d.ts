import { Account, Corporation, Staff, Store } from '@prisma/client';

export type BackendAccountAPI = [
  //アカウント情報取得API [0]
  {
    path: '/api/account/';
    method: 'GET';
    request: {
      privileges: {
        role: [AccountKind.corp, AccountKind.store];
        policies: []; //実行に必要なポリシー
      };
      query: {
        id?: string; //カンマ区切りで複数指定できるようにする
        //Kindがなくなったため以下廃止
        // kind?: Account['kind']; //アカウントの種類（ロール）でも絞り込みができる様にする store→店舗アカウント staff→従業員アカウント
        staff_code?: Staff['code']; //スタッフバーコードを指定
      };
    };
    response: {
      accounts: Array<{
        id: Account['id']; // アカウントID
        display_name: Account['display_name']; // 表示名
        code: Account['code']; // 従業員番号
        email: Account['email']; // メールアドレス
        kind: Account['kind']; // アカウント種別(corp: 法人, store: 店舗)
        linked_corporation_id: Corporation['id'];
        group_id: Account['group_id'];
        nick_name: Account['nick_name']; // ニックネーム

        stores: Array<{
          account_id: Account['id'];
          store_id: Store['id'];
          store: {
            id: Store['id'];
            display_name: Store['display_name']; //店舗名
          };
        }>; // 所属店舗or管理可能店舗の配列
      }>;
    };
  },
  // アカウント情報更新API [1]
  {
    path: '/api/account/{account_id}/';
    method: 'PUT';
    request: {
      privileges: {
        role: [AccountKind.corp, AccountKind.store];
        policies: []; //実行に必要なポリシー
      };
      params: {
        account_id: Account['id']; // 更新対象のアカウントID
      };
      body: {
        current_password: string; // 現在のパスワード(認証用)
        new_password?: string; // 新しいパスワード(変更する場合のみ)
        display_name?: Account['display_name']; // 新しい表示名(変更する場合のみ)
        email?: Account['email']; // 新しいメールアドレス(変更する場合のみ)
        group_id?: Account['group_id']; //アカウントグループを変更する場合 自分以下の権限グループしか選択できない
        stores?: Array<{
          //所属店舗
          store_id: Store['id'];
        }>;
        nick_name?: Account['nick_name']; // 新しいニックネーム(変更する場合のみ)
        regenerateCode?: boolean; //従業員コードを再生成する場合ここをtrue
      };
    };
    response: {
      200: {
        id: Account['id'];
        code: Account['code']; //再生成されたコード
      };
    };
  },
];
