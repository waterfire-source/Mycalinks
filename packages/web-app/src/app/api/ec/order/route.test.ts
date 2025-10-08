import { expect, test } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { GET, POST } from './route';
import { createOrUpdateEcOrderApi, getEcOrderApi } from 'api-generator';
import { EcOrderStatus, EcPaymentMethod } from '@prisma/client';

test.skip('ECオーダー作成APIが正常に動作する', async () => {
  await testApiHandler({
    url: '?includesShippingMethodCandidates=true',
    appHandler: { POST },
    test: BackendApiTest.define(
      {
        as: apiRole.everyone,
        apiDef: createOrUpdateEcOrderApi,
      },
      async (fetch) => {
        const data = await fetch({
          body: {
            shipping_address_prefecture: '東京都',
            cart_stores: [
              {
                store_id: 1,
                products: [
                  {
                    product_id: 1,
                    original_item_count: 1,
                  },
                ],
              },
            ],
          },
        });

        // 基本的なレスポンス形式の確認
        expect(data.id).toBeDefined();
        expect(data.code).toBeDefined();
        expect(data.shipping_address_prefecture).toBe('東京都');
        expect(data.cart_stores).toBeInstanceOf(Array);

        // カートストアの構造確認
        if (data.cart_stores.length > 0) {
          const cartStore = data.cart_stores[0];
          expect(cartStore.store_id).toBeDefined();
          expect(cartStore.total_price).toBeDefined();
          expect(cartStore.shipping_fee).toBeDefined();
          expect(cartStore.products).toBeInstanceOf(Array);

          // 配送方法候補が含まれているか確認
          expect(cartStore.shippingMethodCandidates).toBeDefined();
          if (
            cartStore.shippingMethodCandidates &&
            cartStore.shippingMethodCandidates.length > 0
          ) {
            const method = cartStore.shippingMethodCandidates[0];
            expect(method.id).toBeDefined();
            expect(method.display_name).toBeDefined();
            expect(method.fee).toBeDefined();
          }
        }
      },
    ),
  });
});

test.skip('ECオーダー取得APIが正常に動作する', async () => {
  await testApiHandler({
    appHandler: { GET },
    url: '?code=test-order-code', // テスト用のオーダーコード
    test: BackendApiTest.define(
      {
        as: apiRole.everyone,
        apiDef: getEcOrderApi,
      },
      async (fetch) => {
        const data = await fetch();

        // 基本的なレスポンス構造の確認
        expect(data.orders).toBeDefined();
        expect(Array.isArray(data.orders)).toBe(true);

        // オーダーが返ってきた場合は詳細をチェック
        if (data.orders.length > 0) {
          const order = data.orders[0];
          expect(order.id).toBeDefined();
          expect(order.code).toBeDefined();
          expect(order.status).toBeDefined();
          expect(Object.values(EcOrderStatus)).toContain(order.status);

          // 支払い方法がある場合は妥当か確認
          if (order.payment_method) {
            expect(Object.values(EcPaymentMethod)).toContain(
              order.payment_method,
            );
          }

          // カートストアの確認
          expect(order.cart_stores).toBeInstanceOf(Array);
          if (order.cart_stores.length > 0) {
            const cartStore = order.cart_stores[0];
            expect(cartStore.store_id).toBeDefined();
            expect(cartStore.total_price).toBeDefined();
            expect(cartStore.shipping_fee).toBeDefined();
            expect(cartStore.status).toBeDefined();
            expect(cartStore.code).toBeDefined();

            // 商品情報の確認
            expect(cartStore.products).toBeInstanceOf(Array);
            if (cartStore.products.length > 0) {
              const product = cartStore.products[0];
              expect(product.product_id).toBeDefined();
              expect(product.total_unit_price).toBeDefined();
              expect(product.original_item_count).toBeDefined();
              expect(product.product).toBeDefined();
            }
          }
        }
      },
    ),
  });
});

test.skip('ECオーダー検索APIが特定条件で動作する', async () => {
  await testApiHandler({
    appHandler: { GET },
    url: `?status=${EcOrderStatus.COMPLETED}`,
    test: BackendApiTest.define(
      {
        as: apiRole.mycaUser,
        apiDef: getEcOrderApi,
      },
      async (fetch) => {
        const data = await fetch();
        expect(data.orders).toBeDefined();

        // 指定したステータスのオーダーのみが返されることを確認
        if (data.orders.length > 0) {
          data.orders.forEach((order) => {
            expect(order.status).toBe(EcOrderStatus.COMPLETED);
          });
        }
      },
    ),
  });
});

test.skip('ECオーダー更新APIが配送方法を指定して動作する', async () => {
  // テスト用のオーダーコードを事前に生成しておく必要がある
  const testOrderCode = 'test-order-code';

  await testApiHandler({
    appHandler: { POST },
    url: '?includesPaymentMethodCandidates=true',
    test: BackendApiTest.define(
      {
        as: apiRole.mycaUser,
        apiDef: createOrUpdateEcOrderApi,
      },
      async (fetch) => {
        const data = await fetch({
          body: {
            code: testOrderCode,
            shipping_address_prefecture: '東京都',
            cart_stores: [
              {
                store_id: 1,
                shipping_method_id: 1, // 配送方法を指定
                products: [
                  {
                    product_id: 1,
                    original_item_count: 1,
                  },
                ],
              },
            ],
          },
        });

        // 支払方法候補が返ってくることを確認
        expect(data.paymentMethodCandidates).toBeDefined();
        if (
          data.paymentMethodCandidates &&
          data.paymentMethodCandidates.length > 0
        ) {
          data.paymentMethodCandidates.forEach((method) => {
            expect(Object.values(EcPaymentMethod)).toContain(method);
          });
        }

        // カートストアに配送方法が設定されていることを確認
        if (data.cart_stores.length > 0) {
          expect(data.cart_stores[0].shipping_method_id).toBe(1);
        }
      },
    ),
  });
});
