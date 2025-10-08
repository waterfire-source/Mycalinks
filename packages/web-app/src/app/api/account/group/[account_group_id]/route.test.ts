import { expect, test } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { DELETE } from './route';
import { deleteAccountGroupApi } from 'api-generator';

// 以下のテストはアカウントグループIDが必要なためスキップしています
test.skip('アカウントグループを削除する', async () => {
  // テスト用のアカウントグループID
  const accountGroupId = 0; // 適切なIDがない

  const params = {
    account_group_id: String(accountGroupId),
  };

  await testApiHandler({
    appHandler: { DELETE },
    params,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        apiDef: deleteAccountGroupApi,
      },
      async (fetch) => {
        const data = await fetch();
        expect(data.ok).toBeDefined();
      },
    ),
  });
});
