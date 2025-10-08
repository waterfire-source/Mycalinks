import { SquareAPI } from '@/api/frontend/square/api';
import { customFetch, METHOD } from '@/api/implement';

export const squareImplement = () => {
  return {
    getSquareOAuthUrl: async (
      request: SquareAPI['getSquareOAuthUrl']['request'],
    ): Promise<SquareAPI['getSquareOAuthUrl']['response']> => {
      // これ使いたかったけどエラー吐かれるので一旦下手がき
      // const params: typeof getSquareOAuthUrlDef.request.query = {
      //   succeedCallbackUrl: request.succeedCallbackUrl,
      //   failedCallbackUrl: request.failedCallbackUrl,
      // };
      return await customFetch({
        method: METHOD.GET,
        url: 'api/square/oauth/url',
        params: {
          succeedCallbackUrl: request.succeedCallbackUrl,
          failedCallbackUrl: request.failedCallbackUrl,
        },
      })();
    },
    listSquareLocations: async (): Promise<
      SquareAPI['listSquareLocations']['response']
    > => {
      return await customFetch({
        method: METHOD.GET,
        url: 'api/square/location',
      })();
    },
    createSquareTerminalDeviceCode: async (
      request: SquareAPI['createSquareTerminalDeviceCode']['request'],
    ): Promise<SquareAPI['createSquareTerminalDeviceCode']['response']> => {
      return await customFetch({
        method: METHOD.POST,
        url: `api/store/${request.storeID}/register/${request.registerID}/square/create-device-code`,
      })();
    },
  };
};
