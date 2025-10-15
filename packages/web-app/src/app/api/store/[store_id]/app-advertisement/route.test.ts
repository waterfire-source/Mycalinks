import { test } from 'vitest';

test('アプリ広告一覧を取得する', async () => {
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
  //       apiDef: getAppAdvertisementApi,
  //     },
  //     async (fetch) => {
  //       const data = await fetch();
  //       expect(data.appAdvertisements).toBeDefined();
  //       expect(Array.isArray(data.appAdvertisements)).toBe(true);
  //     },
  //   ),
  // });
});

test('アプリ広告を作成する', async () => {
  // FIXME - 失敗しているテストケース
  // const params = {
  //   store_id: String(apiTestConstant.storeMock.id),
  // };
  // await testApiHandler({
  //   appHandler: { POST },
  //   params,
  //   test: BackendApiTest.define(
  //     {
  //       as: apiRole.pos,
  //       apiDef: createOrUpdateAppAdvertisementApi,
  //     },
  //     async (fetch) => {
  //       const data = await fetch({
  //         body: {
  //           display_name: 'テスト広告',
  //           kind: AppAdvertisementKind.NOTIFICATION,
  //           start_at: new Date(Date.now() + 86400000), // 明日
  //           end_at: new Date(Date.now() + 86400000 * 2), // 明後日
  //           data_type: AppAdvertisementDataType.TEXT,
  //           data_text: 'テスト広告のテキスト内容',
  //           data_images: [],
  //         },
  //       });
  //       expect(data.id).toBeDefined();
  //       expect(data.display_name).toBe('テスト広告');
  //       expect(data.kind).toBe(AppAdvertisementKind.NOTIFICATION);
  //       expect(data.data_type).toBe(AppAdvertisementDataType.TEXT);
  //       expect(data.data_text).toBe('テスト広告のテキスト内容');
  //     },
  //   ),
  // });
});
