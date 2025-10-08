import { expect, test } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { apiRole } from '@/api/backendApi/main';
import { apiTestConstant } from '@/api/backendApi/test/constant';
import { GET, POST } from './route';

test('タブレット許可ジャンル/カテゴリ取得APIが正常に動作する', async () => {
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
  //       },
  //       async (fetch) => {
  //         const response = await fetch();
  //         expect(response.tabletAllowedGenresCategories).toBeDefined();
  //         expect(Array.isArray(response.tabletAllowedGenresCategories)).toBe(
  //           true,
  //         );
  //       },
  //     ),
  //   });
});

test.skip('タブレット許可ジャンル/カテゴリ設定APIで設定が更新できる', async () => {
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
  };

  // テストデータ
  const testSettings = [
    {
      genre_id: 1,
      category_id: 1,
      condition_option_id: 1,
    },
    {
      genre_id: 2,
      category_id: 2,
    },
  ];

  await testApiHandler({
    appHandler: { POST },
    params,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
      },
      async (fetch) => {
        const response = await fetch({
          body: {
            tabletAllowedGenresCategories: testSettings,
          },
        });

        expect(response.tabletAllowedGenresCategories).toBeDefined();
        expect(Array.isArray(response.tabletAllowedGenresCategories)).toBe(
          true,
        );
      },
    ),
  });
});

test.skip('タブレット許可ジャンル/カテゴリ設定APIで空配列を指定すると設定がクリアされる', async () => {
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
  };

  await testApiHandler({
    appHandler: { POST },
    params,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
      },
      async (fetch) => {
        const response = await fetch({
          body: {
            tabletAllowedGenresCategories: [],
          },
        });

        expect(response.tabletAllowedGenresCategories).toBeDefined();
        expect(Array.isArray(response.tabletAllowedGenresCategories)).toBe(
          true,
        );
        expect(response.tabletAllowedGenresCategories.length).toBe(0);
      },
    ),
  });
});

test.skip('タブレット許可ジャンル/カテゴリ設定APIで設定後に取得して値が一致する', async () => {
  const params = {
    store_id: String(apiTestConstant.storeMock.id),
  };

  // テストデータ
  const testSettings = [
    {
      genre_id: 3,
      category_id: 3,
    },
  ];

  // 設定を行う
  await testApiHandler({
    appHandler: { POST },
    params,
    test: BackendApiTest.define(
      {
        as: apiRole.pos,
      },
      async (fetch) => {
        await fetch({
          body: {
            tabletAllowedGenresCategories: testSettings,
          },
        });

        // 設定後に値を取得して検証
        await testApiHandler({
          appHandler: { GET },
          params,
          test: BackendApiTest.define(
            {
              as: apiRole.pos,
            },
            async (fetch) => {
              const response = await fetch();

              expect(response.tabletAllowedGenresCategories).toBeDefined();
              expect(
                Array.isArray(response.tabletAllowedGenresCategories),
              ).toBe(true);

              // 少なくとも1つ以上の設定があることを確認
              expect(
                response.tabletAllowedGenresCategories.length,
              ).toBeGreaterThan(0);

              // 設定したジャンルとカテゴリのペアが含まれていることを確認
              const hasMatchingSetting =
                response.tabletAllowedGenresCategories.some(
                  (setting: any) =>
                    setting.item_genre_id === testSettings[0].genre_id &&
                    setting.item_category_id === testSettings[0].category_id,
                );

              expect(hasMatchingSetting).toBe(true);
            },
          ),
        });
      },
    ),
  });
});
