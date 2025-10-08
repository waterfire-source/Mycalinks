import {
  CustomerSchema,
  Item_Category_Condition_OptionSchema,
  ItemSchema,
  ProductSchema,
  Reservation_Reception_ProductSchema,
  Reservation_ReceptionSchema,
  ReservationSchema,
  StoreSchema,
} from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOk, defOrderBy, defPagination } from '@/generator/util';

extendZodWithOpenApi(z);

export const createReservationApi = {
  summary: '予約を作成する',
  description: '予約を作成する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/reservation',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      product_id: ReservationSchema.shape.product_id,
      limit_count: ReservationSchema.shape.limit_count,
      limit_count_per_user: ReservationSchema.shape.limit_count_per_user,
      start_at: ReservationSchema.shape.start_at,
      end_at: ReservationSchema.shape.end_at,
      deposit_price: ReservationSchema.shape.deposit_price,
      remaining_price: ReservationSchema.shape.remaining_price,
      description: ReservationSchema.shape.description.optional(),
    }),
  },
  process: `

  `,
  response: ReservationSchema,
  error: {} as const,
} satisfies BackendApiDef;

export const updateReservationApi = {
  summary: '予約の更新',
  description: '予約の更新',
  method: ApiMethod.PUT,
  path: '/store/{store_id}/reservation/{reservation_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      reservation_id: ReservationSchema.shape.id,
    }),

    body: z.object({
      limit_count: ReservationSchema.shape.limit_count.optional(),
      limit_count_per_user:
        ReservationSchema.shape.limit_count_per_user.optional(),
      start_at: ReservationSchema.shape.start_at.optional(),
      end_at: ReservationSchema.shape.end_at.optional(),
      deposit_price: ReservationSchema.shape.deposit_price.optional(),
      remaining_price: ReservationSchema.shape.remaining_price.optional(),
      description: ReservationSchema.shape.description.optional(),
      status: ReservationSchema.shape.status
        .optional()
        .describe('予約のステータスを更新する ここで削除もできる'),
    }),
  },
  process: `

  `,
  response: ReservationSchema,
  error: {} as const,
} satisfies BackendApiDef;

export const deleteReservationApi = {
  summary: '予約の削除',
  description: '予約の削除（開始前のみ）',
  method: ApiMethod.DELETE,
  path: '/store/{store_id}/reservation/{reservation_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      reservation_id: ReservationSchema.shape.id,
    }),
  },
  process: `

  `,
  response: defOk('予約を削除しました'),
  error: {} as const,
} satisfies BackendApiDef;

