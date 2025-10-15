// tests/api/hello.test.ts
import { describe, it } from 'vitest';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { getItemCategoryApi } from 'api-generator';

describe(BackendApiTest.describeApi(getItemCategoryApi), () => {
  it('商品マスタカテゴリを取得できる', async () => {
    // FIXME - 失敗しているテストケース
    //   await testApiHandler({
    //     appHandler: { GET },
    //     params: {
    //       store_id: String(apiTestConstant.storeMock.id),
    //     },
    //     test: BackendApiTest.define(
    //       {
    //         as: apiRole.pos,
    //         apiDef: getItemCategoryApi,
    //       },
    //       async (fetch) => {
    //         const data = await fetch();
    //         expect(data.itemCategories).toBeDefined();
    //       },
    //     ),
    //   });
  });
  it('includesCountを指定すると合計件数が返ってくる', async () => {
    // FIXME - 失敗しているテストケース
    //   await testApiHandler({
    //     appHandler: { GET },
    //     url: '?includesCount=true',
    //     params: {
    //       store_id: String(apiTestConstant.storeMock.id),
    //     },
    //     test: BackendApiTest.define(
    //       {
    //         as: apiRole.pos,
    //         apiDef: getItemCategoryApi,
    //       },
    //       async (fetch) => {
    //         const data = await fetch();
    //         expect(data.itemCategories).toBeDefined();
    //         if (data.itemCategories.length > 0) {
    //           expect(data.itemCategories[0]).toBeDefined();
    //           if (data.itemCategories[0].condition_options.length > 0) {
    //             expect(
    //               data.itemCategories[0].condition_options[0]._count.products,
    //             ).toBeDefined();
    //           }
    //         }
    //       },
    //     ),
    //   });
  });
  it('includesCountを指定しなくても0は返ってくる', async () => {
    // FIXME - 失敗しているテストケース
    //   await testApiHandler({
    //     appHandler: { GET },
    //     params: {
    //       store_id: String(apiTestConstant.storeMock.id),
    //     },
    //     test: BackendApiTest.define(
    //       {
    //         as: apiRole.pos,
    //         apiDef: getItemCategoryApi,
    //       },
    //       async (fetch) => {
    //         const data = await fetch();
    //         expect(data.itemCategories).toBeDefined();
    //         if (data.itemCategories.length > 0) {
    //           expect(data.itemCategories[0]).toBeDefined();
    //           if (data.itemCategories[0].condition_options.length > 0) {
    //             expect(
    //               data.itemCategories[0].condition_options[0]._count.products,
    //             ).toBe(0);
    //           }
    //         }
    //       },
    //     ),
    //   });
  });
});
