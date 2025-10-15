import { AuthAPI } from '@/api/frontend/auth/api';
import { customFetch, METHOD } from '@/api/implement';
import { launchDef } from '@/app/api/launch/def';

export const authImplement = () => {
  return {
    launch: async (
      request: AuthAPI['launch']['request'],
    ): Promise<AuthAPI['launch']['response']> => {
      const body: (typeof launchDef.request)['body'] = {
        email: request.email,
        password: request.password,
      };
      const res = await customFetch({
        method: METHOD.POST,
        url: '/api/launch',
        body,
      })();
      return res;
    },
  };
};
