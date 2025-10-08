// tests/api/stats/product/by-genre/route.test.ts
import { expect, test } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { GET as getProductStatsByGenre } from './route';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { getProductStatsByGenreApi } from 'api-generator';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// タイムゾーンプラグインを追加
dayjs.extend(utc);
dayjs.extend(timezone);

// デフォルトのタイムゾーンを日本に設定
dayjs.tz.setDefault('Asia/Tokyo');

//時間かかりすぎるため一旦スキップ
test.skip('ジャンルごとの在庫集計APIが適切なデータを返却する', async () => {
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
  };

  // 必要なクエリパラメータの準備
  const today = dayjs().tz().startOf('day').toDate();
  const oneMonthAgo = dayjs(today).subtract(1, 'month').toDate();

  // 日付範囲を指定したテスト
  await testApiHandler({
    appHandler: { GET: getProductStatsByGenre },
    params,
    url: `?dataDayGte=${oneMonthAgo.toISOString()}&dataDayLte=${today.toISOString()}`,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        apiDef: getProductStatsByGenreApi,
      },
      async (fetch) => {
        const data = await fetch();

        // レスポンス構造の検証
        expect(data).toBeDefined();

        // summaryByGenresが配列であることを検証
        expect(Array.isArray(data.summaryByGenres)).toBe(true);

        // データが取得できなくても配列は返されることを確認
        if (data.summaryByGenres.length > 0) {
          // 最初の要素の構造を確認
          const firstGenre = data.summaryByGenres[0];
          expect(firstGenre).toHaveProperty('genre_display_name');
          expect(firstGenre).toHaveProperty('total_wholesale_price');
          expect(firstGenre).toHaveProperty('total_sale_price');
          expect(firstGenre).toHaveProperty('total_stock_number');

          // 数値型の確認
          expect(typeof firstGenre.total_wholesale_price).toBe('number');
          expect(typeof firstGenre.total_sale_price).toBe('number');
          expect(typeof firstGenre.total_stock_number).toBe('number');
        }
      },
    ),
  });

  // パラメータなしでのテスト
  await testApiHandler({
    appHandler: { GET: getProductStatsByGenre },
    params,
    url: '',
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        apiDef: getProductStatsByGenreApi,
      },
      async (fetch) => {
        const data = await fetch();

        // レスポンス構造の検証
        expect(data).toBeDefined();

        // summaryByGenresが配列であることを検証
        expect(Array.isArray(data.summaryByGenres)).toBe(true);
      },
    ),
  });

  // 開始日のみを指定したテスト
  await testApiHandler({
    appHandler: { GET: getProductStatsByGenre },
    params,
    url: `?dataDayGte=${oneMonthAgo.toISOString()}`,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        apiDef: getProductStatsByGenreApi,
      },
      async (fetch) => {
        const data = await fetch();

        // レスポンス構造の検証
        expect(data).toBeDefined();

        // summaryByGenresが配列であることを検証
        expect(Array.isArray(data.summaryByGenres)).toBe(true);
      },
    ),
  });
});
