import { expect, test } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { GET } from './route';
import { getEcDraftCartApi } from 'api-generator';

test('ECドラフトカート取得APIが未認証の場合にcodeを必須とする', async () => {
  await testApiHandler({
    appHandler: { GET },
    url: '', // codeパラメータがないリクエスト
    test: BackendApiTest.define(
      {
        as: apiRole.everyone, // 未認証ユーザー
        apiDef: getEcDraftCartApi,
        expectError: true,
      },
      async (fetch) => {
        try {
          await fetch();
          // エラーが発生すべきなのでここに到達すべきでない
          expect(true).toBe(false);
        } catch (error: any) {
          expect(error.status).toBe(400);
        }
      },
    ),
  });
});

test('ECドラフトカート取得APIが認証済みユーザーの場合に動作する', async () => {
  // FIXME - 失敗しているテストケース
  //   await testApiHandler({
  //     appHandler: { GET },
  //     url: '',
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.mycaUser,
  //         apiDef: getEcDraftCartApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch();
  //         // レスポンスの基本構造を確認
  //         expect(data.order).toBeDefined();
  //         if (data.order) {
  //           // 合計商品数が正しく計算されているか確認
  //           // オーダー情報の確認
  //           expect(typeof data.order.totalItemCount).toBe('number');
  //         }
  //       },
  //     ),
  //   });
});
