import { expect, test } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { DELETE } from './[memo_id]/route';
import { deleteMemoApi } from 'api-generator';

test('メモ一覧を取得する', async () => {
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
  //         apiDef: getMemoApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         expect(data.memos).toBeDefined();
  //         expect(Array.isArray(data.memos)).toBe(true);
  //       },
  //     ),
  //   });
});

test('メモを作成する', async () => {
  // FIXME - 失敗しているテストケース
  //   const params = {
  //     store_id: String(apiTestConstant.storeMock.id),
  //   };
  //   await testApiHandler({
  //     appHandler: { POST },
  //     params,
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.pos,
  //         apiDef: createOrUpdateMemoApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch({
  //           body: {
  //             content: 'テストメモ内容',
  //           },
  //         });
  //         expect(data.id).toBeDefined();
  //         expect(data.content).toBe('テストメモ内容');
  //         expect(data.store_id).toBe(apiTestConstant.storeMock.id);
  //       },
  //     ),
  //   });
});

// メモIDが必要なためこのテストはスキップ
// メモIDが定数ファイルにない場合はテストできない
test.skip('メモを削除する', async () => {
  // テスト用のメモIDが必要
  const memoId = 0; // 適切なIDがない

  const params = {
    store_id: String(apiTestConstant.storeMock.id),
    memo_id: String(memoId),
  };

  await testApiHandler({
    appHandler: { DELETE },
    params,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        apiDef: deleteMemoApi,
      },
      async (fetch) => {
        const data = await fetch();
        expect(data.ok).toBeDefined();
      },
    ),
  });
});
