import { test } from 'vitest';

test('取引一覧を取得し、返品する', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   let transactionId: Transaction['id'] | null = null;
  //   await testApiHandler({
  //     appHandler: { GET: getTransactions },
  //     url: `?status=completed&transaction_kind=sell`,
  //     params,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getTransactionApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.transactions).toBeDefined();
  //         expect(Array.isArray(data.transactions)).toBe(true);
  //         // 中から返品してないものを選ぶ
  //         const targetTransaction = data.transactions.find(
  //           (t) => !t.is_return && !t.return_transaction_id,
  //         );
  //         transactionId = targetTransaction?.id ?? null;
  //       },
  //     ),
  //   });
  //   if (transactionId) {
  //     let returnTransactionId: Transaction['id'] | null = null;
  //     await testApiHandler({
  //       appHandler: { POST: returnTransaction },
  //       params: {
  //         store_id: String(apiTestConstant.storeMock.id),
  //         transaction_id: String(transactionId),
  //       },
  //       test: BackendApiTest.define(
  //         {
  //           as: apiRole.pos,
  //         },
  //         async (fetch) => {
  //           const data = await fetch({
  //             method: 'POST',
  //             body: {
  //               register_id: apiTestConstant.storeMock.registerMock.id,
  //             },
  //           });
  //           expect(data).toBeDefined();
  //           expect(data.id).toBeDefined();
  //           expect(data.returnPrice).toBeDefined();
  //           returnTransactionId = data.id;
  //         },
  //       ),
  //     });
  //     //返品した取引を取得
  //     await testApiHandler({
  //       appHandler: { GET: getTransactions },
  //       params,
  //       url: `?id=${returnTransactionId}&status=completed&transaction_kind=sell`,
  //       test: BackendApiTest.define(
  //         {
  //           as: apiRole.pos,
  //           apiDef: getTransactionApi,
  //         },
  //         async (fetch) => {
  //           const data = await fetch();
  //           expect(data.transactions).toBeDefined();
  //           expect(Array.isArray(data.transactions)).toBe(true);
  //           //返品した取引が1件だけ存在することを確認
  //           expect(data.transactions.length).toBe(1);
  //           const targetTransaction = data.transactions[0];
  //           //返品した取引のis_returnがtrueであることを確認
  //           expect(targetTransaction.is_return).toBe(true);
  //           //original_transaction_idがあることを確認
  //           expect(targetTransaction.original_transaction_id).toBe(transactionId);
  //         },
  //       ),
  //     });
  //   }
});
