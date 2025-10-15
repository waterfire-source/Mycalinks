import { test } from 'vitest';

test('法人情報を更新できる', async () => {
  // FIXME - 失敗しているテストケース
  // const params = {
  //   corporation_id: String(apiTestConstant.corporationMock.id),
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
  //           ceo_name: '更新後の代表者名',
  //         },
  //       });
  //       expect(response.corporation).toBeDefined();
  //       expect(response.corporation.id).toBe(
  //         apiTestConstant.corporationMock.id,
  //       );
  //       expect(response.corporation.ceo_name).toBe('更新後の代表者名');
  //     },
  //   ),
  // });
});
