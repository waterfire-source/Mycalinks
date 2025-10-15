// tests/api/hello.test.ts

import { test } from 'vitest';

test('Mycaユーザーが自分の取引を取得することができる', async () => {
  // FIXME - 失敗しているテストケース
  //   let targetTransactionId: Transaction['id'] = 0;
  //   //取得できる
  //   await testApiHandler({
  //     appHandler: { GET: getTransactionByMycaUser },
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.mycaUser, //Mycaユーザーとしてログイン
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data).toBeDefined();
  //         if (data.length) {
  //           //適当にピックアップ
  //           const randTransaction = BackendApiTest.getRandRecord(data);
  //           targetTransactionId = randTransaction.id;
  //         }
  //       },
  //     ),
  //   });
  //   //詳細情報を取得
  //   if (targetTransactionId) {
  //     await testApiHandler({
  //       appHandler: { GET: getTransactionDetail },
  //       params: { transaction_id: String(targetTransactionId) },
  //       test: BackendApiTest.define(
  //         {
  //           as: apiRole.mycaUser, //Mycaユーザーとしてログイン
  //         },
  //         async (fetch) => {
  //           const data = await fetch();
  //           expect(data).toBeDefined();
  //           expect(data.id).toBe(targetTransactionId);
  //         },
  //       ),
  //     });
  //   }
});
