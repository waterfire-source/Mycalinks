import { CustomError } from '@/api/implement';
import { BackendAccountAPI } from '@/app/api/account/api';
import { createAccountDef } from '@/app/api/account/def';
export interface AccountAPI {
  // 全てのアカウントを取得
  listAllAccounts: {
    response: BackendAccountAPI[0]['response']['accounts'] | CustomError;
  };
  // IDを指定してアカウント情報を取得
  getAccountById: {
    request: {
      id: string;
    };
    response: BackendAccountAPI[0]['response']['accounts'][0] | CustomError;
  };
  // staffCodeを指定してアカウント情報を取得
  getAccountByStaffCode: {
    request: {
      staffCode: number;
    };
    response: BackendAccountAPI[0]['response'] | CustomError;
  };
  createAccount: {
    request: {
      displayName: string;
      email: string;
      groupId: number;
      storeIds: number[];
      nickName?: string;
    };
    response: (typeof createAccountDef)['response'] | CustomError;
  };
  updateAccount: {
    request: {
      accountId: string;
      currentPassword: string;
      newPassword?: string;
      displayName?: string;
      email?: string;
      groupId?: number;
      nickName?: string;
      storeIds?: number[];
    };
    response: BackendAccountAPI[1]['response']['200'] | CustomError;
  };
  updateStaffCode: {
    request: {
      accountId: string;
      currentPassword: string;
      regenerateCode: boolean;
    };
    response: BackendAccountAPI[1]['response']['200'] | CustomError;
  };
  deleteAccount: {
    request: {
      accountId: string;
    };
    response: {
      ok: string;
    };
  };
}

export interface AccountApiRes {
  listAllAccounts: Exclude<
    AccountAPI['listAllAccounts']['response'],
    CustomError
  >;
  getAccountById: Exclude<
    AccountAPI['getAccountById']['response'],
    CustomError
  >;
  getAccountByStaffCode: Exclude<
    AccountAPI['getAccountByStaffCode']['response'],
    CustomError
  >;
  createAccount: Exclude<AccountAPI['createAccount']['response'], CustomError>;
  updateAccount: Exclude<AccountAPI['updateAccount']['response'], CustomError>;
  deleteAccount: Exclude<AccountAPI['deleteAccount']['response'], CustomError>;
}
