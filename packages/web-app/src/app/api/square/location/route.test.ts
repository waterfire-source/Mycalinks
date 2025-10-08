import { expect, test } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { GET } from './route';
import { getSquareLocationsApi } from 'api-generator';

test.skip('Squareのロケーション一覧を取得する', async () => {
  await testApiHandler({
    appHandler: { GET },
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        apiDef: getSquareLocationsApi,
      },
      async (fetch) => {
        const data = await fetch();
        expect(data.locations).toBeDefined();
        expect(Array.isArray(data.locations)).toBe(true);

        // 各ロケーションの構造確認
        if (data.locations.length > 0) {
          const location = data.locations[0];
          expect(location.id).toBeDefined();
          expect(location.name).toBeDefined();
          expect(location.createdAt).toBeDefined();
          expect('pos_store_id' in location).toBe(true);
        }
      },
    ),
  });
});
