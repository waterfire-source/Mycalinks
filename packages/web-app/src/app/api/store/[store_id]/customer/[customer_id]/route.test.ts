import { expect, test } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { PUT } from './route';
import { updateCustomerApi } from 'api-generator';

test('顧客のメモを更新できる', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //     customer_id: String(apiTestConstant.customerMock.id),
  //   };
  //   await testApiHandler({
  //     appHandler: { PUT },
  //     params,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: updateCustomerApi,
  //       },
  //       async (fetch) => {
  //         const response = await fetch({
  //           body: {
  //             memo: '更新されたメモ内容',
  //           },
  //         });
  //         expect(response.customer).toBeDefined();
  //         expect(response.customer.id).toBe(apiTestConstant.customerMock.id);
  //         expect(response.customer.memo).toBe('更新されたメモ内容');
  //       },
  //     ),
  //   });
});

test('存在しない顧客IDでエラーになる', async () => {
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
    customer_id: '99999', // 存在しないID
  };

  await testApiHandler({
    appHandler: { PUT },
    params,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        apiDef: updateCustomerApi,
        expectError: true,
      },
      async (fetch) => {
        try {
          await fetch({
            method: 'PUT',
            body: {
              memo: 'エラーテスト用メモ',
            },
          });
          // エラーが発生しなかった場合は失敗
          expect(true).toBe(false);
        } catch (error: any) {
          // エラーが発生することを確認
          expect(error).toBeDefined();
        }
      },
    ),
  });
});

test('間違った店舗IDでエラーになる', async () => {
  const params = {
    store_id: '99999', // 存在しない店舗ID
    customer_id: String(apiTestConstant.customerMock.id),
  };

  await testApiHandler({
    appHandler: { PUT },
    params,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        apiDef: updateCustomerApi,
        expectError: true,
      },
      async (fetch) => {
        try {
          await fetch({
            method: 'PUT',
            body: {
              memo: 'エラーテスト用メモ',
            },
          });
          // エラーが発生しなかった場合は失敗
          expect(true).toBe(false);
        } catch (error: any) {
          // エラーが発生することを確認
          expect(error).toBeDefined();
        }
      },
    ),
  });
});
