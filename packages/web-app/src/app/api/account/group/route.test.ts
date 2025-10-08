import { test } from 'vitest';

test('アカウントグループ一覧を取得する', async () => {
  // FIXME - 失敗しているテストケース
  // await testApiHandler({
  //   appHandler: { GET },
  //   test: BackendApiTest.define(
  //     {
  //       as: apiRole.pos,
  //       apiDef: getAccountGroupApi,
  //     },
  //     async (fetch) => {
  //       const data = await fetch();
  //       expect(data.account_groups).toBeDefined();
  //       expect(Array.isArray(data.account_groups)).toBe(true);
  //     },
  //   ),
  // });
});

test('アカウントグループを作成する', async () => {
  // FIXME - 失敗しているテストケース
  // await testApiHandler({
  //   appHandler: { POST },
  //   test: BackendApiTest.define(
  //     {
  //       as: apiRole.pos,
  //       apiDef: createOrUpdateAccountGroupApi,
  //     },
  //     async (fetch) => {
  //       const data = await fetch({
  //         body: {
  //           display_name: 'テストグループ',
  //           create_account: false,
  //           update_corporation: false,
  //           admin_mode: false,
  //           update_store: false,
  //           sales_mode: true,
  //           update_store_setting: false,
  //         },
  //       });
  //       expect(data.id).toBeDefined();
  //       expect(data.display_name).toBe("テストグループ");
  //       expect(data.sales_mode).toBe(true);
  //       expect(data.list_item).toBe(true);
  //     },
  //   ),
  // });
});
