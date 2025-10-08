import { StoreSchema, ProductSchema } from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const getShopifyOAuthUrlApi = {
  summary: 'Shopify OAuth同意URL取得',
  description: 'Shopify OAuth連携のための同意画面URLを取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/shopify/oauth/url',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      shopDomain: z
        .string()
        .describe('Shopifyのドメイン: mycalinkspostest.myshopify.comみたいな'),
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
  error: {} as const,
} satisfies BackendApiDef;

export const createShopifyProductApi = {
  summary: 'Shopifyに在庫を作成する',
  description: 'Shopifyに在庫を作成する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/shopify/product',
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
    shopifyProducts: z.array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        inventoryItemId: z.string(),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getShopifyLocationApi = {
  summary: 'Shopifyの店舗一覧取得',
  description: 'Shopifyの店舗一覧取得',
  method: ApiMethod.GET,
  path: '/store/{store_id}/shopify/location',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
  },
  process: `

  `,
  response: z.object({
    id: z.string(),
    name: z.string(),
    isActive: z.boolean(),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getShopifyProductCsvApi = {
  summary: 'Shopify上の全在庫のCSVを取得',
  description: 'Shopify上の全在庫のCSVを取得',
  method: ApiMethod.GET,
  path: '/store/{store_id}/shopify/product/csv',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
  },
  process: `

  `,
  response: z.object({
    fileUrl: z.string().describe('CSVのURL'),
  }),
  error: {} as const,
} satisfies BackendApiDef;
