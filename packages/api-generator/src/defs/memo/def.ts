import { MemoSchema, StoreSchema } from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOk } from '../../generator/util';

extendZodWithOpenApi(z);

export const createOrUpdateMemoApi = {
  summary: 'メモ作成・更新',
  description: 'メモを作成・更新する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/memo',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      id: MemoSchema.shape.id.optional().describe('既存のメモID'),
      content: MemoSchema.shape.content.describe('メモ内容（改行も保存する）'),
    }),
  },
  process: ``,
  response: MemoSchema.describe('作成されたリソースの情報'),
  error: {} as const,
} satisfies BackendApiDef;

export const deleteMemoApi = {
  summary: 'メモ削除',
  description: 'メモを削除する',
  method: ApiMethod.DELETE,
  path: '/store/{store_id}/memo/{memo_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      memo_id: MemoSchema.shape.id,
    }),
  },
  process: ``,
  response: defOk('メモが削除できました'),
  error: {} as const,
} satisfies BackendApiDef;

export const getMemoApi = {
  summary: 'メモ取得',
  description: 'メモ一覧を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/memo',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
  },
  process: ``,
  response: z.object({
    memos: z.array(MemoSchema),
  }),
  error: {} as const,
} satisfies BackendApiDef;
