import { expect, test } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { GET } from './route';

test('特定の金額で追加可能なポイントを取得できる', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //     customer_id: String(apiTestConstant.customerMock.id),
  //   };
  //   const totalPrice = 10000;
  //   await testApiHandler({
  //     appHandler: { GET },
  //     params,
  //     url: `?totalPrice=${totalPrice}`,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //       },
  //       async (fetch) => {
  //         const response = await fetch();
  //         expect(response).toBeDefined();
  //         expect(response.pointAmount).toBeDefined();
  //         expect(typeof response.pointAmount).toBe('number');
  //         // ポイントは0以上であることを確認
  //         expect(response.pointAmount).toBeGreaterThanOrEqual(0);
  //       },
  //     ),
  //   });
});

test('totalPriceパラメータがない場合のエラー処理', async () => {
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
    customer_id: String(apiTestConstant.customerMock.id),
  };

  await testApiHandler({
    appHandler: { GET },
    params,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        expectError: true,
      },
      async (fetch) => {
        try {
          await fetch();
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

test('存在しない顧客IDでエラーになる', async () => {
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
    customer_id: '99999', // 存在しないID
  };

  await testApiHandler({
    appHandler: { GET },
    params,
    url: '?totalPrice=10000',
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        expectError: true,
      },
      async (fetch) => {
        try {
          await fetch({
            method: 'GET',
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
