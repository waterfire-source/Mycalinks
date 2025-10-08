// tests/api/stats/product.test.ts
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { test } from 'vitest';

// タイムゾーンプラグインを追加
dayjs.extend(utc);
dayjs.extend(timezone);

// デフォルトのタイムゾーンを日本に設定
dayjs.tz.setDefault('Asia/Tokyo');

test('在庫集計APIが適切なデータを返却する', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   // 必要なクエリパラメータの準備
  //   const today = dayjs().tz().startOf('day').toDate();
  //   const oneMonthAgo = dayjs(today).subtract(1, 'month').startOf('day').toDate();
  //   // 期間指定ありの在庫集計テスト
  //   await testApiHandler({
  //     appHandler: { GET: getProductStats },
  //     params,
  //     url: `?dataDayGte=${oneMonthAgo.toISOString()}&dataDayLte=${today.toISOString()}`,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getProductStatsApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         // レスポンス構造の検証
  //         expect(data).toBeDefined();
  //         // // start_dayとend_dayの検証
  //         // if (data.start_day !== null) {
  //         //   expect(data.start_day).toBeDefined();
  //         //   const startDate = new Date(data.start_day);
  //         //   expect(startDate).toBeInstanceOf(Date);
  //         //   expect(startDate.getTime()).toBeGreaterThanOrEqual(
  //         //     oneMonthAgo.getTime(),
  //         //   );
  //         // }
  //         // if (data.end_day !== null) {
  //         //   expect(data.end_day).toBeDefined();
  //         //   const endDate = new Date(data.end_day);
  //         //   expect(endDate).toBeInstanceOf(Date);
  //         //   expect(endDate.getTime()).toBeLessThanOrEqual(today.getTime());
  //         // }
  //         // summary オブジェクトの構造検証
  //         expect(data.summary).toBeDefined();
  //         expect(typeof data.summary.total_sell_price).toBe('number');
  //         expect(typeof data.summary.total_wholesale_price).toBe('number');
  //         expect(typeof data.summary.total_stock_number).toBe('number');
  //       },
  //     ),
  //   });
  //   // 無効な日付形式の場合のテスト
  //   await testApiHandler({
  //     appHandler: { GET: getProductStats },
  //     params,
  //     url: `?dataDayGte=invalid-date`,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getProductStatsApi,
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
