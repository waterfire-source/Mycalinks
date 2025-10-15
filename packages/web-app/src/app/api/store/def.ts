import { apiMethod, apiRole, Required } from '@/api/backendApi/main';
import { Account, Corporation, Store } from '@prisma/client';

//ストア作成API（管理用）
/**
 * @deprecated Use createStoreApi from api-generator instead
 */
export const createStoreDef = {
  method: apiMethod.POST,
  path: 'store',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    body: {
      email: Required<Account['email']>(), //店舗アカウントのメールアドレス（ログイン用）
      corporation_id: Required<Corporation['id']>(), //管理用なので、ここで結びつける法人のIDも指定できるようにする
    },
  },
  process: `
  `,
  response: <
    {
      account: Account & {
        stores: Array<{
          store: Store;
        }>;
      };
    }
  >{},
};

//ストアアクティベート
/**
 * @deprecated Use activateStoreApi from api-generator instead
 */
export const activateStore = {
  method: apiMethod.POST,
  path: 'store/activate',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    body: {
      code: Required<Store['code']>(), //店舗コード
      password: Required<string>(), //店舗アカウントの新規パスワード
    },
  },
  process: `
  `,
  response: <
    {
      store: Store;
    }
  >{},
};
