//起動モード取得API
import { apiMethod, apiRole, Required } from '@/api/backendApi/main';
import { PosRunMode } from '@/types/next-auth';
// import type { PosRunMode } from '@/types/next-auth';
import { Account, Corporation, Register, Store } from '@prisma/client';

/**
 * @deprecated Use launchApi from api-generator instead
 */
export const launchDef = {
  method: apiMethod.POST,
  path: 'launch',
  privileges: {
    role: [apiRole.everyone], //誰でも可能
  },
  request: {
    body: {
      email: Required<string>(), //メールアドレス
      password: Required<string>(), //パスワード
    },
  },
  process: `
  `,
  response: <
    {
      availableModes: Array<PosRunMode>; //選択できる営業モード
      account: {
        id: Account['id']; //自分のアカウントID
        code: Account['code']; //自分のコード
        linked_corporation: {
          id: Corporation['id'];
          name: Corporation['name']; //法人名
        };
        stores: Array<{
          store: {
            //自分が管理できる店舗
            id: Store['id']; //店舗ID
            display_name: Store['display_name']; //店舗名
            registers: Array<{
              id: Register['id']; //レジID
              display_name: Register['display_name']; //レジ名
            }>;
          };
        }>;
      };
    }
  >{},
  error: {
    notFound: {
      status: 404,
      messageText: 'アカウントが見つかりませんでした',
    },
    noModeAvailable: {
      status: 401,
      messageText: 'このアカウントではログインが許可されていません',
    },
    invalidCredentials: {
      status: 401,
      messageText: 'メールアドレスかパスワードが間違っています',
    },
  } as const,
};
