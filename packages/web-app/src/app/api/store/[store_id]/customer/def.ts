import { apiMethod, apiRole, Optional, Required } from '@/api/backendApi/main';
import { Customer, Customer_Point_History, Store } from '@prisma/client';

//特定顧客ポイント変動API 手動ポイント変動として登録される
/**
 * @deprecated Use changeCustomerPointApi from api-generator instead
 */
export const changeCustomerPointDef = {
  method: apiMethod.PUT,
  path: 'store/[store_id]/customer/[customer_id]/point',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      customer_id: Required<Customer['id']>(Number),
    },
    body: {
      changeAmount: Required<number>(
        Number,
        (v) => v != 0 || '増減数は0以外を指定してください',
      ), //ポイントの変動量
    },
  },
  process: `
  `,
  response: <
    {
      pointHistory: Customer_Point_History;
    }
  >{},
};

/**
 * 顧客情報更新API
 * @deprecated Use updateCustomerApi from api-generator instead
 */
export const updateCustomerDef = {
  method: apiMethod.PUT,
  path: 'store/[store_id]/customer/[customer_id]',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: {
      store_id: Required<Store['id']>(Number),
      customer_id: Required<Customer['id']>(Number), //顧客ID
    },
    body: {
      memo: Optional<Customer['memo']>(
        String,
        (v) =>
          String(v).length < 5000 || 'メモは5000文字以内で入力してください',
      ), //顧客メモ
    },
  },
  process: `
  `,
  response: <
    {
      customer: Customer;
    }
  >{},
};
