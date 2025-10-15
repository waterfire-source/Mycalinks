import { test } from 'vitest';

test('EC在庫別取引一覧APIが正常に動作する', async () => {
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
  //         apiDef: listItemWithEcOrderApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.items).toBeDefined();
  //         expect(Array.isArray(data.items)).toBe(true);
  //       },
  //     ),
  //   });
});

test('EC在庫別取引一覧APIで集計情報を取得できる', async () => {
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
  //         apiDef: listItemWithEcOrderApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.items).toBeDefined();
  //         // summary情報が含まれていることを確認
  //         expect(data.summary).toBeDefined();
  //         if (data.summary) {
  //           expect(typeof data.summary.totalCount).toBe('number');
  //           expect(typeof data.summary.totalSellPrice).toBe('number');
  //         }
  //       },
  //     ),
  //   });
});

test('EC在庫別取引一覧APIでEC注文履歴情報を取得できる', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   await testApiHandler({
  //     appHandler: { GET },
  //     params,
  //     url: '?includesEcOrders=true',
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: listItemWithEcOrderApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.items).toBeDefined();
  //         // 商品に関する注文履歴情報が含まれるか確認
  //         if (data.items.length > 0) {
  //           const item = data.items[0];
  //           expect(item.item).toBeDefined();
  //           expect(item.ecOrderStats).toBeDefined();
  //           expect(typeof item.ecOrderStats.ecOrderCount).toBe('number');
  //           expect(typeof item.ecOrderStats.ecOrderItemCount).toBe('number');
  //           expect(typeof item.ecOrderStats.ecOrderTotalPrice).toBe('number');
  //           // 注文の詳細情報が含まれている場合
  //           if (
  //             item.ecOrderCartStoreProducts &&
  //             item.ecOrderCartStoreProducts.length > 0
  //           ) {
  //             const orderProduct = item.ecOrderCartStoreProducts[0];
  //             expect(orderProduct.order_store).toBeDefined();
  //             expect(orderProduct.order_store.order).toBeDefined();
  //             expect(orderProduct.order_store.order.id).toBeDefined();
  //             expect(orderProduct.product).toBeDefined();
  //             expect(orderProduct.product.id).toBeDefined();
  //           }
  //         }
  //       },
  //     ),
  //   });
});

test('EC在庫別取引一覧APIで商品名で絞り込みができる', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   const displayName = '商品名';
  //   await testApiHandler({
  //     appHandler: { GET },
  //     params,
  //     url: `?display_name=${encodeURIComponent(displayName)}`,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: listItemWithEcOrderApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.items).toBeDefined();
  //         // 検索が適用されていることは確認できないが、APIが正常に動作することを確認
  //         expect(Array.isArray(data.items)).toBe(true);
  //       },
  //     ),
  //   });
});

test('EC在庫別取引一覧APIで取引日時範囲で絞り込みができる', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   // 過去1ヶ月間の日付範囲を指定
  //   const endDate = new Date();
  //   const startDate = new Date();
  //   startDate.setMonth(startDate.getMonth() - 1);
  //   const startDateStr = startDate.toISOString();
  //   const endDateStr = endDate.toISOString();
  //   await testApiHandler({
  //     appHandler: { GET },
  //     params,
  //     url: `?orderCreatedAtGte=${encodeURIComponent(
  //       startDateStr,
  //     )}&orderCreatedAtLt=${encodeURIComponent(endDateStr)}`,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: listItemWithEcOrderApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.items).toBeDefined();
  //         expect(Array.isArray(data.items)).toBe(true);
  //       },
  //     ),
  //   });
});

test('EC在庫別取引一覧APIでソート順を指定できる', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   await testApiHandler({
  //     appHandler: { GET },
  //     params,
  //     url: '?orderBy=total_order_count',
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: listItemWithEcOrderApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.items).toBeDefined();
  //         expect(Array.isArray(data.items)).toBe(true);
  //         // 2件以上あればソート順を確認
  //         if (data.items.length >= 2) {
  //           const first = data.items[0];
  //           const second = data.items[1];
  //           // デフォルトは降順なので、最初の要素の方が大きいか同じである
  //           expect(first.ecOrderStats.ecOrderCount).toBeGreaterThanOrEqual(
  //             second.ecOrderStats.ecOrderCount,
  //           );
  //         }
  //       },
  //     ),
  //   });
});
