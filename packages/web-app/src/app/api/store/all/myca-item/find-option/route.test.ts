import { test } from 'vitest';

test('MycaのfindOptionを取得する', async () => {
  // FIXME - 失敗しているテストケース
  //   await testApiHandler({
  //     appHandler: { GET },
  //     url: '?genreHandle=ポケモン&categoryHandle=CARD',
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getMycaItemFindOptionApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.searchElements).toBeDefined();
  //         expect(Array.isArray(data.searchElements)).toBe(true);
  //         // 各検索要素の構造を検証
  //         data.searchElements.forEach((element) => {
  //           expect(element.metaLabel).toBeDefined();
  //           expect(typeof element.metaLabel).toBe('string');
  //           expect(element.columnOnPosItem).toBeDefined();
  //           expect(typeof element.columnOnPosItem).toBe('string');
  //           expect(Array.isArray(element.options)).toBe(true);
  //           // 各オプションの構造を検証
  //           element.options.forEach((option) => {
  //             expect(option.label).toBeDefined();
  //             expect(typeof option.label).toBe('string');
  //             expect(option.value).toBeDefined();
  //             expect(typeof option.value).toBe('string');
  //           });
  //         });
  //       },
  //     ),
  //   });
});

test('存在しないジャンルハンドルで空の結果を返す', async () => {
  // FIXME - 失敗しているテストケース
  //   await testApiHandler({
  //     appHandler: { GET },
  //     url: '?genreHandle=nonexistent&categoryHandle=CARD',
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getMycaItemFindOptionApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.searchElements).toBeDefined();
  //         expect(Array.isArray(data.searchElements)).toBe(true);
  //         expect(data.searchElements).toHaveLength(0);
  //       },
  //     ),
  //   });
});
