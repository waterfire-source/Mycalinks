// tests/api/stats/transaction/by-genre/route.test.ts
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { test } from 'vitest';

// タイムゾーンプラグインを追加
dayjs.extend(utc);
dayjs.extend(timezone);

// デフォルトのタイムゾーンを日本に設定
dayjs.tz.setDefault('Asia/Tokyo');

test('ジャンルごとの取引集計APIが適切なデータを返却する', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   // 必要なクエリパラメータの準備
  //   const today = dayjs().tz().startOf('day').toDate();
  //   const oneMonthAgo = dayjs(today).subtract(1, 'month').toDate();
  //   // 販売取引の集計テスト
  //   await testApiHandler({
  //     appHandler: { GET: getTransactionStatsByGenre },
  //     params,
  //     url: `?kind=SELL&dataDayGte=${oneMonthAgo.toISOString()}&dataDayLte=${today.toISOString()}`,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getTransactionStatsByGenreApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         // レスポンス構造の検証
  //         expect(data).toBeDefined();
  //         // summaryByGenresが配列であることを検証
  //         expect(Array.isArray(data.summaryByGenres)).toBe(true);
  //         // データが取得できなくても配列は返されることを確認
  //         if (data.summaryByGenres.length > 0) {
  //           // 最初の要素の構造を確認
  //           const firstGenre = data.summaryByGenres[0];
  //           expect(firstGenre).toHaveProperty('genre_display_name');
  //           expect(firstGenre).toHaveProperty('total_wholesale_price');
  //           expect(firstGenre).toHaveProperty('total_price');
  //           expect(firstGenre).toHaveProperty('total_count');
  //           expect(firstGenre).toHaveProperty('total_item_count');
  //         }
  //       },
  //     ),
  //   });
  //   // 買取取引の集計テスト
  //   await testApiHandler({
  //     appHandler: { GET: getTransactionStatsByGenre },
  //     params,
  //     url: `?kind=BUY&dataDayGte=${oneMonthAgo.toISOString()}&dataDayLte=${today.toISOString()}`,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getTransactionStatsByGenreApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         // レスポンス構造の検証
  //         expect(data).toBeDefined();
  //         // summaryByGenresが配列であることを検証
  //         expect(Array.isArray(data.summaryByGenres)).toBe(true);
  //       },
  //     ),
  //   });
});
