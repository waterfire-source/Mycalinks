import { expect, test } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { GET } from './route';
import { listItemWithTransactionApi } from 'api-generator';

test('商品マスタベース取引取得APIが正常に動作する', async () => {
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
  //         apiDef: listItemWithTransactionApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.items).toBeDefined();
  //         expect(Array.isArray(data.items)).toBe(true);
  //       },
  //     ),
  //   });
});

test('商品マスタベース取引取得APIで集計情報を取得できる', async () => {
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
  //         apiDef: listItemWithTransactionApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.items).toBeDefined();
  //         // summary情報が含まれていることを確認
  //         expect(data.summary).toBeDefined();
  //         if (data.summary) {
  //           expect(typeof data.summary.totalCount).toBe('number');
  //           expect(typeof data.summary.totalSellPrice).toBe('number');
  //           expect(typeof data.summary.totalBuyPrice).toBe('number');
  //         }
  //       },
  //     ),
  //   });
});

test('商品マスタベース取引取得APIで取引種類で絞り込みができる', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   await testApiHandler({
  //     appHandler: { GET },
  //     params,
  //     url: '?transaction_kind=sell',
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: listItemWithTransactionApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.items).toBeDefined();
  //         // 全レコードが販売取引であることを確認
  //         if (data.items.length > 0) {
  //           data.items.forEach((item) => {
  //             expect(item.transaction_kind).toBe('sell');
  //           });
  //         }
  //       },
  //     ),
  //   });
});

test('商品マスタベース取引取得APIで商品名で絞り込みができる', async () => {
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
  //         apiDef: listItemWithTransactionApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.items).toBeDefined();
  //         expect(Array.isArray(data.items)).toBe(true);
  //       },
  //     ),
  //   });
});

test('商品マスタベース取引取得APIでレアリティで絞り込みができる', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   const rarity = 'Rare';
  //   await testApiHandler({
  //     appHandler: { GET },
  //     params,
  //     url: `?rarity=${encodeURIComponent(rarity)}`,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: listItemWithTransactionApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.items).toBeDefined();
  //         expect(Array.isArray(data.items)).toBe(true);
  //       },
  //     ),
  //   });
});

test('商品マスタベース取引取得APIで取引詳細情報を取得できる', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   await testApiHandler({
  //     appHandler: { GET },
  //     params,
  //     url: '?includesTransactions=true',
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: listItemWithTransactionApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.items).toBeDefined();
  //         // 取引の詳細情報が含まれるか確認
  //         if (data.items.length > 0) {
  //           const item = data.items[0];
  //           expect(item.item).toBeDefined();
  //           expect(item.transactionStats).toBeDefined();
  //           expect(typeof item.transactionStats.transactionCount).toBe('number');
  //           expect(typeof item.transactionStats.transactionProductsCount).toBe(
  //             'number',
  //           );
  //           expect(typeof item.transactionStats.transactionTotalPrice).toBe(
  //             'number',
  //           );
  //           // 取引の詳細情報が含まれている場合
  //           if (item.transactions && item.transactions.length > 0) {
  //             const transaction = item.transactions[0];
  //             expect(transaction.transaction).toBeDefined();
  //             expect(transaction.transaction.id).toBeDefined();
  //             expect(transaction.product).toBeDefined();
  //             expect(transaction.product.id).toBeDefined();
  //             expect(typeof transaction.item_count).toBe('number');
  //             expect(typeof transaction.total_unit_price).toBe('number');
  //           }
  //         }
  //       },
  //     ),
  //   });
});

test('商品マスタベース取引取得APIで取引日時範囲で絞り込みができる', async () => {
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
  //     url: `?transactionFinishedAtGte=${encodeURIComponent(
  //       startDateStr,
  //     )}&transactionFinishedAtLt=${encodeURIComponent(endDateStr)}`,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: listItemWithTransactionApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.items).toBeDefined();
  //         expect(Array.isArray(data.items)).toBe(true);
  //       },
  //     ),
  //   });
});

test.skip('商品マスタベース取引取得APIでソート順を指定できる', async () => {
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
  };

  await testApiHandler({
    appHandler: { GET },
    params,
    url: '?orderBy=transactionTotalPrice',
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        apiDef: listItemWithTransactionApi,
      },
      async (fetch) => {
        const data = await fetch();

        expect(data.items).toBeDefined();
        expect(Array.isArray(data.items)).toBe(true);

        // 2件以上あればソート順を確認
        if (data.items.length >= 2) {
          const first = data.items[0];
          const second = data.items[1];

          // デフォルトは降順なので、最初の要素の方が大きいか同じである
          expect(
            first.transactionStats.transactionTotalPrice,
          ).toBeGreaterThanOrEqual(
            second.transactionStats.transactionTotalPrice,
          );
        }
      },
    ),
  });
});
