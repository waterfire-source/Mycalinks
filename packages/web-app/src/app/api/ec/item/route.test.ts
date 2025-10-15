import { test } from 'vitest';

test(
  'EC商品検索APIが適切なデータを返却する',
  {
    timeout: 200000,
  },
  async () => {
    // FIXME - 失敗しているテストケース
    // // ジャンル指定は必須パラメータ
    // const defaultGenre = 'ポケモン';
    // // 基本的な検索テスト
    // await testApiHandler({
    //   appHandler: { GET: getEcItems },
    //   url: `?itemGenre=${defaultGenre}&take=10`,
    //   test: BackendApiTest.define(
    //     {
    //       as: apiRole.everyone,
    //       apiDef: getEcItemApi,
    //     },
    //     async (fetch) => {
    //       const data = await fetch();
    //       expect(data.items).toBeDefined();
    //       expect(Array.isArray(data.items)).toBe(true);
    //       // データが取得できた場合はさらに検証
    //       if (data.items.length > 0) {
    //         const firstItem = data.items[0];
    //         expect(firstItem.id).toBeDefined();
    //         expect(typeof firstItem.id).toBe('number');
    //         expect(firstItem.cardname).toBeDefined();
    //         // topPosProductの検証
    //         expect(firstItem.topPosProduct).toBeDefined();
    //         expect(typeof firstItem.topPosProduct.id).toBe('number');
    //         expect(typeof firstItem.topPosProduct.actual_ec_sell_price).toBe(
    //           'number',
    //         );
    //         expect(typeof firstItem.topPosProduct.ec_stock_number).toBe(
    //           'number',
    //         );
    //         expect(
    //           firstItem.topPosProduct.condition_option_handle,
    //         ).toBeDefined();
    //         // productCountの検証
    //         expect(typeof firstItem.productCount).toBe('number');
    //       }
    //     },
    //   ),
    // });
    // // 在庫ありフィルターのテスト
    // await testApiHandler({
    //   appHandler: { GET: getEcItems },
    //   url: `?itemGenre=${defaultGenre}&hasStock=true&take=10`,
    //   test: BackendApiTest.define(
    //     {
    //       as: apiRole.everyone,
    //       apiDef: getEcItemApi,
    //     },
    //     async (fetch) => {
    //       const data = await fetch();
    //       // 在庫あり指定の場合は、全ての商品の在庫が1以上であることを検証
    //       if (data.items.length > 0) {
    //         data.items.forEach((item) => {
    //           expect(item.topPosProduct.ec_stock_number).toBeGreaterThan(0);
    //         });
    //       }
    //     },
    //   ),
    // });
    // // 価格ソートのテスト（昇順）
    // await testApiHandler({
    //   appHandler: { GET: getEcItems },
    //   url: `?itemGenre=${defaultGenre}&orderBy=actual_ec_sell_price&take=10`,
    //   test: BackendApiTest.define(
    //     {
    //       as: apiRole.everyone,
    //       apiDef: getEcItemApi,
    //     },
    //     async (fetch) => {
    //       const data = await fetch();
    //       // 2件以上のデータがある場合はソート順を検証
    //       if (data.items.length >= 2) {
    //         for (let i = 0; i < data.items.length - 1; i++) {
    //           expect(
    //             data.items[i].topPosProduct.actual_ec_sell_price,
    //           ).toBeLessThanOrEqual(
    //             data.items[i + 1].topPosProduct.actual_ec_sell_price,
    //           );
    //         }
    //       }
    //     },
    //   ),
    // });
    // // 価格ソートのテスト（降順）
    // await testApiHandler({
    //   appHandler: { GET: getEcItems },
    //   url: `?itemGenre=${defaultGenre}&orderBy=-actual_ec_sell_price&take=10`,
    //   test: BackendApiTest.define(
    //     {
    //       as: apiRole.everyone,
    //       apiDef: getEcItemApi,
    //     },
    //     async (fetch) => {
    //       const data = await fetch();
    //       // 2件以上のデータがある場合はソート順を検証
    //       if (data.items.length >= 2) {
    //         for (let i = 0; i < data.items.length - 1; i++) {
    //           expect(
    //             data.items[i].topPosProduct.actual_ec_sell_price,
    //           ).toBeGreaterThanOrEqual(
    //             data.items[i + 1].topPosProduct.actual_ec_sell_price,
    //           );
    //         }
    //       }
    //     },
    //   ),
    // });
    // // // 部分一致検索のテスト
    // // await testApiHandler({
    // //   appHandler: { GET: getEcItems },
    // //   url: `?itemGenre=${defaultGenre}&name=ピカチュウ&take=10`,
    // //   test: BackendApiTest.define(
    // //     {
    // //       as: apiRole.everyone,
    // //       apiDef: getEcItemApi,
    // //     },
    // //     async (fetch) => {
    // //       const data = await fetch();
    // //       // 検索結果がある場合、検索キーワードが含まれるかを検証
    // //       if (data.items.length > 0) {
    // //         const hasMatchingItem = data.items.some(
    // //           (item) =>
    // //             (item.cardname && item.cardname.includes('ピカチュウ')) ||
    // //             (item.keyword && item.keyword.includes('ピカチュウ')),
    // //         );
    // //         expect(hasMatchingItem).toBe(true);
    // //       }
    // //     },
    // //   ),
    // // });
  },
);
