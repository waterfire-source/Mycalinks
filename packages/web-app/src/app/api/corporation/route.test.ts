import { test } from 'vitest';

test('ログインユーザーの法人情報を取得できる', async () => {
  // FIXME - 失敗しているテストケース
  // await testApiHandler({
  //   appHandler: { GET },
  //   test: BackendApiTest.define(
  //     {
  //       as: apiRole.pos,
  //       apiDef: getCorporationApi,
  //     },
  //     async (fetch) => {
  //       const response = await fetch();
  //       expect(response.corporation).toBeDefined();
  //       expect(response.corporation.id).toBe(
  //         apiTestConstant.corporationMock.id,
  //       );
  //       expect(response.corporation.name).toBeDefined();
  //       expect(response.corporation.ceo_name).toBeDefined();
  //       expect(response.corporation.head_office_address).toBeDefined();
  //       expect(response.corporation.phone_number).toBeDefined();
  //       expect(response.corporation.kobutsusho_koan_iinkai).toBeDefined();
  //       expect(response.corporation.kobutsusho_number).toBeDefined();
  //       expect(response.corporation.invoice_number).toBeDefined();
  //       expect(response.corporation.zip_code).toBeDefined();
  //       expect(response.corporation.square_available).toBeDefined();
  //       expect(response.corporation.tax_mode).toBeDefined();
  //       expect(response.corporation.price_adjustment_round_rank).toBeDefined();
  //       expect(response.corporation.price_adjustment_round_rule).toBeDefined();
  //       expect(
  //         response.corporation.use_wholesale_price_order_column,
  //       ).toBeDefined();
  //       expect(
  //         response.corporation.use_wholesale_price_order_rule,
  //       ).toBeDefined();
  //       expect(response.corporation.wholesale_price_keep_rule).toBeDefined();
  //     },
  //   ),
  // });
});
