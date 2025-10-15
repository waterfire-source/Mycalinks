import { test } from 'vitest';
import { apiTestConstant } from '@/api/backendApi/test/constant';

//[TODO] 後で整備する

test.skip('鑑定結果を入力できる', async () => {
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
    appraisal_id: String(8), // テスト用の鑑定ID
  };

  const body = {
    products: [
      {
        id: 9, // Appraisal_Product ID
        appraisal_option_id: 3, // 鑑定結果（タグ）ID
        appraisal_number: 'TEST001', // 鑑定番号
        sell_price: 50000, // 販売価格
        condition_option_id:
          apiTestConstant.itemMock.categoryMock.conditionOptionMock.id, // 状態の選択肢ID
      },
      {
        id: 10, // Appraisal_Product ID
        appraisal_option_id: null, // 鑑定結果（タグ）ID
        sell_price: 300, // 販売価格
        condition_option_id: 417, // 状態の選択肢ID
        to_product_id: 2339570, // 鑑定在庫として登録しない時、戻すときの在庫ID
      },
    ],
  };

  // await testApiHandler({
  //   appHandler: { POST },
  //   params,
  //   test: BackendApiTest.define(
  //     {
  //       as: apiRole.pos,
  //       apiDef: inputAppraisalResultApi,
  //     },
  //     async (fetch) => {
  //       const data = await fetch({
  //         body,
  //       });

  //       expect(data).toBeDefined();
  //       expect(data.finished).toBe(true);
  //       expect(data.products).toBeDefined();
  //       expect(Array.isArray(data.products)).toBe(true);
  //     },
  //   ),
  // });
});
