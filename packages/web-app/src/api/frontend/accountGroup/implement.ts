import { AccountGroupAPI } from '@/api/frontend/accountGroup/api';
import { CustomError, customFetch, METHOD } from '@/api/implement';
import {
  createOrUpdateAccountGroup,
  getAccountGroup,
} from '@/app/api/account/def';

export const accountGroupImplement = () => {
  return {
    // 全ての権限を取得するAPI
    listAllAccountGroups: async (): Promise<
      AccountGroupAPI['listAllAccountGroups']['response']
    > => {
      const res = await customFetch({
        method: METHOD.GET,
        url: `/api/account/group`,
      })();

      if (res instanceof CustomError) throw res;
      return res.account_groups;
    },
    getAccountGroupById: async (
      request: AccountGroupAPI['getAccountGroupById']['request'],
    ): Promise<AccountGroupAPI['getAccountGroupById']['response']> => {
      const params: (typeof getAccountGroup)['request']['query'] = {
        id: request.id,
      };
      const res = await customFetch({
        method: METHOD.GET,
        url: `/api/account/group`,
        params,
      })();
      if (res instanceof CustomError) throw res;
      return res.account_groups;
    },
    deleteAccountGroup: async (
      request: AccountGroupAPI['deleteAccountGroup']['request'],
    ): Promise<AccountGroupAPI['deleteAccountGroup']['response']> => {
      const res = await customFetch({
        method: METHOD.DELETE,
        url: `/api/account/group/${request.accountGroupId}/`,
      })();
      if (res instanceof CustomError) throw res;
      return res;
    },
    createAccountGroup: async (
      request: AccountGroupAPI['createAccountGroup']['request'],
    ): Promise<AccountGroupAPI['createAccountGroup']['response']> => {
      const body: (typeof createOrUpdateAccountGroup)['request']['body'] = {
        id: undefined,
        ...request.body,
      };

      const res = await customFetch({
        method: METHOD.POST,
        url: `/api/account/group/`,
        body,
      })();
      if (res instanceof CustomError) throw res;
      return res;
    },
    updateAccountGroup: async (
      request: AccountGroupAPI['updateAccountGroup']['request'],
    ): Promise<AccountGroupAPI['updateAccountGroup']['response']> => {
      const body: (typeof createOrUpdateAccountGroup)['request']['body'] = {
        ...request.body,
      };
      const res = await customFetch({
        method: METHOD.POST,
        url: `/api/account/group/`,
        body,
      })();
      if (res instanceof CustomError) throw res;
      return res;
    },
  };
};
