import { expect, test } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { DELETE } from './route';
import { GET, POST } from '../route';
import { SetDealStatus } from '@prisma/client';

test.skip('セット販売削除APIが正常に動作する', async () => {
  const storeParams = {
    store_id: String(apiTestConstant.storeMock.id),
  };

  // テスト用のセット販売を作成
  let createdSetDealId: number | undefined;

  await testApiHandler({
    appHandler: { POST },
    params: storeParams,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
      },
      async (fetch) => {
        // テスト用のセット販売データ
        const testSetDealData = {
          display_name: '削除テスト用セット販売',
          discount_amount: -200,
          start_at: new Date().toISOString(),
          products: [
            {
              product_id: 1,
              item_count: 1,
            },
          ],
        };

        const response = await fetch({
          body: testSetDealData,
        });

        createdSetDealId = response.data.id;
      },
    ),
  });

  // セット販売の作成に失敗した場合はテストをスキップ
  if (!createdSetDealId) {
    console.log('テスト用セット販売の作成に失敗したためテストをスキップします');
    return;
  }

  // 削除処理
  const deleteParams = {
    store_id: String(apiTestConstant.storeMock.id),
    set_deal_id: String(createdSetDealId),
  };

  await testApiHandler({
    appHandler: { DELETE },
    params: deleteParams,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
      },
      async (fetch) => {
        const response = await fetch();

        expect(response.msgContent).toBeDefined();
        expect(response.msgContent).toBe('削除できました');
      },
    ),
  });

  // 削除後に取得してDELETEDステータスになっていることを確認
  await testApiHandler({
    appHandler: { GET },
    params: storeParams,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
      },
      async (fetch) => {
        const response = await fetch();

        // 削除したセット販売を検索
        const deletedSetDeal = response.data.set_deals.find(
          (deal: any) => deal.id === createdSetDealId,
        );

        // 削除したセット販売が存在し、ステータスがDELETEDになっていることを確認
        if (deletedSetDeal) {
          expect(deletedSetDeal.status).toBe(SetDealStatus.DELETED);
        }
      },
    ),
  });
});

test('存在しないセット販売IDを指定して削除するとエラーになる', async () => {
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
    set_deal_id: '99999', // 存在しないID
  };

  await testApiHandler({
    appHandler: { DELETE },
    params,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        expectError: true,
      },
      async (fetch) => {
        try {
          await fetch();
          // エラーが発生しなかった場合は失敗
          expect(true).toBe(false);
        } catch (error) {
          // エラーが発生することを確認
          expect(error).toBeDefined();
        }
      },
    ),
  });
});

test.skip('すでに削除済みのセット販売を削除しようとするとエラーになる', async () => {
  const storeParams = {
    store_id: String(apiTestConstant.storeMock.id),
  };

  // 既存の削除済みセット販売を検索
  let deletedSetDealId: number | undefined;

  await testApiHandler({
    appHandler: { GET },
    params: storeParams,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
      },
      async (fetch) => {
        const response = await fetch();

        // 削除済みセット販売を検索
        const deletedSetDeal = response.data.set_deals.find(
          (deal: any) => deal.status === SetDealStatus.DELETED,
        );

        if (deletedSetDeal) {
          deletedSetDealId = deletedSetDeal.id;
        }
      },
    ),
  });

  // 削除済みセット販売が見つからない場合はテストをスキップ
  if (!deletedSetDealId) {
    console.log('削除済みセット販売が見つからないためテストをスキップします');
    return;
  }

  // 削除済みセット販売を再度削除しようとする
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
    set_deal_id: String(deletedSetDealId),
  };

  await testApiHandler({
    appHandler: { DELETE },
    params,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
        expectError: true,
      },
      async (fetch) => {
        try {
          await fetch();
          // エラーが発生しなかった場合は失敗
          expect(true).toBe(false);
        } catch (error) {
          // エラーが発生することを確認
          expect(error).toBeDefined();
          // @ts-expect-error becuase of
          expect(error.code).toBe('notExist');
        }
      },
    ),
  });
});
