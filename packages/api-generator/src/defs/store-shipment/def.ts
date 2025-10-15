import {
  Consignment_Client_MappingSchema,
  Consignment_ClientSchema,
  Item_Category_Condition_Option_MappingSchema,
  Item_Category_Condition_OptionSchema,
  Item_Category_MappingSchema,
  Item_CategorySchema,
  Item_Genre_MappingSchema,
  Item_GenreSchema,
  Specialty_MappingSchema,
  SpecialtySchema,
  Stocking_ProductSchema,
  StockingSchema,
  Store_RelationSchema,
  Store_Shipment_ProductSchema,
  Store_ShipmentSchema,
  StoreSchema,
} from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOk, defPagination } from '@/generator/util';

extendZodWithOpenApi(z);

export const setStoreShipmentMappingApi = {
  summary: '店舗間在庫移動のマッピング定義API',
  description: '店舗間在庫移動のマッピング定義API',
  method: ApiMethod.POST,
  path: '/store/{store_id}/store-shipment/mapping',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      to_store_id: StoreSchema.shape.id.describe('マッピング先の店舗ID'),
      mappings: z
        .object({
          category: z.array(
            z.object({
              from_category_id:
                Item_CategorySchema.shape.id.describe(
                  'マッピング元のカテゴリID',
                ),
              to_category_id:
                Item_CategorySchema.shape.id.describe(
                  'マッピング先のカテゴリID',
                ),
            }),
          ),
          genre: z.array(
            z.object({
              from_genre_id:
                Item_GenreSchema.shape.id.describe('マッピング元のジャンルID'),
              to_genre_id:
                Item_GenreSchema.shape.id.describe('マッピング先のジャンルID'),
            }),
          ),
          specialty: z.array(
            z.object({
              from_specialty_id:
                SpecialtySchema.shape.id.describe(
                  'マッピング元のスペシャリティID',
                ),
              to_specialty_id:
                SpecialtySchema.shape.id.describe(
                  'マッピング先のスペシャリティID',
                ),
            }),
          ),
          condition_option: z.array(
            z.object({
              from_option_id:
                Item_Category_Condition_OptionSchema.shape.id.describe(
                  'マッピング元の状態オプションID',
                ),
              to_option_id:
                Item_Category_Condition_OptionSchema.shape.id.describe(
                  'マッピング先の状態オプションID',
                ),
            }),
          ),
          consignment_client: z.array(
            z.object({
              from_client_id:
                Consignment_ClientSchema.shape.id.describe(
                  'マッピング元の委託主ID',
                ),
              to_client_id:
                Consignment_ClientSchema.shape.id.describe(
                  'マッピング先の委託主ID',
                ),
            }),
          ),
        })
        .describe(
          'マッピング定義 独自カテゴリが存在しないなど、マッピングが必要ない時は空配列',
        ),
    }),
  },
  process: `

  `,
  response: Store_RelationSchema.extend({
    category_mappings: z.array(Item_Category_MappingSchema),
    condition_option_mappings: z.array(
      Item_Category_Condition_Option_MappingSchema,
    ),
    genre_mappings: z.array(Item_Genre_MappingSchema),
    specialty_mappings: z.array(Specialty_MappingSchema),
    consignment_client_mappings: z.array(Consignment_Client_MappingSchema),
  }).describe('店舗間関係性の定義'),
  error: {} as const,
} satisfies BackendApiDef;

