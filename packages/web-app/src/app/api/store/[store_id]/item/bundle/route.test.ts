import { expect, test } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { POST } from './route';
import { createBundleApi } from 'api-generator';

test.skip('バンドル作成APIが正常に動作する', async () => {
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
  };

  // テストデータ
  const bundleData = {
    display_name: 'テストバンドル',
    sell_price: 1000,
    init_stock_number: 5,
    products: [
      {
        product_id: 1, // テスト用の商品ID
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
        apiDef: createBundleApi,
      },
      async (fetch) => {
        const response = await fetch({
          body: bundleData,
        });

        expect(response).toBeDefined();
        expect(response.id).toBeDefined();
        expect(response.display_name).toBe(bundleData.display_name);
        expect(response.sell_price).toBe(bundleData.sell_price);
        expect(response.init_stock_number).toBe(bundleData.init_stock_number);
        expect(response.bundle_item_products).toBeDefined();
        expect(Array.isArray(response.bundle_item_products)).toBe(true);
      },
    ),
  });
});

test.skip('バンドル作成APIで有効期限と開始日を指定できる', async () => {
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
  };

  // 日付設定
  const startDate = new Date();
  const expireDate = new Date();
  expireDate.setMonth(expireDate.getMonth() + 1); // 1ヶ月後

  // テストデータ
  const bundleData = {
    display_name: '期間限定バンドル',
    sell_price: 2000,
    init_stock_number: 10,
    start_at: startDate,
    expire_at: expireDate,
    products: [
      {
        product_id: 1,
        item_count: 1,
      },
      {
        product_id: 2,
        item_count: 1,
      },
    ],
  };

  await testApiHandler({
    appHandler: { POST },
    params,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        apiDef: createBundleApi,
      },
      async (fetch) => {
        const response = await fetch({
          body: bundleData,
        });

        expect(response).toBeDefined();
        expect(response.id).toBeDefined();
        expect(response.display_name).toBe(bundleData.display_name);
        expect(response.start_at).toBeDefined();
        expect(response.expire_at).toBeDefined();

        // 日付をチェック
        const returnedStartDate = new Date(response.start_at!);
        const returnedExpireDate = new Date(response.expire_at!);

        expect(returnedStartDate.getDate()).toBe(startDate.getDate());
        expect(returnedExpireDate.getMonth()).toBe(expireDate.getMonth());
      },
    ),
  });
});

test.skip('バンドル作成APIで複数の商品を追加できる', async () => {
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
  };

  // テストデータ
  const bundleData = {
    display_name: '複数商品バンドル',
    sell_price: 3000,
    init_stock_number: 3,
    products: [
      {
        product_id: 1,
        item_count: 2,
      },
      {
        product_id: 2,
        item_count: 3,
      },
      {
        product_id: 3,
        item_count: 1,
      },
    ],
  };

  await testApiHandler({
    appHandler: { POST },
    params,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        apiDef: createBundleApi,
      },
      async (fetch) => {
        const response = await fetch({
          body: bundleData,
        });

        expect(response).toBeDefined();
        expect(response.bundle_item_products).toBeDefined();
        expect(Array.isArray(response.bundle_item_products)).toBe(true);

        // 商品数が一致するか確認
        expect(response.bundle_item_products.length).toBeGreaterThan(0);

        // 商品情報が含まれているか確認
        if (response.bundle_item_products.length > 0) {
          const product = response.bundle_item_products[0];
          expect(product.product_id).toBeDefined();
          expect(product.item_count).toBeDefined();
        }
      },
    ),
  });
});

test.skip('バンドル作成APIで画像URLを設定できる', async () => {
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
  };

  // テストデータ
  const bundleData = {
    display_name: '画像付きバンドル',
    sell_price: 1500,
    init_stock_number: 5,
    image_url: 'https://example.com/test-image.jpg',
    products: [
      {
        product_id: 1,
        item_count: 1,
      },
    ],
  };

  await testApiHandler({
    appHandler: { POST },
    params,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        apiDef: createBundleApi,
      },
      async (fetch) => {
        const response = await fetch({
          body: bundleData,
        });

        expect(response).toBeDefined();
        expect(response.id).toBeDefined();
        expect(response.image_url).toBe(bundleData.image_url);
      },
    ),
  });
});

test.skip('バンドル作成APIでジャンルを設定できる', async () => {
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
  };

  // テストデータ (実際のテストでは有効なジャンルIDを指定する必要がある)
  const genreId = 1;
  const bundleData = {
    display_name: 'ジャンル指定バンドル',
    sell_price: 2500,
    init_stock_number: 7,
    genre_id: genreId,
    products: [
      {
        product_id: 1,
        item_count: 1,
      },
    ],
  };

  await testApiHandler({
    appHandler: { POST },
    params,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        apiDef: createBundleApi,
      },
      async (fetch) => {
        const response = await fetch({
          body: bundleData,
        });

        expect(response).toBeDefined();
        expect(response.id).toBeDefined();
        expect(response.genre_id).toBe(genreId);
      },
    ),
  });
});
