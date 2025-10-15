import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOk } from '../../generator/util';
import { ProductSchema, StoreSchema } from 'backend-core';

extendZodWithOpenApi(z);

export const ochanokoEmailWebhookApi = {
  summary: 'おちゃのこのメールが届くエンドポイント',
  description: 'おちゃのこのメールのやつ',
  method: ApiMethod.POST,
  path: '/ochanoko/webhook',
  privileges: {
    role: [apiRole.bot, apiRole.pos],
  },
  request: {
    body: z.object({
      orderInfo: z.object({
        orderId: z.number().describe('注文番号'),
        storeEmail: z.string().describe('ストアのメールアドレス'),
        status: z.enum(['ordered', 'shipped']).describe('注文の状態'),
      }),
    }),
  },
  process: `
  `,
  response: defOk('メールの受信に成功しました'),
  error: {} as const,
} satisfies BackendApiDef;

export const createOchanokoProductCsvApi = {
  summary: 'おちゃのこ在庫作成用のCSV作成',
  description: 'おちゃのこ在庫作成用のCSV作成',
  method: ApiMethod.POST,
  path: '/store/{store_id}/ochanoko/product',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      productIds: z.array(ProductSchema.shape.id).describe('商品IDの配列'),
    }),
  },
  process: `

  `,
  response: z.object({
    fileUrl: z.string().describe('CSVのURL'),
    chunkCount: z.number().describe('CSVのチャンク数'),
  }),
  error: {} as const,
} satisfies BackendApiDef;
