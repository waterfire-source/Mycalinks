import {
  CustomerSchema,
  Customer_Point_HistorySchema,
  StoreSchema,
} from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const changeCustomerPointApi = {
  summary: '顧客ポイント変動',
  description: '特定顧客のポイントを手動で増減させる',
  method: ApiMethod.PUT,
  path: '/store/{store_id}/customer/{customer_id}/point',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      customer_id: CustomerSchema.shape.id,
    }),
    body: z.object({
      changeAmount: z
        .number()
        .refine((v) => v !== 0, { message: '増減数は0以外を指定してください' })
        .describe('ポイントの変動量'),
    }),
  },
  process: ``,
  response: z.object({
    pointHistory: Customer_Point_HistorySchema,
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const updateCustomerApi = {
  summary: '顧客情報更新',
  description: '顧客情報を更新する',
  method: ApiMethod.PUT,
  path: '/store/{store_id}/customer/{customer_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      customer_id: CustomerSchema.shape.id.describe('顧客ID'),
    }),
    body: z.object({
      memo: CustomerSchema.shape.memo
        .optional()
        .refine((v) => !v || String(v).length < 5000, {
          message: 'メモは5000文字以内で入力してください',
        })
        .describe('顧客メモ'),
    }),
  },
  process: ``,
  response: z.object({
    customer: CustomerSchema,
  }),
  error: {} as const,
} satisfies BackendApiDef;
