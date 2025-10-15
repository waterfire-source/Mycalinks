import { StoreSchema } from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const getSquareOAuthUrlApi = {
  summary: 'Square OAuth同意URL取得',
  description: 'Square OAuth連携のための同意画面URLを取得する',
  method: ApiMethod.GET,
  path: '/square/oauth/url',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    query: z.object({
      succeedCallbackUrl: z
        .string()
        .optional()
        .describe('成功した時の遷移先URL'),
      failedCallbackUrl: z
        .string()
        .optional()
        .describe('失敗した時の遷移先URL'),
    }),
  },
  process: `
  stateも発行してそれをクッキーに保存しつつ、oauth同意画面用のURLを発行
  `,
  response: z.object({
    url: z.string(),
  }),
  error: {
    alreadyAvailable: {
      status: 400,
      messageText: 'この法人ではすでにSquare連携設定が済んでいます',
    },
  } as const,
} satisfies BackendApiDef;

export const getSquareLocationsApi = {
  summary: 'Square店舗一覧取得',
  description: 'Square連携している店舗一覧を取得する',
  method: ApiMethod.GET,
  path: '/square/location',
  privileges: {
    role: [apiRole.pos],
  },
  request: {},
  process: ``,
  response: z.object({
    locations: z.array(
      z.object({
        id: z.string().describe('SquareのlocationId'),
        name: z.string().describe('店舗名'),
        createdAt: z.string(),
        pos_store_id: StoreSchema.shape.id
          .nullable()
          .describe('POS上の店舗ID（すでに結び付けられていた場合）'),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;
