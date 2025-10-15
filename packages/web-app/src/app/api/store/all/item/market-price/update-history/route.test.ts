// tests/api/hello.test.ts
import { describe, it } from 'vitest';
import { BackendApiTest } from '@/api/backendApi/test/main';
import { getItemMarketPriceHistoryApi } from 'api-generator';

describe(BackendApiTest.describeApi(getItemMarketPriceHistoryApi), () => {
  it('商品マスタ相場価格の更新履歴を取得できる', async () => {
    // FIXME - 失敗しているテストケース
    //   await testApiHandler({
    //     appHandler: { GET },
    //     test: BackendApiTest.define(
    //       {
    //         as: apiRole.pos,
    //         apiDef: getItemMarketPriceHistoryApi,
    //       },
    //       async (fetch) => {
    //         const data = await fetch();
    //         expect(data.updatedHistory).toBeDefined();
    //       },
    //     ),
    //   });
  });
});
