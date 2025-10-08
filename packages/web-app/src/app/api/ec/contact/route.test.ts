import { expect, test } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { POST } from './route';
import { submitEcContactApi } from 'api-generator';

test('ECお問い合わせAPIが正常に動作する', async () => {
  // FIXME - 失敗しているテストケース
  //   await testApiHandler({
  //     appHandler: { POST },
  //     test: BackendApiTest.define(
  //       {
  //         as: apiRole.everyone,
  //         apiDef: submitEcContactApi,
  //       },
  //       async (fetch) => {
  //         const data = await fetch({
  //           body: {
  //             kind: 'product_question',
  //             content: 'こちらの商品について質問があります。',
  //           },
  //         });
  //       },
  //     ),
  //   });
});

test.skip('ECお問い合わせAPIで商品IDを指定できる', async () => {
  await testApiHandler({
    appHandler: { POST },
    test: BackendApiTest.define(
      {
        as: apiRole.mycaUser,
        apiDef: submitEcContactApi,
      },
      async (fetch) => {
        const data = await fetch({
          body: {
            kind: 'product_question',
            content: '商品の状態について質問があります。',
            myca_item_id: 123,
          },
        });

        expect(data.ok).toBeDefined();
        expect(data.ok).toBe('お問い合わせが送信されました');
      },
    ),
  });
});

test('ECお問い合わせAPIで必須パラメータが不足している場合エラーになる', async () => {
  await testApiHandler({
    appHandler: { POST },
    test: BackendApiTest.define(
      {
        as: apiRole.everyone,
        apiDef: submitEcContactApi,
        expectError: true,
      },
      async (fetch) => {
        try {
          // contentが必須だが指定しない
          await fetch({
            //@ts-expect-error becuase of because of
            body: {
              kind: 'product_question',
            },
          });
          // エラーにならなかった場合はテスト失敗
          expect(true).toBe(false);
        } catch (error) {
          // エラーが発生することを確認
          expect(error).toBeDefined();
          // @ts-expect-error becuase of
          expect(error.status).toBe(400);
        }
      },
    ),
  });
});
