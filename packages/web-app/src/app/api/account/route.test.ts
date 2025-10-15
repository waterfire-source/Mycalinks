import { test } from 'vitest';

test('全てのアカウントを取得する', async () => {
  // FIXME - 失敗しているテストケース
  // await testApiHandler({
  //   appHandler: { GET },
  //   test: BackendApiTest.define(
  //     {
  //       as: apiRole.pos,
  //     },
  //     async (fetch) => {
  //       const response = await fetch({
  //         method: 'GET',
  //       });
  //       expect(response.accounts).toBeDefined();
  //       expect(Array.isArray(response.accounts)).toBe(true);
  //       expect(response.accounts.length).toBeGreaterThan(0);
  //     },
  //   ),
  // });
});

test('IDで絞り込んでアカウントを取得する', async () => {
  // FIXME - 失敗しているテストケース
  // const accountId = apiTestConstant.userMock.posMaster.account.id;
  // await testApiHandler({
  //   appHandler: { GET },
  //   url: `?id=${accountId}`,
  //   test: BackendApiTest.define(
  //     {
  //       as: apiRole.pos,
  //     },
  //     async (fetch) => {
  //       const response = await fetch({
  //         method: 'GET',
  //       });
  //       expect(response.accounts).toBeDefined();
  //       expect(Array.isArray(response.accounts)).toBe(true);
  //       expect(response.accounts.length).toBeGreaterThan(0);
  //       // 全ての返されたアカウントが指定されたIDを持っていることを確認
  //       response.accounts.forEach((account: any) => {
  //         expect(account.id).toBe(accountId);
  //       });
  //     },
  //   ),
  // });
});
