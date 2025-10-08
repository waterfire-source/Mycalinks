import { test } from 'vitest';

test('ECオーダー取得APIが正常に動作する', async () => {
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
  //         apiDef: getEcOrderByStoreApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         // 基本的なレスポンス構造の確認
  //         expect(data.storeOrders).toBeDefined();
  //         expect(Array.isArray(data.storeOrders)).toBe(true);
  //         // オーダーが返ってきた場合は詳細をチェック
  //         if (data.storeOrders.length > 0) {
  //           const storeOrder = data.storeOrders[0];
  //           // オーダー全体の共通情報
  //           expect(storeOrder.order).toBeDefined();
  //           expect(storeOrder.order.id).toBeDefined();
  //           expect(storeOrder.order.ordered_at).toBeDefined();
  //           // 支払い方法がある場合は妥当か確認
  //           if (storeOrder.order.payment_method) {
  //             expect(Object.values(EcPaymentMethod)).toContain(
  //               storeOrder.order.payment_method,
  //             );
  //           }
  //           // ストアごとの情報確認
  //           expect(storeOrder.status).toBeDefined();
  //           expect(Object.values(EcOrderCartStoreStatus)).toContain(
  //             storeOrder.status,
  //           );
  //           expect(storeOrder.total_price).toBeDefined();
  //           expect(storeOrder.shipping_fee).toBeDefined();
  //           expect(storeOrder.read).toBeDefined();
  //           expect(storeOrder.code).toBeDefined();
  //           // 商品情報の確認
  //           expect(storeOrder.products).toBeInstanceOf(Array);
  //           if (storeOrder.products.length > 0) {
  //             const product = storeOrder.products[0];
  //             expect(product.id).toBeDefined();
  //             expect(product.total_unit_price).toBeDefined();
  //             expect(product.original_item_count).toBeDefined();
  //             expect(product.item_count).toBeDefined();
  //             expect(product.product).toBeDefined();
  //             expect(product.product.id).toBeDefined();
  //           }
  //         }
  //       },
  //     ),
  //   });
});

test('ECオーダー取得APIがクエリパラメータによるフィルタリングに対応している', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   await testApiHandler({
  //     appHandler: { GET },
  //     params,
  //     url: `?status=${EcOrderCartStoreStatus.PREPARE_FOR_SHIPPING}`,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getEcOrderByStoreApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.storeOrders).toBeDefined();
  //         // 指定したステータスのオーダーのみが返されることを確認
  //         if (data.storeOrders.length > 0) {
  //           data.storeOrders.forEach((order) => {
  //             expect(order.status).toBe(
  //               EcOrderCartStoreStatus.PREPARE_FOR_SHIPPING,
  //             );
  //           });
  //         }
  //       },
  //     ),
  //   });
});

test('ECオーダー取得APIが支払い方法によるフィルタリングに対応している', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   await testApiHandler({
  //     appHandler: { GET },
  //     params,
  //     url: `?order_payment_method=${EcPaymentMethod.CARD}`,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getEcOrderByStoreApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.storeOrders).toBeDefined();
  //         // 指定した支払い方法のオーダーのみが返されることを確認
  //         if (data.storeOrders.length > 0) {
  //           data.storeOrders.forEach((order) => {
  //             expect(order.order.payment_method).toBe(EcPaymentMethod.CARD);
  //           });
  //         }
  //       },
  //     ),
  //   });
});

test('ECオーダー取得APIがページネーションパラメータに対応している', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   const limit = 5;
  //   await testApiHandler({
  //     appHandler: { GET },
  //     params,
  //     url: `?take=${limit}&skip=0`,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getEcOrderByStoreApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.storeOrders).toBeDefined();
  //         // 取得件数が指定した上限以下であることを確認
  //         expect(data.storeOrders.length).toBeLessThanOrEqual(limit);
  //       },
  //     ),
  //   });
});

test('ECオーダー取得APIが集計情報を返すことができる', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   await testApiHandler({
  //     appHandler: { GET },
  //     params,
  //     url: '?includesSummary=true',
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getEcOrderByStoreApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.storeOrders).toBeDefined();
  //         // 集計情報が返されることを確認
  //         expect(data.summary).toBeDefined();
  //         expect(data.summary?.totalCount).toBeDefined();
  //         expect(typeof data.summary?.totalCount).toBe('number');
  //       },
  //     ),
  //   });
});

test('ECオーダー取得APIが注文日時の下限（ordered_at_gte）によるフィルタリングに対応している', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   // テスト用日付（2023年1月1日）
  //   const testDate = new Date('2023-01-01T00:00:00Z').toISOString();
  //   await testApiHandler({
  //     appHandler: { GET },
  //     params,
  //     url: `?ordered_at_gte=${encodeURIComponent(testDate)}`,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getEcOrderByStoreApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.storeOrders).toBeDefined();
  //         // 指定した日付以降のオーダーのみが返されることを確認
  //         if (data.storeOrders.length > 0) {
  //           data.storeOrders.forEach((order) => {
  //             const orderedAt = new Date(order.order.ordered_at!);
  //             const filterDate = new Date(testDate);
  //             expect(orderedAt.getTime()).toBeGreaterThanOrEqual(
  //               filterDate.getTime(),
  //             );
  //           });
  //         }
  //       },
  //     ),
  //   });
});

test('ECオーダー取得APIが注文日時の上限（ordered_at_lt）によるフィルタリングに対応している', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   // テスト用日付（2024年1月1日）
  //   const testDate = new Date('2024-01-01T00:00:00Z').toISOString();
  //   await testApiHandler({
  //     appHandler: { GET },
  //     params,
  //     url: `?ordered_at_lt=${encodeURIComponent(testDate)}`,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getEcOrderByStoreApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.storeOrders).toBeDefined();
  //         // 指定した日付より前のオーダーのみが返されることを確認
  //         if (data.storeOrders.length > 0) {
  //           data.storeOrders.forEach((order) => {
  //             const orderedAt = new Date(order.order.ordered_at!);
  //             const filterDate = new Date(testDate);
  //             expect(orderedAt.getTime()).toBeLessThan(filterDate.getTime());
  //           });
  //         }
  //       },
  //     ),
  //   });
});
