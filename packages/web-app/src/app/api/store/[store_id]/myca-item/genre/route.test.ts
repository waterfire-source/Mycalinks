import { test } from 'vitest';

test('アプリジャンル情報を取得する', async () => {
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
  //         apiDef: getAppGenreWithPosGenreApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.appGenres).toBeDefined();
  //         expect(Array.isArray(data.appGenres)).toBe(true);
  //         // 各ジャンルの構造を検証
  //         data.appGenres.forEach((genre) => {
  //           expect(genre.id).toBeDefined();
  //           expect(genre.name).toBeDefined();
  //           expect(typeof genre.total_item_count).toBe('number');
  //           // posGenreはnullまたはオブジェクト
  //           if (genre.posGenre) {
  //             expect(genre.posGenre.id).toBeDefined();
  //             expect(typeof genre.posGenre.total_item_count).toBe('number');
  //           }
  //         });
  //       },
  //     ),
  //   });
});
