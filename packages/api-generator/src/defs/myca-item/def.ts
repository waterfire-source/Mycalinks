import {
  Item_CategorySchema,
  Item_GenreSchema,
  StoreSchema,
} from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// MycaAppGenre schema (since it's not in backend-core, we need to define it)
const MycaAppGenreSchema = z.object({
  id: z.number().describe('アプリジャンルID'),
  name: z.string().describe('ジャンル名'),
  display_order: z.number().describe('表示順'),
  color: z.string().describe('色コード'),
  active: z.boolean().describe('有効か否か'),
  created_at: z.date().describe('作成日時'),
  updated_at: z.date().describe('更新日時'),
});

export const getAppGenreWithPosGenreApi = {
  summary: 'アプリジャンル情報取得',
  description: 'POSの情報と結びつけてmycalinksアプリのジャンル情報を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/myca-item/genre',
  privileges: {
    role: [apiRole.pos, apiRole.everyone],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id.describe('店舗ID'),
    }),
  },
  process: `
  ポスのジャンル情報とアプリのジャンル情報を結びつけて返す
  アプリのジャンルの名前(name)とポスのジャンルのハンドル(handle)が一致するときに紐づける
  `,
  response: z.object({
    appGenres: z.array(
      MycaAppGenreSchema.extend({
        total_item_count: z
          .number()
          .describe('アプリ上で登録されているアイテム数'),
        posGenre: z
          .object({
            id: z.number().describe('POSジャンルID'),
            total_item_count: z
              .number()
              .describe(
                'POSに登録されている、アプリに紐づいているこのジャンルのアイテム数',
              ),
          })
          .nullable()
          .describe(
            'POS上で結びつけられているジャンルがある場合、その情報が入る',
          ),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getMycaItemFindOptionApi = {
  summary: 'MycaのfindOptionを取得する',
  description: 'MycaのfindOptionを取得する',
  method: ApiMethod.GET,
  path: '/store/all/myca-item/find-option',
  privileges: {
    role: [apiRole.everyone],
  },
  request: {
    query: z.object({
      genreHandle: z.string().describe('ジャンルハンドル'),
      categoryHandle: z.enum(['CARD', 'BOX']).describe('カテゴリハンドル'),
    }),
  },
  process: `

  `,
  response: z.object({
    searchElements: z.array(
      z.object({
        metaLabel: z.string().describe('この絞り込み要素の名前'),
        columnOnPosItem: z.string().describe('POSのItem上でのカラム名'),
        options: z.array(
          z.object({
            label: z.string().describe('選択肢名'),
            value: z.string().describe('選択肢値 部分一致だったら%'),
          }),
        ),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getMycaItemFindOptionByStoreIdApi = {
  summary: 'MycaのfindOptionを取得する（店舗向け）',
  description: 'MycaのfindOptionを取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/myca-item/find-option',
  privileges: {
    role: [apiRole.everyone],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id.describe('店舗ID'),
    }),
    query: z.object({
      genreId: Item_GenreSchema.shape.id.describe('ジャンルID'),
      categoryId: Item_CategorySchema.shape.id.describe('カテゴリID'),
    }),
  },
  process: `

  `,
  response: getMycaItemFindOptionApi.response,
  error: {} as const,
} satisfies BackendApiDef;
