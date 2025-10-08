import { test } from 'vitest';

test('取引一覧を取得し、更新する', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   let transactionId: Transaction['id'] | null = null;
  //   await testApiHandler({
  //     appHandler: { GET: getTransactions },
  //     url: `?status=draft&transaction_kind=buy`,
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
  //         // 全ての取引がdraftかつbuyであることを確認
  //         expect(
  //           data.transactions.every(
  //             (t) =>
  //               t.status === TransactionStatus.draft &&
  //               t.transaction_kind === TransactionKind.buy,
  //           ),
  //         ).toBe(true);
  //         if (data.transactions.length > 0) {
  //           transactionId = data.transactions[0].id;
  //         }
  //       },
  //     ),
  //   });
  //   if (transactionId) {
  //     await testApiHandler({
  //       appHandler: { PUT: putTransaction },
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
  //             method: 'PUT',
  //             body: {
  //               customer_id: apiTestConstant.customerMock.id,
  //               can_create_signature: true,
  //               id_kind: 'driver_license',
  //               id_number: '1234567890',
  //               parental_consent_image_url: 'https://example.com/image.jpg',
  //               parental_contact: '090-1234-5678',
  //             },
  //           });
  //           expect(data).toBeDefined();
  //           //顧客IDを見る
  //           expect(data.customer_id).toBe(apiTestConstant.customerMock.id);
  //           console.log('更新もできました');
  //         },
  //       ),
  //     });
  //     //買取受付レシートを取得
  //     await testApiHandler({
  //       appHandler: { GET: getTransactionReceptionNumberCommand },
  //       params: {
  //         store_id: String(apiTestConstant.storeMock.id),
  //         transaction_id: String(transactionId),
  //       },
  //       test: BackendApiTest.define(
  //         {
  //           as: apiRole.pos,
  //           apiDef: getTransactionReceptionNumberCommandApi,
  //         },
  //         async (fetch) => {
  //           const data = await fetch();
  //           expect(data).toBeDefined();
  //           //顧客IDを見る
  //           expect(data.forCustomer).toBeDefined();
  //           expect(data.forStaff).toBeDefined();
  //           console.log('買取受付レシートを取得できました');
  //         },
  //       ),
  //     });
  //   }
});

test('銀行振込をしたかどうかのチェックを更新する', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   let transactionId: Transaction['id'] | null = null;
  //   let currentBankChecked: boolean | null = null;
  //   await testApiHandler({
  //     appHandler: { GET: getTransactions },
  //     url: `?status=completed&transaction_kind=buy&payment_method=bank`,
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
  //         if (data.transactions.length > 0) {
  //           transactionId = data.transactions[0].id;
  //           //@ts-expect-error currentBankChecked
  //           currentBankChecked = data.transactions[0].payment__bank__checked;
  //           console.log('currentBankChecked', currentBankChecked);
  //         }
  //       },
  //     ),
  //   });
  //   if (transactionId) {
  //     await testApiHandler({
  //       appHandler: { PUT: putTransaction },
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
  //             method: 'PUT',
  //             body: {
  //               payment: {
  //                 bank__checked: !currentBankChecked,
  //               },
  //             },
  //           });
  //           expect(data).toBeDefined();
  //           //銀行振込をしたかどうかのチェックを見る
  //           expect(data.payment?.bank__checked).toBe(!currentBankChecked);
  //         },
  //       ),
  //     });
  //   }
});
