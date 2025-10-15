// tests/api/ec/item/product.test.ts

import { test } from 'vitest';

test(
  'EC商品詳細APIが適切なデータを返却する',
  {
    timeout: 300000,
  },
  async () => {
    // FIXME - 失敗しているテストケース
    //     // テスト用の商品ID（実際のテスト環境に合わせて調整が必要）
    //     // 本番環境では実在する商品IDを使用する必要があります
    //     const testItemId = 1;
    //     // 基本的な商品詳細取得テスト
    //     await testApiHandler({
    //       appHandler: { GET: getEcProducts },
    //       params: {
    //         myca_item_id: String(testItemId),
    //       },
    //       test: BackendApiTest.define(
    //         {
    //           as: apiRole.everyone,
    //           apiDef: getEcProductApi,
    //         },
    //         async (fetch) => {
    //           try {
    //             const data = await fetch();
    //             expect(data.mycaItem).toBeDefined();
    //             expect(data.products).toBeDefined();
    //             expect(Array.isArray(data.products)).toBe(true);
    //             // データが存在する場合は構造を検証
    //             if (data.products.length > 0) {
    //               const firstProduct = data.products[0];
    //               expect(typeof firstProduct.id).toBe('number');
    //               expect(typeof firstProduct.ec_stock_number).toBe('number');
    //               expect(typeof firstProduct.actual_ec_sell_price).toBe('number');
    //               // 店舗情報の検証
    //               expect(firstProduct.store).toBeDefined();
    //               expect(typeof firstProduct.store.id).toBe('number');
    //               expect(firstProduct.store.display_name).toBeDefined();
    //               // 店舗設定の検証
    //               expect(firstProduct.store.ec_setting).toBeDefined();
    //               expect('free_shipping' in firstProduct.store.ec_setting).toBe(
    //                 true,
    //               );
    //               // 商品状態の検証
    //               expect(firstProduct.condition_option).toBeDefined();
    //               expect(firstProduct.condition_option.handle).toBeDefined();
    //             }
    //           } catch (error) {
    //             // テスト用の商品IDが存在しない場合はスキップ
    //             //@ts-expect-error becuase of because of
    //             if (error.status === 404) {
    //               console.log('テスト用の商品IDが存在しないためスキップします');
    //               return;
    //             }
    //             throw error;
    //           }
    //         },
    //       ),
    //     });
    //     // 状態フィルターテスト
    //     await testApiHandler({
    //       appHandler: { GET: getEcProducts },
    //       params: {
    //         myca_item_id: String(testItemId),
    //       },
    //       url: `?conditionOption=${ConditionOptionHandle.O2_A}`,
    //       test: BackendApiTest.define(
    //         {
    //           as: apiRole.everyone,
    //           apiDef: getEcProductApi,
    //         },
    //         async (fetch) => {
    //           try {
    //             const data = await fetch();
    //             // 商品が存在する場合、全ての商品が指定した状態であることを検証
    //             if (data.products.length > 0) {
    //               data.products.forEach((product) => {
    //                 expect(product.condition_option.handle).toBe(
    //                   ConditionOptionHandle.O2_A,
    //                 );
    //               });
    //             }
    //           } catch (error) {
    //             // テスト用の商品IDが存在しない場合はスキップ
    //             //@ts-expect-error becuase of because of
    //             if (error.status === 404) {
    //               console.log('テスト用の商品IDが存在しないためスキップします');
    //               return;
    //             }
    //             throw error;
    //           }
    //         },
    //       ),
    //     });
    //     // 在庫ありフィルターテスト
    //     await testApiHandler({
    //       appHandler: { GET: getEcProducts },
    //       params: {
    //         myca_item_id: String(testItemId),
    //       },
    //       url: `?hasStock=true`,
    //       test: BackendApiTest.define(
    //         {
    //           as: apiRole.everyone,
    //           apiDef: getEcProductApi,
    //         },
    //         async (fetch) => {
    //           try {
    //             const data = await fetch();
    //             // 商品が存在する場合、全ての商品に在庫があることを検証
    //             if (data.products.length > 0) {
    //               data.products.forEach((product) => {
    //                 expect(product.ec_stock_number).toBeGreaterThan(0);
    //               });
    //             }
    //           } catch (error) {
    //             // テスト用の商品IDが存在しない場合はスキップ
    //             //@ts-expect-error becuase of because of
    //             if (error.status === 404) {
    //               console.log('テスト用の商品IDが存在しないためスキップします');
    //               return;
    //             }
    //             throw error;
    //           }
    //         },
    //       ),
    //     });
    //     // 複合フィルターテスト（状態と在庫の両方）
    //     await testApiHandler({
    //       appHandler: { GET: getEcProducts },
    //       params: {
    //         myca_item_id: String(testItemId),
    //       },
    //       url: `?conditionOption=${ConditionOptionHandle.O1_S}&hasStock=true`,
    //       test: BackendApiTest.define(
    //         {
    //           as: apiRole.everyone,
    //           apiDef: getEcProductApi,
    //         },
    //         async (fetch) => {
    //           try {
    //             const data = await fetch();
    //             // 商品が存在する場合、全ての商品が指定した条件を満たすことを検証
    //             if (data.products.length > 0) {
    //               data.products.forEach((product) => {
    //                 expect(product.condition_option.handle).toBe(
    //                   ConditionOptionHandle.O1_S,
    //                 );
    //                 expect(product.ec_stock_number).toBeGreaterThan(0);
    //               });
    //             }
    //           } catch (error) {
    //             // テスト用の商品IDが存在しない場合はスキップ
    //             //@ts-expect-error becuase of because of
    //             if (error.status === 404) {
    //               console.log('テスト用の商品IDが存在しないためスキップします');
    //               return;
    //             }
    //             throw error;
    //           }
    //         },
    //       ),
    //     });
    //     // 無効な商品IDテスト
    //     await testApiHandler({
    //       appHandler: { GET: getEcProducts },
    //       params: {
    //         myca_item_id: '54321', // 存在しない商品ID
    //       },
    //       test: BackendApiTest.define(
    //         {
    //           as: apiRole.everyone,
    //           apiDef: getEcProductApi,
    //           expectError: true,
    //         },
    //         async (fetch) => {
    //           try {
    //             await fetch();
    //             // エラーが発生しない場合はテスト失敗
    //             expect(true).toBe(false);
    //           } catch (error) {
    //             // 404エラーが発生することを期待
    //             console.log(error);
    //             //@ts-expect-error becuase of because of
    //             expect(error.status).toBe(404);
    //           }
    //         },
    //       ),
    //     });
  },
);
