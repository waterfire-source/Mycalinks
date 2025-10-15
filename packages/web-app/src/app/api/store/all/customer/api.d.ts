import { Customer, Store } from '@prisma/client';

type BackendAllCustomerAPI = [
  //すべての店の顧客取得API
  {
    path: '/api/store/all/customer/';
    method: 'GET';
    request: {
      privileges: {
        role: ['myca_user']; //mycaアプリのトークンを使わないと実行できない
        policies: []; //実行に必要なポリシー
      };
    };
    response: {
      200: Array<
        Customer & {
          store: {
            id: Store['id'];
            display_name: Store['display_name']; //このストアの名前
            receipt_logo_url: Store['receipt_logo_url'];
          };
        }
      >;
    };
  },
];

export type UpdateAllCustomerApi = {
  path: '/api/store/all/customer';
  method: 'PUT';
  request: {
    privileges: {
      role: ['bot']; //mycaアプリのトークンを使わないと実行できない
      policies: []; //実行に必要なポリシー
    };
    body: {
      myca_user_id: number;
    };
  };
  response: {
    200: {
      ok: string;
    };
  };
};
