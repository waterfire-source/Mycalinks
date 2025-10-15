import { AccountAPI } from '@/api/frontend/account/api';
import { CustomError, customFetch, METHOD } from '@/api/implement';
import { BackendAccountAPI } from '@/app/api/account/api';
import { createAccountDef } from '@/app/api/account/def';

export const accountImplement = () => {
  return {
    // 全てのアカウントを取得するAPI
    listAllAccounts: async (): Promise<
      AccountAPI['listAllAccounts']['response']
    > => {
      const res = await customFetch({
        method: METHOD.GET,
        url: `/api/account`,
      })();
      if (res instanceof CustomError) return res;
      return res.accounts;
    },
    // accountIDから顧客情報を取得するAPI
    getAccountById: async (
      request: AccountAPI['getAccountById']['request'],
    ): Promise<AccountAPI['getAccountById']['response']> => {
      const params: BackendAccountAPI[0]['request']['query'] = {
        id: request.id,
      };
      const res = await customFetch({
        method: METHOD.GET,
        url: `/api/account`,
        params,
      })();
      if (res instanceof CustomError) return res;
      return res.accounts[0];
    },
    // staffCodeからアカウント情報を取得するAPI
    getAccountByStaffCode: async (
      request: AccountAPI['getAccountByStaffCode']['request'],
    ): Promise<AccountAPI['getAccountByStaffCode']['response']> => {
      const params: BackendAccountAPI[0]['request']['query'] = {
        staff_code: request.staffCode,
      };
      const res = await customFetch({
        method: METHOD.GET,
        url: `/api/account`,
        params,
      })();
      return res;
    },
    // アカウント情報作成API
    createAccount: async (
      request: AccountAPI['createAccount']['request'],
    ): Promise<AccountAPI['createAccount']['response']> => {
      const body: (typeof createAccountDef)['request']['body'] = {
        display_name: request.displayName,
        email: request.email,
        group_id: request.groupId,
        stores: request.storeIds.map((storeId) => ({ store_id: storeId })),
        nick_name: request.nickName,
      };
      const res = await customFetch({
        method: METHOD.POST,
        url: `/api/account`,
        body,
      })();

      return res;
    },
    // アカウント情報更新API
    updateAccount: async (
      request: AccountAPI['updateAccount']['request'],
    ): Promise<AccountAPI['updateAccount']['response']> => {
      const body: BackendAccountAPI[1]['request']['body'] = {
        current_password: request.currentPassword,
        display_name: request.displayName,
        email: request.email,
        group_id: request.groupId,
        new_password: request.newPassword,
        nick_name: request.nickName,
        stores: request.storeIds ? request.storeIds.map((storeId) => ({ store_id: storeId })) : undefined,
      };
      const res = await customFetch({
        method: METHOD.PUT,
        url: `/api/account/${request.accountId}`,
        body,
      })();
      return res;
    },
    // 従業員番号再発行API
    updateStaffCode: async (
      request: AccountAPI['updateStaffCode']['request'],
    ): Promise<AccountAPI['updateStaffCode']['response']> => {
      const body: BackendAccountAPI[1]['request']['body'] = {
        current_password: request.currentPassword,
        regenerateCode: request.regenerateCode,
      };
      const res = await customFetch({
        method: METHOD.PUT,
        url: `/api/account/${request.accountId}`,
        body,
      })();
      return res;
    },
    // アカウント削除API
    deleteAccount: async (
      request: AccountAPI['deleteAccount']['request'],
    ): Promise<AccountAPI['deleteAccount']['response']> => {
      const res = await customFetch({
        method: METHOD.DELETE,
        url: `/api/account/${request.accountId}`,
      })();
      return res;
    },
  };
};