export const createOrUpdateStoreShipmentApi = {
  summary: '出荷の登録・更新',
  description: '出荷の登録・更新',
  method: ApiMethod.POST,
  path: '/store/{store_id}/store-shipment',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      id: Store_ShipmentSchema.shape.id.optional().describe('更新時に必要'),
      to_store_id: Store_ShipmentSchema.shape.to_store_id
        .optional()
        .describe('出荷先の店舗ID'),
      shipment_date: Store_ShipmentSchema.shape.shipment_date
        .optional()
        .describe('出荷日'),
      description: Store_ShipmentSchema.shape.description
        .optional()
        .describe('備考'),
      total_wholesale_price: Store_ShipmentSchema.shape.total_wholesale_price
        .optional()
        .describe('合計仕入れ値'),
      products: z
        .array(
          z.object({
            product_id:
              Store_Shipment_ProductSchema.shape.product_id.describe('商品ID'),
            item_count:
              Store_Shipment_ProductSchema.shape.item_count.describe('出荷数'),
          }),
        )
        .describe('ここは毎回指定が必要'),
    }),
  },
  process: `

  `,
  response: Store_ShipmentSchema.extend({
    products: z.array(Store_Shipment_ProductSchema),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const applyStoreShipmentApi = {
  summary: '出荷を確定する',
  description: '出荷を確定する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/store-shipment/{store_shipment_id}/apply',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      store_shipment_id: Store_ShipmentSchema.shape.id,
    }),
  },
  process: `

  `,
  response: z.object({
    storeShipment: Store_ShipmentSchema.extend({
      products: z.array(Store_Shipment_ProductSchema),
    }),
    stocking: StockingSchema.extend({
      stocking_products: z.array(Stocking_ProductSchema),
    }),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const cancelStoreShipmentApi = {
  summary: '出荷をキャンセルする',
  description: '出荷をキャンセルする',
  method: ApiMethod.POST,
  path: '/store/{store_id}/store-shipment/{store_shipment_id}/cancel',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      store_shipment_id: Store_ShipmentSchema.shape.id,
    }),
  },
  process: `

  下書きの出荷のみキャンセルすることができる
  出荷済みおよび納品済みの出荷についてはキャンセルすることができない
  `,
  response: defOk('出荷がキャンセルされました'),
  error: {} as const,
} satisfies BackendApiDef;

export const rollbackStoreShipmentApi = {
  summary: '出荷を取り消す',
  description: '出荷を取り消す',
  method: ApiMethod.POST,
  path: '/store/{store_id}/store-shipment/{store_shipment_id}/rollback',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      store_shipment_id: Store_ShipmentSchema.shape.id,
    }),
  },
  process: `
  出荷を取り消す時に、在庫情報などをロールバックする
  納品済みの出荷については取り消すことができない
  `,
  response: defOk('出荷が取り消されました'),
  error: {} as const,
} satisfies BackendApiDef;

export const reshipStoreShipmentApi = {
  summary: 'キャンセル済み出荷を下書き状態に戻す（再出荷）',
  description: 'キャンセル済み出荷を下書き状態に戻す（再出荷）',
  method: ApiMethod.POST,
  path: '/store/{store_id}/store-shipment/{store_shipment_id}/reship',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      store_shipment_id: Store_ShipmentSchema.shape.id,
    }),
  },
  process: `
  キャンセル済みの出荷のみ下書き状態に戻すことができる
  出荷済みおよび納品済みの出荷については再出荷することができない
  ステータスをCANCELEDからNOT_YETに変更する
  `,
  response: z.object({
    storeShipment: Store_ShipmentSchema.extend({
      products: z.array(Store_Shipment_ProductSchema),
    }),
  }).describe('下書き状態に戻された出荷情報'),
  error: {} as const,
} satisfies BackendApiDef;

export const getStoreShipmentApi = {
  summary: '出荷の取得',
  description: '出荷の取得',
  method: ApiMethod.GET,
  path: '/store/{store_id}/store-shipment',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      id: Store_ShipmentSchema.shape.id.optional(),
      to_store_id: Store_ShipmentSchema.shape.to_store_id.optional(),
      status: Store_ShipmentSchema.shape.status.optional(),
      shipment_date_gte: z.date().optional().describe('出荷日の範囲 開始'),
      shipment_date_lt: z.date().optional().describe('出荷日の範囲 終了'),
      staff_account_id: Store_ShipmentSchema.shape.staff_account_id
        .optional()
        .describe('担当者ID'),
      name: z.string().optional().describe('文字列検索'),
      ...defPagination(),
    }),
  },
  process: `

  `,
  response: z.object({
    storeShipments: z.array(
      Store_ShipmentSchema.extend({
        products: z.array(Store_Shipment_ProductSchema),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;
