import { LossSchema, StoreSchema } from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOk } from '@/generator/util';

extendZodWithOpenApi(z);

export const rollbackLossApi = {
  summary: 'ロスの取り消し',
  description: 'ロスの取り消し',
  method: ApiMethod.POST,
  path: '/store/{store_id}/loss/{loss_id}/rollback',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      loss_id: LossSchema.shape.id,
    }),

    body: z.object({
      description: z.string().optional(),
    }),
  },
  process: `

  `,
  response: defOk('ロスの取り消しが完了しました'),
  error: {} as const,
} satisfies BackendApiDef;

export const getLossCsvApi = {
  summary: 'ロスのCSV出力',
  description: 'ロスのCSVを出力する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/loss/csv',
  privileges: { role: [apiRole.pos] },
  request: {
    params: z.object({ store_id: StoreSchema.shape.id }),
    query: z.object({
      target_day_gte: z
        .date()
        .optional()
        .describe('対象日がこの日以降（この日を含める）'),
      target_day_lte: z
        .date()
        .optional()
        .describe('対象日がこの日以前（この日を含める）'),
      staff_id: z.number().optional(),
      loss_genre_id: z.number().optional(),
      loss_category_id: z.number().optional(),
    }),
  },
  process: `
  
  `,
  response: z.object({ fileUrl: z.string() }),
  error: {} as const,
} satisfies BackendApiDef;
