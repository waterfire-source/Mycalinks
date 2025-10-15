import { expect, test } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { GET } from './route';
import { getSquareOAuthUrlApi } from 'api-generator';

test.skip('Square OAuth同意画面のURLを取得する', async () => {
  await testApiHandler({
    appHandler: { GET },
    url: '?succeedCallbackUrl=https://example.com/success&failedCallbackUrl=https://example.com/failed',
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        apiDef: getSquareOAuthUrlApi,
      },
      async (fetch) => {
        const data = await fetch();

        expect(data.url).toBeDefined();
        expect(typeof data.url).toBe('string');
        expect(data.url.startsWith('https')).toBe(true);
      },
    ),
  });
});
