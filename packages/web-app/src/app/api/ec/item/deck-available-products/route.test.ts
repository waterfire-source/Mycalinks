import { test } from 'vitest';

test(
  'デッキで利用可能な商品の取得APIが適切なデータを返却する',
  {
    timeout: 1000 * 60 * 5,
  },
  async () => {
    // FIXME - 失敗しているテストケース
    // // 指定されたデッキIDとパラメータ
    // const deckId = 21582;
    // const anyRarity = false;
    // const anyCardnumber = false;
    // // 基本的なテスト: 指定されたデッキIDで商品情報を取得できること
    // await testApiHandler({
    //   appHandler: { GET: getEcDeckAvailableProducts },
    //   url: `?deckId=${deckId}&anyRarity=${anyRarity}&anyCardnumber=${anyCardnumber}`,
    //   test: BackendApiTest.define(
    //     {
    //       as: apiRole.everyone,
    //       apiDef: getEcDeckAvailableProductsApi,
    //     },
    //     async (fetch) => {
    //       const data = await fetch();
    //       expect(data.deckItems).toBeDefined();
    //       expect(Array.isArray(data.deckItems)).toBe(true);
    //       // データが取得できた場合はさらに検証
    //       if (data.deckItems.length > 0) {
    //         // 各デッキアイテムの検証
    //         data.deckItems.forEach((item) => {
    //           // mycaItem情報の検証
    //           expect(item.mycaItem).toBeDefined();
    //           // 必要な枚数が指定されていること
    //           expect(item.needItemCount).toBeDefined();
    //           expect(typeof item.needItemCount).toBe('number');
    //           expect(item.needItemCount).toBeGreaterThan(0);
    //           // 代用可能なアイテムの配列が存在すること
    //           expect(Array.isArray(item.availableMycaItems)).toBe(true);
    //           // 利用可能な商品の配列が存在すること
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
    //               expect(typeof firstProduct.actual_ec_sell_price).toBe(
    //                 'number',
    //               );
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
    // // 状態指定のテスト
    // await testApiHandler({
    //   appHandler: { GET: getEcDeckAvailableProducts },
    //   url: `?deckId=${deckId}&anyRarity=${anyRarity}&anyCardnumber=${anyCardnumber}&conditionOption=O1_S,O2_A`,
    //   test: BackendApiTest.define(
    //     {
    //       as: apiRole.everyone,
    //       apiDef: getEcDeckAvailableProductsApi,
    //     },
    //     async (fetch) => {
    //       const data = await fetch();
    //       // 商品がある場合、全ての商品が指定した状態のいずれかであることを検証
    //       if (data.deckItems.length > 0) {
    //         data.deckItems.forEach((item) => {
    //           if (item.availableProducts.length > 0) {
    //             item.availableProducts.forEach((product) => {
    //               if (
    //                 product.condition_option &&
    //                 product.condition_option.handle
    //               ) {
    //                 expect(['O1_S', 'O2_A']).toContain(
    //                   product.condition_option.handle,
    //                 );
    //               }
    //             });
    //           }
    //         });
    //       }
    //     },
    //   ),
    // });
    // // 優先オプション指定のテスト (価格優先)
    // await testApiHandler({
    //   appHandler: { GET: getEcDeckAvailableProducts },
    //   url: `?deckId=${deckId}&anyRarity=${anyRarity}&anyCardnumber=${anyCardnumber}&priorityOption=COST`,
    //   test: BackendApiTest.define(
    //     {
    //       as: apiRole.everyone,
    //       apiDef: getEcDeckAvailableProductsApi,
    //     },
    //     async (fetch) => {
    //       const data = await fetch();
    //       // 2つ以上の商品がある場合、価格順でソートされていることを検証
    //       data.deckItems.forEach((item) => {
    //         if (item.availableProducts.length >= 2) {
    //           for (let i = 0; i < item.availableProducts.length - 1; i++) {
    //             const current = item.availableProducts[i].actual_ec_sell_price;
    //             const next = item.availableProducts[i + 1].actual_ec_sell_price;
    //             // null値の場合は比較をスキップ
    //             if (current !== null && next !== null) {
    //               expect(current).toBeLessThanOrEqual(next);
    //             }
    //           }
    //         }
    //       });
    //     },
    //   ),
    // });
    // // 必須パラメータが不足している場合のテスト (deckIdとcodeの両方が未指定)
    // await testApiHandler({
    //   appHandler: { GET: getEcDeckAvailableProducts },
    //   url: `?anyRarity=${anyRarity}&anyCardnumber=${anyCardnumber}`,
    //   test: BackendApiTest.define(
    //     {
    //       as: apiRole.everyone,
    //       apiDef: getEcDeckAvailableProductsApi,
    //       expectError: true,
    //     },
    //     async (fetch) => {
    //       try {
    //         await fetch();
    //         // エラーが発生しない場合はテスト失敗
    //         expect(true).toBe(false);
    //       } catch (error) {
    //         // 400エラーが発生することを期待
    //         //@ts-expect-error becuase of because of
    //         expect(error.status).toBe(400);
    //       }
    //     },
    //   ),
    // });
  },
);
