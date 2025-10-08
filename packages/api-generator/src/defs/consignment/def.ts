import {
  Consignment_ClientSchema,
  Item_CategorySchema,
  Item_GenreSchema,
  ProductSchema,
  StoreSchema,
} from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOk, defOrderBy, defPagination } from '@/generator/util';

extendZodWithOpenApi(z);

export const createOrUpdateConsignmentClientApi = {
  summary: '委託主を作成・更新する',
  description: '委託主を作成・更新する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/consignment/client',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    body: z.object({
      id: Consignment_ClientSchema.shape.id
        .optional()
        .describe('委託主ID 更新する場合指定する'),
      full_name: Consignment_ClientSchema.shape.full_name
        .describe('委託主名 新規作成時は必要')
        .optional(),
      zip_code: Consignment_ClientSchema.shape.zip_code
        .describe('郵便番号')
        .optional(),
      prefecture: Consignment_ClientSchema.shape.prefecture
        .describe('都道府県')
        .optional(),
      city: Consignment_ClientSchema.shape.city.describe('市区町村').optional(),
      address2: Consignment_ClientSchema.shape.address2
        .describe('以降の住所')
        .optional(),
      building: Consignment_ClientSchema.shape.building
        .describe('建物名')
        .optional(),
      phone_number: Consignment_ClientSchema.shape.phone_number
        .describe('電話番号')
        .optional(),
      fax_number: Consignment_ClientSchema.shape.fax_number
        .describe('FAX番号')
        .optional(),
      email: Consignment_ClientSchema.shape.email
        .describe('メールアドレス')
        .optional(),
      commission_cash_price:
        Consignment_ClientSchema.shape.commission_cash_price
          .describe('手数料（現金）')
          .optional(),
      commission_card_price:
        Consignment_ClientSchema.shape.commission_card_price
          .describe('手数料（カード）')
          .optional(),
      commission_payment_method:
        Consignment_ClientSchema.shape.commission_payment_method
          .describe('手数料支払い方法')
          .optional(),
      payment_cycle: Consignment_ClientSchema.shape.payment_cycle
        .describe('支払いサイクル')
        .optional(),
      description: Consignment_ClientSchema.shape.description
        .describe('備考')
        .optional(),
      enabled: Consignment_ClientSchema.shape.enabled
        .describe('有効かどうか')
        .optional(),
      display_name_on_receipt:
        Consignment_ClientSchema.shape.display_name_on_receipt
          .describe('レシートに委託者名を表示するかどうか')
          .optional(),
      bank_info_json: z.any().optional().describe('銀行情報'),
      display_name: Consignment_ClientSchema.shape.display_name.optional(),
    }),
  },
  process: `

  `,
  response: z.object({
    ...Consignment_ClientSchema.shape,
    bank_info_json: z.any().describe('銀行情報'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getConsignmentClientApi = {
  summary: '委託主取得',
  description: '委託主取得',
  method: ApiMethod.GET,
  path: '/store/{store_id}/consignment/client',
  privileges: {
    role: [apiRole.pos, apiRole.everyone],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      enabled: Consignment_ClientSchema.shape.enabled.optional(),
      productName: z.string().optional().describe('商品名'),
      consignment_client_full_name: Consignment_ClientSchema.shape.full_name
        .optional()
        .describe('委託主名'),
      includesSummary: z
        .boolean()
        .optional()
        .describe('合計件数を含めるかどうか'),
      ...defPagination(),
    }),
  },
  process: `

  `,
  response: z.object({
    consignmentClients: z.array(
      z.object({
        ...Consignment_ClientSchema.shape,
        bank_info_json: z.any().describe('銀行情報'),
        summary: z.object({
          totalSalePrice: z
            .number()
            .describe('この委託者の売り上げ総額')
            .optional(),
          totalSaleItemCount: z.number().describe('販売点数'),
          totalStockNumber: z.number().describe('残点数'),
          totalCommissionPrice: z.number().describe('この委託者の手数料総額'),
        }),
      }),
    ),
    summary: z.object({
      totalCount: z.number().describe('合計件数'),
    }),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const deleteConsignmentClientApi = {
  summary: '委託主削除',
  description: '委託主削除',
  method: ApiMethod.DELETE,
  path: '/store/{store_id}/consignment/client/{consignment_client_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      consignment_client_id: Consignment_ClientSchema.shape.id,
    }),
  },
  process: `
  削除は論理削除で実行 削除する時に委託主の名前を変更する
  `,
  response: defOk('委託主を削除しました'),
  error: {} as const,
} satisfies BackendApiDef;

export const getConsignmentProductApi = {
  summary: '委託在庫取得',
  description: '委託在庫取得',
  method: ApiMethod.GET,
  path: '/store/{store_id}/product/consignment',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),

    query: z.object({
      genre_id: Item_GenreSchema.shape.id.optional().describe('ジャンルID'),
      category_id: Item_CategorySchema.shape.id
        .optional()
        .describe('カテゴリID'),
      display_name: z.string().optional().describe('商品名'),
      consignment_client_full_name: Consignment_ClientSchema.shape.full_name
        .optional()
        .describe('委託主名'),
      ...defOrderBy({
        display_name: '商品名',
        consignment_client_full_name: '委託主名',
        stock_number: '在庫数',
      }),
      ...defPagination(),
      includesSummary: z
        .boolean()
        .optional()
        .describe('合計件数を含めるかどうか'),
    }),
  },
  process: `

  `,
  response: z.object({
    products: z.array(
      ProductSchema.extend({
        displayNameWithMeta: z.string().describe('表示名（メタ情報付き）'),
        totalSalePrice: z.number().describe('この商品の売り上げ総額'),
        consignment_client: z
          .object({
            id: Consignment_ClientSchema.shape.id,
            full_name: Consignment_ClientSchema.shape.full_name,
          })
          .nullable(),
      }),
    ),
    summary: z
      .object({
        totalCount: z.number().describe('合計件数'),
      })
      .optional(),
  }),
  error: {} as const,
} satisfies BackendApiDef;

//もしかしたら入荷機能とかと統合するかも
export const stockConsignmentClientProductApi = {
  summary: '委託在庫補充',
  description: '委託在庫補充',
  method: ApiMethod.POST,
  path: '/store/{store_id}/consignment/client/{consignment_client_id}/stock-products',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      consignment_client_id: Consignment_ClientSchema.shape.id,
    }),
    body: z.object({
      products: z.array(
        z.object({
          product_id: ProductSchema.shape.id.describe('在庫ID'),
          item_count: z.number().describe('仕入れ数'),
        }),
      ),
    }),
  },
  process: `
  今の所、作成履歴レコード（パック開封と同じようなやつ）のようなものは作らないことにする
  `,
  response: defOk('在庫を補充しました'),
  error: {} as const,
} satisfies BackendApiDef;
