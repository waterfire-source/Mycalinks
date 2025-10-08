import {
  Location_ProductSchema,
  StoreSchema,
  LocationSchema,
} from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defPagination } from '@/generator/util';
extendZodWithOpenApi(z);

export const createOrUpdateLocationApi = {
  summary: 'ロケーション作成・更新',
  description: 'ロケーション作成・更新',
  method: ApiMethod.POST,
  path: '/store/{store_id}/location',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      id: LocationSchema.shape.id.optional().describe('更新用のID'),
      display_name: LocationSchema.shape.display_name.optional(),
      description: LocationSchema.shape.description.optional(),
      products: z
        .array(
          z.object({
            product_id: Location_ProductSchema.shape.product_id,
            item_count: Location_ProductSchema.shape.item_count,
          }),
        )
        .describe('在庫定義'),
    }),
  },
  process: `

  `,
  response: LocationSchema.extend({
    products: z.array(Location_ProductSchema),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const releaseLocationApi = {
  summary: 'ロケーションを解放させる',
  description: 'ロケーションを解放させる',
  method: ApiMethod.POST,
  path: '/store/{store_id}/location/{location_id}/release',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      location_id: LocationSchema.shape.id,
    }),
    body: z.object({
      actual_sales: LocationSchema.shape.actual_sales,
      products: z.array(
        z
          .object({
            product_id: Location_ProductSchema.shape.product_id,
            item_count: Location_ProductSchema.shape.item_count,
          })
          .describe('残っていた在庫'),
      ),
    }),
  },
  process: `

  `,
  response: LocationSchema.extend({
    products: z.array(Location_ProductSchema),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getLocationApi = {
  summary: 'ロケーションを取得',
  description: 'ロケーションを取得',
  method: ApiMethod.GET,
  path: '/store/{store_id}/location',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      id: LocationSchema.shape.id.optional(),
      status: LocationSchema.shape.status.optional(),
      ...defPagination(),
    }),
  },
  process: `

  `,
  response: z.object({
    locations: z.array(
      LocationSchema.extend({
        products: z.array(Location_ProductSchema),
      }),
    ),
    totalCount: z.number().describe('総件数（ページネーション用）'),
  }),
  error: {} as const,
} satisfies BackendApiDef;
