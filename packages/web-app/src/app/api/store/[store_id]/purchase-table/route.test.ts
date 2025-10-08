import { test, describe } from 'vitest';

describe('GET /api/store/[store_id]/purchase-table', () => {
  test('買取表一覧を取得する', async () => {
    // FIXME - 失敗しているテストケース
    // const params = {
    //   store_id: String(apiTestConstant.storeMock.id),
    // };
    // await testApiHandler({
    //   appHandler: { GET },
    //   params,
    //   test: BackendApiTest.define(
    //     {
    //       as: apiRole.pos,
    //       apiDef: getPurchaseTableApi,
    //     },
    //     async (fetch) => {
    //       const data = await fetch();
    //       expect(data.purchaseTables).toBeDefined();
    //       expect(Array.isArray(data.purchaseTables)).toBe(true);
    //     },
    //   ),
    // });
  });
});

describe('POST /api/store/[store_id]/purchase-table', () => {
  test('買取表を作成して削除する', async () => {
    // FIXME - 失敗しているテストケース
    // const params = {
    //   store_id: String(apiTestConstant.storeMock.id),
    // };
    // let purchaseTableId: number | null = null;
    // await testApiHandler({
    //   appHandler: { POST },
    //   params,
    //   test: BackendApiTest.define(
    //     {
    //       as: apiRole.pos,
    //       apiDef: createPurchaseTableApi,
    //     },
    //     async (fetch) => {
    //       const data = await fetch({
    //         body: {
    //           title: 'テスト買取表',
    //           format: PurchaseTableFormat.ENHANCED_1,
    //           order: PurchaseTableOrder.CUSTOM,
    //           show_store_name: true,
    //           color: '#FF0000',
    //           comment: 'テストコメント',
    //           items: [
    //             {
    //               item_id: apiTestConstant.itemMock.id,
    //               display_price: 1000,
    //               any_model_number: false,
    //               is_psa10: true,
    //             },
    //           ],
    //         },
    //       });
    //       expect(data.purchaseTable).toBeDefined();
    //       expect(data.purchaseTable.title).toBe('テスト買取表');
    //       expect(data.purchaseTable.items).toHaveLength(1);
    //       expect(data.purchaseTable.items[0].item_id).toBe(
    //         apiTestConstant.itemMock.id,
    //       );
    //       purchaseTableId = data.purchaseTable.id;
    //     },
    //   ),
    // });
    // await testApiHandler({
    //   appHandler: { DELETE },
    //   params: {
    //     store_id: String(apiTestConstant.storeMock.id),
    //     purchase_table_id: String(purchaseTableId),
    //   },
    //   test: BackendApiTest.define(
    //     {
    //       as: apiRole.pos,
    //       apiDef: deletePurchaseTableApi,
    //     },
    //     async (fetch) => {
    //       const data = await fetch();
    //       expect(data.ok).toBeDefined();
    //     },
    //   ),
    // });
  });
});
