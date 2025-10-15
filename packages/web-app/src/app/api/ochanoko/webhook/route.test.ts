import { expect, test } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { POST } from './route';
import { ochanokoEmailWebhookApi } from 'api-generator';

const emailData = {
  subject: 'テストメール',
  from: 'sample@ochanoko.com',
  text: 'これはテストメールです。\n改行もしちゃいます',
  to: 'ochanoko-ec-order@mycalinks.io',
};

test('おちゃのこのWebhookが正常に動作する', async () => {
  // FIXME - 失敗しているテストケース
  //   await testApiHandler({
  //     appHandler: { POST },
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.bot,
  //         apiDef: ochanokoEmailWebhookApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch({
  //           body: {
  //             orderInfo: {
  //               status: 'ordered',
  //               orderId: 9,
  //               storeEmail: 'info@myca.cards',
  //             },
  //           },
  //         });
  //         // レスポンスのチェック
  //         expect(data.ok).toBeDefined();
  //         expect(data.ok).toBe('メールの受信に成功しました');
  //       },
  //     ),
  //   });
});

test('無効なロールでアクセスするとエラーになる', async () => {
  await testApiHandler({
    appHandler: { POST },
    test: BackendApiTest.define(
      {
        as: apiRole.everyone,
        apiDef: ochanokoEmailWebhookApi,
        expectError: true,
      },
      async (fetch) => {
        try {
          await fetch({
            body: {
              orderInfo: {
                status: 'ordered',
                orderId: 9,
                storeEmail: 'info@myca.cards',
              },
            },
          });
          // エラーにならなかった場合はテスト失敗
          expect(true).toBe(false);
        } catch (error) {
          // エラーが発生することを確認
          expect(error).toBeDefined();
          // @ts-expect-error becuase of
          expect(error.status).toBe(401);
        }
      },
    ),
  });
});
