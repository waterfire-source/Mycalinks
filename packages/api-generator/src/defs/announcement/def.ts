import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOk, defPagination } from '../../generator/util';
import {
  Announcement_StoreSchema,
  AnnouncementSchema,
  StoreSchema,
} from 'backend-core';

extendZodWithOpenApi(z);

export const getAnnouncementApi = {
  summary: 'POSアプリのお知らせの取得',
  description: 'POSアプリのお知らせの取得',
  method: ApiMethod.GET,
  path: '/store/{store_id}/announcement',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id, //お知らせはストアに関係なく配信されるが、基本的に既読をつけたりするのがストア単位であるためパスパラメータにstore_idを持たせる
    }),

    query: z.object({
      ...defPagination(),
      kind: AnnouncementSchema.shape.kind.optional(),
      onlyUnread: z
        .boolean()
        .optional()
        .describe('未読のお知らせのみ取得するかどうか'),
    }),
  },
  process: `

  `,
  response: z.object({
    announcements: z.array(
      AnnouncementSchema.extend({
        read: z.boolean().optional(), //このストアが既読をつけたかどうか
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const readAnnouncementApi = {
  summary: 'POSお知らせの既読をつける',
  description: 'POSお知らせの既読をつける',
  method: ApiMethod.POST,
  path: '/store/{store_id}/announcement/{announcement_id}/read',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      announcement_id: AnnouncementSchema.shape.id,
    }),
  },
  process: `

  `,
  response: Announcement_StoreSchema,
  error: {} as const,
} satisfies BackendApiDef;

export const createOrUpdateAnnouncementApi = {
  summary: 'お知らせの作成・更新',
  description: 'お知らせの作成・更新',
  method: ApiMethod.POST,
  path: '/admin/announcement',
  privileges: {
    role: [apiRole.god],
  },
  request: {
    body: z.object({
      id: z.number().describe('ID').optional(),
      title: z.string().describe('タイトル').optional(),
      url: z.string().describe('URL').optional(),
      target_day: z.string().describe('対象日').optional(),
      kind: AnnouncementSchema.shape.kind.optional(),
      publish_at: z.string().describe('公開日').optional(),
      status: AnnouncementSchema.shape.status
        .optional()
        .describe('ステータスを変更できる'),
    }),
  },
  process: `

  `,
  response: AnnouncementSchema,
  error: {} as const,
} satisfies BackendApiDef;

export const deleteAnnouncementApi = {
  summary: 'お知らせ削除',
  description: 'お知らせ削除',
  method: ApiMethod.DELETE,
  path: '/admin/announcement/{announcement_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      announcement_id: AnnouncementSchema.shape.id,
    }),
  },
  process: `

  `,
  response: defOk('削除しました'),
  error: {} as const,
} satisfies BackendApiDef;
