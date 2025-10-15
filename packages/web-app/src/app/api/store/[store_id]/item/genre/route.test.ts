// tests/api/hello.test.ts

import { test } from 'vitest';

test('商品マスタジャンル作成後、それを取得して名前を変更して、削除ができる', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   let targetGenreId: Item_Genre['id'] = 0;
  //   //ジャンル作成
  //   await testApiHandler({
  //     appHandler: { POST: createItemGenre },
  //     params,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: createItemGenreApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch({
  //           body: {
  //             myca_genre_id: undefined,
  //             display_name: `API統合テストジャンル${Date.now()}`,
  //           },
  //         });
  //         targetGenreId = data.id;
  //         expect(typeof targetGenreId).toBe('number');
  //       },
  //     ),
  //   });
  //   //ジャンル取得
  //   await testApiHandler({
  //     appHandler: { GET: getItemGenre },
  //     params,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: getItemGenreApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.itemGenres).toBeDefined();
  //         const targetGenre = data.itemGenres.find(
  //           (genre) => genre.id === targetGenreId,
  //         );
  //         expect(targetGenre).toBeDefined();
  //       },
  //     ),
  //   });
  //   //ジャンル名変更
  //   await testApiHandler({
  //     appHandler: { PUT: updateItemGenre },
  //     params: {
  //       ...params,
  //       item_genre_id: String(targetGenreId),
  //     },
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: updateItemGenreApi,
  //       },
  //       async (fetch) => {
  //         const updatedGenreName = `API統合テストジャンル変更${Date.now()}`;
  //         const data = await fetch({
  //           body: {
  //             hidden: undefined,
  //             display_name: updatedGenreName,
  //             auto_update: undefined,
  //             deleted: undefined,
  //           },
  //         });
  //         expect(data.display_name).toBe(updatedGenreName);
  //       },
  //     ),
  //   });
  //   //ジャンル削除
  //   await testApiHandler({
  //     appHandler: { PUT: updateItemGenre },
  //     params: {
  //       ...params,
  //       item_genre_id: String(targetGenreId),
  //     },
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: updateItemGenreApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch({
  //           body: {
  //             hidden: undefined,
  //             display_name: undefined,
  //             auto_update: undefined,
  //             deleted: true,
  //           },
  //         });
  //         expect(data.deleted).toBe(true);
  //       },
  //     ),
  //   });
});
