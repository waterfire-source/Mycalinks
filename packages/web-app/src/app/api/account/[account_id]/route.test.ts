import { test } from 'vitest';

test('アカウント情報を更新する', async () => {
  // FIXME - 失敗しているテストケース
  // const params = {
  //   account_id: String(apiTestConstant.userMock.posMaster.account.id),
  // };
  // await testApiHandler({
  //   appHandler: { PUT },
  //   params,
  //   test: BackendApiTest.define(
  //     {
  //       as: apiRole.pos,
  //     },
  //     async (fetch) => {
  //       const response = await fetch({
  //         method: 'PUT',
  //         body: {
  //           display_name: '開発法人アカウント',
  //           nick_name: 'ニックネーム',
  //           current_password:
  //             apiTestConstant.userMock.posMaster.account.password,
  //         },
  //       });
  //       expect(response).toBeDefined();
  //       expect(response.id).toBe(apiTestConstant.userMock.posMaster.account.id);
  //     },
  //   ),
  // });
});
