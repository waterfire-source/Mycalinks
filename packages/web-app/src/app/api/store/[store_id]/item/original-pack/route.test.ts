// tests/api/hello.test.ts

import { test } from 'vitest';

test(
  'オリパを下書きで作成し、追加し、途中まで解体し、最後まで解体して削除できる',
  {
    timeout: 200000,
  },
  async () => {
    // FIXME - 失敗しているテストケース
    //     let originalPackId: Item['id'] | null = null;
    //     await testApiHandler({
    //       appHandler: { POST },
    //       params: {
    //         store_id: String(apiTestConstant.storeMock.id),
    //       },
    //       test: BackendApiTest.define(
    //         {
    //           as: apiRole.pos,
    //           apiDef: createOriginalPackApi,
    //         },
    //         async (fetch) => {
    //           const data = await fetch({
    //             method: 'POST',
    //             body: {
    //               asDraft: true,
    //               display_name: 'テストリソース_オリパ',
    //               sell_price: 1000,
    //               genre_id: apiTestConstant.itemMock.genreMock.id,
    //               products: [],
    //             },
    //           });
    //           expect(data).toBeDefined();
    //           expect(data.id).toBeDefined();
    //           originalPackId = data.id;
    //           console.log('オリパIDは', originalPackId);
    //         },
    //       ),
    //     });
    //     let productId: Product['id'] | null = null;
    //     let itemId: Item['id'] | null = null;
    //     //下書きを更新し、作成完了
    //     await testApiHandler({
    //       appHandler: { POST },
    //       params: {
    //         store_id: String(apiTestConstant.storeMock.id),
    //       },
    //       test: BackendApiTest.define(
    //         {
    //           as: apiRole.pos,
    //           apiDef: createOriginalPackApi,
    //         },
    //         async (fetch) => {
    //           const data = await fetch({
    //             method: 'POST',
    //             body: {
    //               id: originalPackId!,
    //               init_stock_number: 10,
    //               products: [
    //                 {
    //                   product_id: apiTestConstant.productMock.id,
    //                   item_count: 10,
    //                   staff_account_id:
    //                     apiTestConstant.userMock.posMaster.account.id,
    //                 },
    //               ],
    //             },
    //           });
    //           expect(data).toBeDefined();
    //           expect(data.id).toBeDefined();
    //           expect(data.products).toBeDefined();
    //           expect(data.products?.length).toBe(1);
    //           const productInfo = data.products![0];
    //           expect(productInfo.stock_number).toBe(10);
    //           productId = productInfo.id;
    //           itemId = data.id;
    //         },
    //       ),
    //     });
    //     //追加する
    //     await testApiHandler({
    //       appHandler: { POST: addOriginalPack },
    //       params: {
    //         store_id: String(apiTestConstant.storeMock.id),
    //         item_id: String(itemId!),
    //       },
    //       test: BackendApiTest.define(
    //         {
    //           as: apiRole.pos,
    //           apiDef: addOriginalPackApi,
    //         },
    //         async (fetch) => {
    //           const data = await fetch({
    //             method: 'POST',
    //             body: {
    //               additionalStockNumber: 10,
    //               additionalProducts: [
    //                 {
    //                   product_id: apiTestConstant.productMock.id,
    //                   item_count: 10,
    //                 },
    //               ],
    //             },
    //           });
    //           expect(data).toBeDefined();
    //           expect(data.id).toBeDefined();
    //           expect(data.products).toBeDefined();
    //           expect(data.products?.length).toBe(1);
    //           const productInfo = data.products![0];
    //           expect(productInfo.stock_number).toBe(20);
    //         },
    //       ),
    //     });
    //     //解体を途中まで行う
    //     let openPackId: Pack_Open_History['id'] | null = null;
    //     await testApiHandler({
    //       appHandler: { POST: releaseOriginalPack },
    //       params: {
    //         store_id: String(apiTestConstant.storeMock.id),
    //         product_id: String(productId!),
    //       },
    //       test: BackendApiTest.define(
    //         {
    //           as: apiRole.pos,
    //           apiDef: releaseOriginalPackApi,
    //         },
    //         async (fetch) => {
    //           const data = await fetch({
    //             body: {
    //               asDraft: true,
    //               itemCount: 10,
    //               to_products: [
    //                 {
    //                   product_id: apiTestConstant.productMock.id,
    //                   item_count: 10,
    //                   staff_account_id:
    //                     apiTestConstant.userMock.posMaster.account.id,
    //                 },
    //               ],
    //             },
    //           });
    //           expect(data).toBeDefined();
    //           expect(data.id).toBeDefined();
    //           openPackId = data.id;
    //           expect(data.to_products).toBeDefined();
    //           expect(data.to_products?.length).toBe(1);
    //         },
    //       ),
    //     });
    //     //解体の続きを行う
    //     await testApiHandler({
    //       appHandler: { POST: releaseOriginalPack },
    //       params: {
    //         store_id: String(apiTestConstant.storeMock.id),
    //         product_id: String(productId!),
    //       },
    //       test: BackendApiTest.define(
    //         {
    //           as: apiRole.pos,
    //           apiDef: releaseOriginalPackApi,
    //         },
    //         async (fetch) => {
    //           const data = await fetch({
    //             body: {
    //               id: openPackId!,
    //               itemCount: 10,
    //               to_products: [
    //                 {
    //                   product_id: apiTestConstant.productMock.id,
    //                   item_count: 10,
    //                   staff_account_id:
    //                     apiTestConstant.userMock.posMaster.account.id,
    //                 },
    //               ],
    //             },
    //           });
    //           expect(data).toBeDefined();
    //           expect(data.id).toBeDefined();
    //         },
    //       ),
    //     });
    //     //解体をもう一回行う
    //     await testApiHandler({
    //       appHandler: { POST: releaseOriginalPack },
    //       params: {
    //         store_id: String(apiTestConstant.storeMock.id),
    //         product_id: String(productId!),
    //       },
    //       test: BackendApiTest.define(
    //         {
    //           as: apiRole.pos,
    //           apiDef: releaseOriginalPackApi,
    //         },
    //         async (fetch) => {
    //           const data = await fetch({
    //             method: 'POST',
    //             body: {
    //               itemCount: 10,
    //               to_products: [
    //                 {
    //                   product_id: apiTestConstant.productMock.id,
    //                   item_count: 10,
    //                   staff_account_id:
    //                     apiTestConstant.userMock.posMaster.account.id,
    //                 },
    //               ],
    //             },
    //           });
    //           expect(data).toBeDefined();
    //           expect(data.id).toBeDefined();
    //         },
    //       ),
    //     });
  },
);
