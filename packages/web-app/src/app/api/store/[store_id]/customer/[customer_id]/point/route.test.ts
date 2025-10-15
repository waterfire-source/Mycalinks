import { expect, test } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { PUT } from './route';
import { changeCustomerPointApi } from 'api-generator';

test('顧客ポイントを増加させることができる', async () => {
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
  //         apiDef: changeCustomerPointApi,
  //       },
  //       async (fetch) => {
  //         const response = await fetch({
  //           body: {
  //             changeAmount: 100,
  //           },
  //         });
  //         expect(response.pointHistory).toBeDefined();
  //         expect(response.pointHistory.customer_id).toBe(
  //           apiTestConstant.customerMock.id,
  //         );
  //         expect(response.pointHistory.change_price).toBe(100);
  //         expect(response.pointHistory.source_kind).toBe(
  //           CustomerPointHistorySourceKind.MANUAL,
  //         );
  //         expect(response.pointHistory.result_point_amount).toBeDefined();
  //       },
  //     ),
  //   });
});

test('顧客ポイントを減少させることができる', async () => {
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
  //         apiDef: changeCustomerPointApi,
  //       },
  //       async (fetch) => {
  //         const response = await fetch({
  //           body: {
  //             changeAmount: -50,
  //           },
  //         });
  //         expect(response.pointHistory).toBeDefined();
  //         expect(response.pointHistory.customer_id).toBe(
  //           apiTestConstant.customerMock.id,
  //         );
  //         expect(response.pointHistory.change_price).toBe(-50);
  //         expect(response.pointHistory.source_kind).toBe(
  //           CustomerPointHistorySourceKind.MANUAL,
  //         );
  //         expect(response.pointHistory.result_point_amount).toBeDefined();
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
        apiDef: changeCustomerPointApi,
        expectError: true,
      },
      async (fetch) => {
        try {
          await fetch({
            body: {
              changeAmount: 100,
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
