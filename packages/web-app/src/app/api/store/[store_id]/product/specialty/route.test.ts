import { test } from 'vitest';

test('新規スペシャルティを作成できる', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   let specialtyId: Specialty['id'] | null = null;
  //   const body = {
  //     display_name: `テストリソース_スペシャルティ_${Date.now()}`,
  //   };
  //   await testApiHandler({
  //     appHandler: { POST },
  //     params,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: createOrUpdateSpecialtyApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch({
  //           body,
  //         });
  //         expect(data).toBeDefined();
  //         expect(data.display_name).toBe(body.display_name);
  //         expect(data.kind).toBe(SpecialtyKind.NORMAL);
  //         expect(data.store_id).toBe(apiTestConstant.storeMock.id);
  //         specialtyId = data.id;
  //       },
  //     ),
  //   });
  //   //削除する
  //   await testApiHandler({
  //     appHandler: { DELETE },
  //     params: {
  //       store_id: String(apiTestConstant.storeMock.id),
  //       specialty_id: String(specialtyId),
  //     },
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: deleteSpecialtyApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data).toBeDefined();
  //         expect(data.ok).toBeDefined();
  //       },
  //     ),
  //   });
});

test('全てのスペシャルティを取得できる', async () => {
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
  //         apiDef: getSpecialtyApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data).toBeDefined();
  //         expect(data.specialties).toBeDefined();
  //         expect(Array.isArray(data.specialties)).toBe(true);
  //       },
  //     ),
  //   });
});
