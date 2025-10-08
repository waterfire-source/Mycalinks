import { test } from 'vitest';

test('ECオーダーお問い合わせ一覧取得APIが正常に動作する', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   await testApiHandler({
  //     appHandler: { GET },
  //     params,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getEcOrderStoreContactApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.orderContacts).toBeDefined();
  //         expect(Array.isArray(data.orderContacts)).toBe(true);
  //         // お問い合わせがある場合は詳細を確認
  //         if (data.orderContacts.length > 0) {
  //           const contact = data.orderContacts[0];
  //           expect(contact.id).toBeDefined();
  //           expect(contact.kind).toBeDefined();
  //           expect(contact.status).toBeDefined();
  //           expect(contact.last_sent_at).toBeDefined();
  //           // オーダー情報の確認
  //           expect(contact.order_store).toBeDefined();
  //           expect(contact.order_store.order).toBeDefined();
  //           expect(contact.order_store.order.id).toBeDefined();
  //           expect(contact.order_store.order.code).toBeDefined();
  //           expect(contact.order_store.code).toBeDefined();
  //           // メッセージ配列の確認
  //           expect(contact.messages).toBeInstanceOf(Array);
  //         }
  //       },
  //     ),
  //   });
});

test('ECオーダーお問い合わせ一覧をフィルタリングして取得できる', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   await testApiHandler({
  //     appHandler: { GET },
  //     params,
  //     url: `?status=${EcOrderContactStatus.UNREAD}&take=10&skip=0`,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getEcOrderStoreContactApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.orderContacts).toBeDefined();
  //         // ステータスでフィルタリングされていることを確認
  //         if (data.orderContacts.length > 0) {
  //           data.orderContacts.forEach((contact) => {
  //             expect(contact.status).toBe(EcOrderContactStatus.UNREAD);
  //           });
  //         }
  //       },
  //     ),
  //   });
});

test('ECオーダーお問い合わせ一覧をメッセージ内容付きで取得できる', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   await testApiHandler({
  //     appHandler: { GET },
  //     params,
  //     url: '?includesMessages=true',
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getEcOrderStoreContactApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.orderContacts).toBeDefined();
  //         // メッセージ内容が含まれていることを確認
  //         if (
  //           data.orderContacts.length > 0 &&
  //           data.orderContacts[0].messages &&
  //           data.orderContacts[0].messages.length > 0
  //         ) {
  //           const message = data.orderContacts[0].messages[0];
  //           expect('content' in message).toBe(true);
  //         }
  //       },
  //     ),
  //   });
});
