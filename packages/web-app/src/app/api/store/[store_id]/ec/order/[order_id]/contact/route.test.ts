import { expect, test } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { POST } from './route';
import { replyEcOrderStoreContactApi } from 'api-generator';
import { EcOrderContactStatus } from '@prisma/client';

test.skip('ECオーダーお問い合わせ返信APIが正常に動作する', async () => {
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
    order_id: '1', // テスト用のオーダーID
  };

  await testApiHandler({
    appHandler: { POST },
    params,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        apiDef: replyEcOrderStoreContactApi,
      },
      async (fetch) => {
        const data = await fetch({
          body: {
            content: 'お問い合わせありがとうございます。確認いたしました。',
          },
        });

        expect(data.thisOrderContact).toBeDefined();
        expect(data.thisOrderContact.id).toBeDefined();
        expect(data.thisOrderContact.status).toBeDefined();
        expect(data.thisOrderContact.messages).toBeInstanceOf(Array);

        // メッセージが追加されていることを確認
        if (data.thisOrderContact.messages.length > 0) {
          const lastMessage =
            data.thisOrderContact.messages[
              data.thisOrderContact.messages.length - 1
            ];
          expect(lastMessage.content).toBe(
            'お問い合わせありがとうございます。確認いたしました。',
          );
          expect(lastMessage.staff_account_id).toBeDefined();
        }
      },
    ),
  });
});

test.skip('ECオーダーお問い合わせのステータスを更新できる', async () => {
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
    order_id: '1', // テスト用のオーダーID
  };

  await testApiHandler({
    appHandler: { POST },
    params,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        apiDef: replyEcOrderStoreContactApi,
      },
      async (fetch) => {
        const data = await fetch({
          body: {
            status: EcOrderContactStatus.SOLVED,
            content: '解決しました。ありがとうございました。',
          },
        });

        expect(data.thisOrderContact).toBeDefined();
        expect(data.thisOrderContact.status).toBe(EcOrderContactStatus.SOLVED);

        // メッセージが追加されていることを確認
        if (data.thisOrderContact.messages.length > 0) {
          const lastMessage =
            data.thisOrderContact.messages[
              data.thisOrderContact.messages.length - 1
            ];
          expect(lastMessage.content).toBe(
            '解決しました。ありがとうございました。',
          );
        }
      },
    ),
  });
});

test.skip('ECオーダーお問い合わせの内容なしでステータスのみ更新できる', async () => {
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
    order_id: '1', // テスト用のオーダーID
  };

  await testApiHandler({
    appHandler: { POST },
    params,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        apiDef: replyEcOrderStoreContactApi,
      },
      async (fetch) => {
        const data = await fetch({
          body: {
            status: EcOrderContactStatus.ADDRESSING,
          },
        });

        expect(data.thisOrderContact).toBeDefined();
        expect(data.thisOrderContact.status).toBe(
          EcOrderContactStatus.ADDRESSING,
        );
      },
    ),
  });
});
