import {
  AccountSchema,
  CorporationSchema,
  Item_Category_Condition_Option_MappingSchema,
  Item_Category_MappingSchema,
  Item_Genre_MappingSchema,
  Specialty_MappingSchema,
  Store_RelationSchema,
  StoreSchema,
} from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const createStoreApi = {
  summary: 'ストア作成',
  description: '店舗を作成する（管理用）',
  method: ApiMethod.POST,
  path: '/store',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    body: z.object({
      email: AccountSchema.shape.email.describe(
        '店舗アカウントのメールアドレス（ログイン用）',
      ),
      corporation_id: CorporationSchema.shape.id.describe(
        '管理用なので、ここで結びつける法人のIDも指定できるようにする',
      ),
    }),
  },
  process: ``,
  response: z.object({
    account: AccountSchema.merge(
      z.object({
        stores: z.array(
          z.object({
            store: StoreSchema,
          }),
        ),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const activateStoreApi = {
  summary: 'ストアアクティベート',
  description: '店舗アカウントを有効化する',
  method: ApiMethod.POST,
  path: '/store/activate',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    body: z.object({
      code: StoreSchema.shape.code.describe('店舗コード'),
      password: z.string().describe('店舗アカウントの新規パスワード'),
    }),
  },
  process: ``,
  response: z.object({
    store: StoreSchema,
  }),
  error: {} as const,
} satisfies BackendApiDef;

//所属店舗でなくとも、同法人内であれば取得できる
export const getAllStoreApi = {
  summary: '法人内の全ての店舗を取得',
  description: '法人内の全ての店舗を取得',
  method: ApiMethod.GET,
  path: '/store/all',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    // query: z.object({
    //   myca_genre_id: z
    //     .number()
    //     .optional()
    //     .describe('Mycaのジャンルから追加する場合、そのIDを指定する'),
    //   display_name: Item_GenreSchema.shape.display_name.optional(),
    // }),
  },
  process: `

  `,
  response: z.object({
    stores: z.array(
      z.object({
        id: StoreSchema.shape.id,
        display_name: StoreSchema.shape.display_name,
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getRelationToStoreApi = {
  summary: '店舗間の関係情報を取得する',
  description: '店舗間の関係情報を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/relation-to-store',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      mapping_defined: Store_RelationSchema.shape.mapping_defined
        .optional()
        .describe('マッピングが定義されているかどうか（店舗間在庫移動用）'),
      includesMapping: z
        .boolean()
        .optional()
        .describe('マッピング情報も含めて取得するかどうか'),
    }),
  },
  process: `

  `,
  response: z.object({
    storeRelations: z.array(
      Store_RelationSchema.merge(
        z.object({
          to_store: z.object({
            display_name:
              StoreSchema.shape.display_name.describe('マッピング先の店舗名'),
          }),

          //以下、includesMappingがtrueの場合のみ取得する
          category_mappings: z.array(Item_Category_MappingSchema).optional(),
          condition_option_mappings: z
            .array(Item_Category_Condition_Option_MappingSchema)
            .optional(),
          genre_mappings: z.array(Item_Genre_MappingSchema).optional(),
          specialty_mappings: z.array(Specialty_MappingSchema).optional(),
        }),
      ),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;
