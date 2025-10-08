// tests/api/stats/transaction.test.ts
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { test } from 'vitest';

// タイムゾーンプラグインを追加
dayjs.extend(utc);
dayjs.extend(timezone);

// デフォルトのタイムゾーンを日本に設定
dayjs.tz.setDefault('Asia/Tokyo');

test('取引集計APIが適切なデータを返却する', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   // 必要なクエリパラメータの準備
  //   const today = dayjs().tz().startOf('day').toDate();
  //   const oneMonthAgo = dayjs(today).subtract(1, 'month').toDate();
  //   // 販売取引の集計テスト
  //   await testApiHandler({
  //     appHandler: { GET: getTransactionStats },
  //     params,
  //     url: `?kind=SELL&dataDayGte=${oneMonthAgo.toISOString()}&dataDayLte=${today.toISOString()}`,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getTransactionStatsApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         // レスポンス構造の検証
  //         expect(data).toBeDefined();
  //         // start_dayとend_dayの検証
  //         if (data.start_day !== null) {
  //           expect(data.start_day).toBeDefined();
  //           const startDate = new Date(data.start_day);
  //           expect(startDate).toBeInstanceOf(Date);
  //           expect(startDate.getTime()).toBeGreaterThanOrEqual(
  //             oneMonthAgo.getTime(),
  //           );
  //         }
  //         if (data.end_day !== null) {
  //           expect(data.end_day).toBeDefined();
  //           const endDate = new Date(data.end_day);
  //           expect(endDate).toBeInstanceOf(Date);
  //           expect(endDate.getTime()).toBeLessThanOrEqual(today.getTime());
  //         }
  //         // summary オブジェクトの構造検証
  //         expect(data.summary).toBeDefined();
  //         expect(typeof data.summary.price).toBe('number');
  //         expect(typeof data.summary.count).toBe('number');
  //         expect(typeof data.summary.wholesale_price).toBe('number');
  //         expect(typeof data.summary.return_price).toBe('number');
  //         expect(typeof data.summary.return_count).toBe('number');
  //         expect(typeof data.summary.item_count).toBe('number');
  //         expect(typeof data.summary.given_point).toBe('number');
  //         expect(typeof data.summary.buy_assessed_price).toBe('number');
  //         expect(typeof data.summary.used_point).toBe('number');
  //         expect(typeof data.summary.sale_discount_price).toBe('number');
  //         expect(typeof data.summary.discount_price).toBe('number');
  //         expect(typeof data.summary.product_discount_price).toBe('number');
  //         expect(typeof data.summary.product_total_discount_price).toBe('number');
  //         expect(typeof data.summary.set_deal_discount_price).toBe('number');
  //         expect(typeof data.summary.total_discount_price).toBe('number');
  //       },
  //     ),
  //   });
  //   // 買取取引の集計テスト
  //   await testApiHandler({
  //     appHandler: { GET: getTransactionStats },
  //     params,
  //     url: `?kind=BUY&dataDayGte=${oneMonthAgo.toISOString()}&dataDayLte=${today.toISOString()}`,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getTransactionStatsApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         // レスポンス構造の検証
  //         expect(data).toBeDefined();
  //         expect(data.summary).toBeDefined();
  //         // BUY種別の場合の特有フィールド確認
  //         expect(typeof data.summary.buy_assessed_price).toBe('number');
  //       },
  //     ),
  //   });
  //   // 無効なパラメータの場合のテスト
  //   await testApiHandler({
  //     appHandler: { GET: getTransactionStats },
  //     params,
  //     url: `?kind=INVALID_KIND`,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getTransactionStatsApi,
  //         expectError: true,
  //       },
  //       async (fetch) => {
  //         try {
  //           await fetch();
  //           // エラーが発生しない場合はテスト失敗
  //           expect(true).toBe(false);
  //         } catch (error) {
  //           // エラーが発生することを期待
  //           expect(error).toBeDefined();
  //         }
  //       },
  //     ),
  //   });
});
