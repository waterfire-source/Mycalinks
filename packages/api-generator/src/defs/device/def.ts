import { DeviceSchema, StoreSchema } from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOk } from '@/generator/util';

extendZodWithOpenApi(z);
export const registerDeviceApi = {
  summary: 'デバイスを登録',
  description: 'デバイスを登録',
  method: ApiMethod.POST,
  path: '/store/{store_id}/device',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      type: DeviceSchema.shape.type,
    }),
  },
  process: `

  `,
  response: DeviceSchema.describe('ID確認用'),
  error: {} as const,
} satisfies BackendApiDef;

export const getDeviceApi = {
  summary: 'デバイスを取得',
  description: 'デバイスを取得',
  method: ApiMethod.GET,
  path: '/store/{store_id}/device',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      type: DeviceSchema.shape.type.optional().describe('デバイスの種類'),
    }),
  },
  process: `

  `,
  response: z.object({
    devices: z.array(DeviceSchema),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const sendCommandToReceiptPrinterApi = {
  summary: 'レシートプリンターにコマンドを送信',
  description: 'レシートプリンターにコマンドを送信',
  method: ApiMethod.POST,
  path: '/store/{store_id}/device/receipt-printer/send-command',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      eposCommand: z.string().describe('EPOSコマンド'),
    }),
  },
  process: `

  `,
  response: defOk('コマンドを送信しました'),
  error: {} as const,
} satisfies BackendApiDef;
