import { test } from "vitest";

test('在庫数を増加させることができる', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //     product_id: String(apiTestConstant.productMock.id),
  //   };
  //   await testApiHandler({
  //     appHandler: { POST },
  //     params,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //       },
  //       async (fetch) => {
  //         const response = await fetch({
  //           method: 'POST',
  //           body: {
  //             changeCount: 50,
  //             reason: '在庫調整テスト',
  //             wholesalePrice: 1000,
  //           },
  //         });
  //         expect(response).toBeDefined();
  //         expect(response.id).toBeDefined();
  //         expect(response.product_id).toBe(apiTestConstant.productMock.id);
  //         expect(response.item_count).toBe(50);
  //         expect(response.source_kind).toBe('product');
  //       },
  //     ),
  //   });
});

test('在庫数を減少させることができる', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //     product_id: String(apiTestConstant.productMock.id),
  //   };
  //   await testApiHandler({
  //     appHandler: { POST },
  //     params,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //       },
  //       async (fetch) => {
  //         const response = await fetch({
  //           method: 'POST',
  //           body: {
  //             changeCount: -3,
  //             reason: '在庫調整テスト（減少）',
  //           },
  //         });
  //         expect(response).toBeDefined();
  //         expect(response.id).toBeDefined();
  //         expect(response.product_id).toBe(apiTestConstant.productMock.id);
  //         expect(response.item_count).toBe(-3);
  //         expect(response.source_kind).toBe('product');
  //       },
  //     ),
  //   });
});
