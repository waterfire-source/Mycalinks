// tests/api/hello.test.ts
import { expect, test } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { GET } from './route';
import { PUT } from './[item_id]/route';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { getItemApi } from 'api-generator';
import { Item } from '@prisma/client';

test('商品マスタ一覧を取得して更新しまくる', async () => {
  const tryCount = 100;
  for (let i = 0; i < tryCount; i++) {
    let itemId: Item['id'] | null = null;

    await testApiHandler({
      appHandler: { GET },
      params: {
        store_id: String(apiTestConstant.storeMock.id),
      },
      url: `?take=20`,
      test: BackendApiTest.define(
        {
          as: apiRole.pos,
          apiDef: getItemApi,
        },
        async (fetch) => {
          const data = await fetch();

          expect(data.items).toBeDefined();
          expect(data.items.length).toBe(20);

          //適当に選ぶ
          itemId = BackendApiTest.getRandRecord(data.items).id;
        },
      ),
    });

    //価格を更新する
    await testApiHandler({
      appHandler: { PUT },
      params: {
        store_id: String(apiTestConstant.storeMock.id),
        item_id: String(itemId),
      },
      test: BackendApiTest.define(
        {
          as: apiRole.pos,
        },
        async (fetch) => {
          const data = await fetch({
            method: 'PUT',
            body: {
              sell_price: 100,
            },
          });

          expect(data).toBeDefined();
          expect(data.sell_price).toBe(100);
        },
      ),
    });

    console.log(`${i}回目の商品取得&商品価格更新`);
  }
});
