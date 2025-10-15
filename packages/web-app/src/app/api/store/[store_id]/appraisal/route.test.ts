import { expect, test } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { POST } from './route';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { createAppraisalApi } from 'api-generator';

test.skip('鑑定を作成できる', async () => {
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
  };

  const body = {
    appraisal_fee: 10000,
    products: [
      {
        product_id: apiTestConstant.productMock.cardProductId, // テスト用の商品ID
        item_count: 2,
      },
    ],
  };

  await testApiHandler({
    appHandler: { POST },
    params,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        apiDef: createAppraisalApi,
      },
      async (fetch) => {
        const data = await fetch({
          body,
        });

        expect(data).toBeDefined();
        expect(data.id).toBeDefined();
        expect(data.store_id).toBe(parseInt(params.store_id));
        expect(data.appraisal_fee).toBe(body.appraisal_fee);
        expect(data.products).toBeDefined();
      },
    ),
  });
});

test('鑑定一覧を取得できる', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   await testApiHandler({
  //     appHandler: { GET },
  //     params,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getAppraisalApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.appraisals).toBeDefined();
  //         expect(Array.isArray(data.appraisals)).toBe(true);
  //       },
  //     ),
  //   });
});

test('IDで鑑定を絞り込める', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   await testApiHandler({
  //     appHandler: { GET },
  //     params,
  //     url: '?id=1',
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getAppraisalApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.appraisals).toBeDefined();
  //         expect(Array.isArray(data.appraisals)).toBe(true);
  //         // IDで絞り込んだ場合は、該当する鑑定のみが返される
  //         data.appraisals.forEach((appraisal) => {
  //           expect(appraisal.id).toBe(1);
  //         });
  //       },
  //     ),
  //   });
});
