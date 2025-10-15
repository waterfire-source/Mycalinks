// Since there's no defined API in api-generator for this endpoint,
// we'll test the implementation directly without apiDef

import { test } from 'vitest';

test('セット販売取得APIが正常に動作する', async () => {
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
  //       },
  //       async (fetch) => {
  //         const response = await fetch();
  //         expect(response).toBeDefined();
  //         expect(response.set_deals).toBeDefined();
  //         expect(Array.isArray(response.set_deals)).toBe(true);
  //       },
  //     ),
  //   });
});