export const getReservationApi = {
  summary: '予約取得',
  description: '予約取得',
  method: ApiMethod.GET,
  path: '/store/{store_id}/reservation',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      id: ReservationSchema.shape.id.optional(),
      status: ReservationSchema.shape.status.optional(),
      product_display_name: ProductSchema.shape.display_name
        .optional()
        .describe('商品名で絞り込み'),
      ...defPagination(),
      ...defOrderBy({
        release_date: '発売日',
        product_display_name: '商品名',
      }),

      includesSummary: z
        .boolean()
        .optional()
        .describe('合計数などを取得するかどうか'),
    }),
  },
  process: `

  `,
  response: z.object({
    reservations: z.array(
      ReservationSchema.extend({
        product: ProductSchema.extend({
          displayNameWithMeta: z.string(),
          condition_option: z.object({
            display_name:
              Item_Category_Condition_OptionSchema.shape.display_name,
          }),
          item: ItemSchema.describe('商品マスタ情報'),
        }),
      }),
    ),
    summary: z.object({
      totalCount: z.number().describe('合計件数'),
    }),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getReservationReceptionApi = {
  summary: '予約の受付を取得する',
  description: '予約の受付を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/reservation/{reservation_id}/reception',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      reservation_id: ReservationSchema.shape.id,
    }),
    query: z.object({
      includesCustomerInfo: z.boolean().optional().describe('顧客情報を含める'),
    }),
  },
  process: `

  `,
  response: z.object({
    receptions: z.array(
      Reservation_Reception_ProductSchema.extend({
        customer: CustomerSchema.optional(),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getCustomerReservationReceptionApi = {
  summary: '顧客の予約受付情報を取得する',
  description: '顧客の予約受付情報を取得する お渡ししてないもののみを取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/customer/reservation-reception',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      customer_id: Reservation_ReceptionSchema.shape.customer_id.optional(),
      customer_name: z.string().optional().describe('顧客名で絞り込み'),
      reservation_id: Reservation_Reception_ProductSchema.shape.id.optional(),
      reservation_reception_id:
        Reservation_Reception_ProductSchema.shape.reservation_reception_id.optional(),
      ...defPagination(),
    }),
  },
  process: `

  `,
  response: z.object({
    //[TODO] 若干オーバーフェッチ気味なので見直したい
    customers: z.array(
      CustomerSchema.extend({
        reservation_reception_products: z.array(
          Reservation_Reception_ProductSchema.extend({
            deposit_transaction_cart: z
              .array(
                z.object({
                  transaction_id: z.string(),
                }),
              )
              .nullable(),
            reservation: z.object({
              id: ReservationSchema.shape.id,
              status: ReservationSchema.shape.status,
              deposit_price: ReservationSchema.shape.deposit_price,
              remaining_price: ReservationSchema.shape.remaining_price,
              product: ProductSchema.extend({
                displayNameWithMeta: z.string(),
                condition_option: z.object({
                  display_name:
                    Item_Category_Condition_OptionSchema.shape.display_name,
                }),
                item: ItemSchema.describe('商品マスタ情報'),
              }),
            }),
          }),
        ),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getCustomerReservationReceptionReceiptApi = {
  summary: '顧客ごとの特定の予約の予約票を印刷するためのコマンド',
  description: '顧客ごとの特定の予約の予約票を印刷するためのコマンド',
  method: ApiMethod.GET,
  path: '/store/{store_id}/customer/reservation-reception/receipt',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      reservation_reception_product_id:
        Reservation_Reception_ProductSchema.shape.id,
    }),
  },
  process: `

  `,
  response: z.object({
    receiptCommand: z.string().describe('予約票を印刷するためのコマンド'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const createCustomerReservationReceptionApi = {
  summary: '顧客の予約を作成する',
  description: '顧客の予約を作成する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/customer/reservation-reception',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      customer_id: Reservation_ReceptionSchema.shape.customer_id,
      reservations: z.array(
        z.object({
          reservation_id: ReservationSchema.shape.id,
          item_count: Reservation_Reception_ProductSchema.shape.item_count,
        }),
      ),
    }),
  },
  process: `

  `,
  response: Reservation_ReceptionSchema.extend({
    products: z.array(Reservation_Reception_ProductSchema),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getReservationReceptionByMycaUserApi = {
  summary: 'Mycaユーザー自身の予約受付情報を取得',
  description: 'Mycaユーザー自身の予約受付情報を取得',
  method: ApiMethod.GET,
  path: '/store/all/reservation/reception',
  privileges: {
    role: [apiRole.mycaUser],
  },
  request: {
    query: z.object({
      store_id: StoreSchema.shape.id.optional().describe('店舗ID 絞り込み用'),
      ...defPagination(),
    }),
  },
  process: `

  `,
  response: z.object({
    reservationReceptionProducts: z.array(
      z.object({
        id: Reservation_Reception_ProductSchema.shape.id.describe('予約票ID'),
        reservation: z.object({
          store_id: ReservationSchema.shape.store_id.describe('店舗ID'),
          product: z.object({
            id: ProductSchema.shape.id,
            image_url: ProductSchema.shape.image_url,
            displayNameWithMeta: z
              .string()
              .optional()
              .describe('メタ情報付き商品名'),
            item: z.object({
              release_date: ItemSchema.shape.release_date.describe('発売日'),
            }),
          }),
          deposit_price: ReservationSchema.shape.deposit_price.describe('前金'),
          remaining_price:
            ReservationSchema.shape.remaining_price.describe('残金'),
          description: ReservationSchema.shape.description.describe('備考'),
        }),
        item_count:
          Reservation_Reception_ProductSchema.shape.item_count.describe('数'),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;
