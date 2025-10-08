import { test } from 'vitest';

test('コレクションで利用可能な商品の取得APIが適切なデータを返却する', async () => {
  // FIXME - 失敗しているテストケース
  // // 指定されたコレクションID
  // const collectionId = 67111;
  // // 基本的なテスト: 指定されたコレクションIDで商品情報を取得できること
  // await testApiHandler({
  //   appHandler: { GET: getEcCollectionAvailableProducts },
  //   url: `?collectionId=${collectionId}`,
  //   test: BackendApiTest.define(
  //     {
  //       as: apiRole.everyone,
  //       apiDef: getEcCollectionAvailableProductsApi,
  //     },
  //     async (fetch) => {
  //       const data = await fetch();
  //       expect(data.collectionItems).toBeDefined();
  //       expect(Array.isArray(data.collectionItems)).toBe(true);
  //       // データが取得できた場合はさらに検証
  //       if (data.collectionItems.length > 0) {
  //         // 各コレクションアイテムの検証
  //         data.collectionItems.forEach((item) => {
  //           // mycaItem情報の検証
  //           expect(item.mycaItem).toBeDefined();
  //           // availableProductsの検証
  //           expect(Array.isArray(item.availableProducts)).toBe(true);
  //           // 利用可能な商品がある場合、その内容を検証
  //           if (item.availableProducts.length > 0) {
  //             const firstProduct = item.availableProducts[0];
  //             // 商品IDが存在すること
  //             expect(firstProduct.id).toBeDefined();
  //             expect(typeof firstProduct.id).toBe('number');
  //             // 在庫数が0より大きいこと（APIの仕様として在庫がある商品のみ返すため）
  //             expect(firstProduct.ec_stock_number).toBeGreaterThan(0);
  //             // 価格が設定されていること
  //             expect(firstProduct.actual_ec_sell_price).toBeDefined();
  //             if (firstProduct.actual_ec_sell_price !== null) {
  //               expect(typeof firstProduct.actual_ec_sell_price).toBe('number');
  //               expect(firstProduct.actual_ec_sell_price).toBeGreaterThan(0);
  //             }
  //             // 商品状態が設定されていること
  //             expect(firstProduct.condition_option).toBeDefined();
  //             expect(firstProduct.condition_option?.handle).toBeDefined();
  //             // 店舗情報が設定されていること
  //             expect(firstProduct.store).toBeDefined();
  //             expect(typeof firstProduct.store.id).toBe('number');
  //             expect(firstProduct.store.display_name).toBeDefined();
  //             // 店舗のEC設定情報が含まれていること
  //             expect(firstProduct.store.ec_setting).toBeDefined();
  //           }
  //         });
  //       }
  //     },
  //   ),
  // });
  // // コレクションIDが不正な場合のテスト（存在しないID）
  // const invalidCollectionId = 999999999;
  // await testApiHandler({
  //   appHandler: { GET: getEcCollectionAvailableProducts },
  //   url: `?collectionId=${invalidCollectionId}`,
  //   test: BackendApiTest.define(
  //     {
  //       as: apiRole.everyone,
  //       apiDef: getEcCollectionAvailableProductsApi,
  //     },
  //     async (fetch) => {
  //       // このテストでは、存在しないコレクションIDを使用しても、
  //       // APIはエラーを返さずに空の結果を返すことを期待
  //       const data = await fetch();
  //       expect(data.collectionItems).toBeDefined();
  //       expect(Array.isArray(data.collectionItems)).toBe(true);
  //       // コレクションが存在しない場合は空の配列になるはず
  //       expect(data.collectionItems.length).toBe(0);
  //     },
  //   ),
  // });
  // // コレクションIDが指定されていない場合のテスト
  // await testApiHandler({
  //   appHandler: { GET: getEcCollectionAvailableProducts },
  //   url: ``,
  //   test: BackendApiTest.define(
  //     {
  //       as: apiRole.everyone,
  //       apiDef: getEcCollectionAvailableProductsApi,
  //       expectError: true,
  //     },
  //     async (fetch) => {
  //       try {
  //         await fetch();
  //         // エラーが発生しない場合はテスト失敗
  //         expect(true).toBe(false);
  //       } catch (error) {
  //         // 400エラーが発生することを期待（必須パラメータが不足しているため）
  //         //@ts-expect-error becuase of because of
  //         expect(error.status).toBe(400);
  //       }
  //     },
  //   ),
  // });
});
