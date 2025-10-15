import { getPrisma } from 'backend-core';
import { vi } from 'vitest';

declare const globalThis: {
  prismaGlobal: ReturnType<typeof getPrisma>;
} & typeof global;

globalThis.prismaGlobal = getPrisma();

vi.mock('backend-core', async () => {
  const actual =
    await vi.importActual<typeof import('backend-core')>('backend-core');
  return {
    ...actual,
    getPrisma: () => globalThis.prismaGlobal,
  };
});

// //テスト終了時に余分なリソースを物理削除
// afterAll(async () => {
//   const db = globalThis.prismaGlobal;

//   const testResourcePrefix = 'テストリソース_';

//   //商品マスタを削除
//   const itemDeleteRes = await db.item.deleteMany({
//     where: {
//       display_name: {
//         startsWith: testResourcePrefix,
//       },
//     },
//   });

//   console.log('商品マスタ削除', itemDeleteRes);
// });
