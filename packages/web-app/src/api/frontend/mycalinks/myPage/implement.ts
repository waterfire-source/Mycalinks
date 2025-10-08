import { MyPageCustomerAPI } from '@/api/frontend/mycalinks/myPage/api';
import { METHOD, CustomError, appCustomFetch } from '@/api/implement';

export const myPageCustomerImplement = () => {
  return {
    //すべての店の顧客取得API
    getAllCustomer: async (): Promise<
      MyPageCustomerAPI['getAll']['response']
    > => {
      const res = await appCustomFetch({
        method: METHOD.GET,
        url: `/api/store/all/customer/`,
      });
      if (res instanceof CustomError) throw res;
      return res;
    },
    // //会員QRコードを取得する
    getQr: async (
      request: MyPageCustomerAPI['getQr']['request'],
    ): Promise<MyPageCustomerAPI['getQr']['response']> => {
      const res = await appCustomFetch(
        {
          method: METHOD.GET,
          url: `/user/account/qr/`,
          params: {
            user: request.userId,
          },
        },
        'MYCA_APP_API',
      );
      if (res instanceof CustomError) throw res;
      return res;
    },
  };
};
