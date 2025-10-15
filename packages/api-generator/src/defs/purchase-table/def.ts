import {
  Purchase_TableSchema,
  Purchase_Table_ItemSchema,
  Purchase_Table_Generated_ImageSchema,
  StoreSchema,
} from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOk } from '@/generator/util';

extendZodWithOpenApi(z);

export const createPurchaseTableApi = {
  summary: '買取表の作成',
  description: '買取表を作成する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/purchase-table',
  privileges: {
    role: [apiRole.pos],
    policies: ['list_purchase_table'],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      title: Purchase_TableSchema.shape.title.describe('タイトル'),
      format: Purchase_TableSchema.shape.format.describe('フォーマット'),
      order: Purchase_TableSchema.shape.order.describe('並び順'),
      show_store_name:
        Purchase_TableSchema.shape.show_store_name.describe(
          '店舗名を表示するか否か',
        ),
      show_title: z.boolean().optional().describe('タイトルを表示するか否か'),
      color: Purchase_TableSchema.shape.color
        .refine((v) => RegExp(/^#(?:[0-9a-fA-F]{3}){1,2}$/).test(v), {
          message: 'カラーコードの指定が不適切です',
        })
        .describe('色コード（HEX）'),
      custom_template_image_url:
        Purchase_TableSchema.shape.custom_template_image_url
          .optional()
          .describe('カスタムテンプレートを使う場合'),
      comment: z
        .string()
        // 改行コード考慮して少し増やしてる
        .max(65, { message: 'コメントは60文字以内で入力してください' })
        .optional()
        .describe('コメント 60文字まで'),

      background_text_color: Purchase_TableSchema.shape.background_text_color
        .optional()
        .describe('背景文字カラー（HEX）'),
      cardname_and_price_text_color:
        Purchase_TableSchema.shape.cardname_and_price_text_color
          .optional()
          .describe('カード名と価格の文字カラー（HEX）'),

      // 商品定義 ここでの並び順がそのまま買取表での順番になる
      items: z.array(
        z.object({
          item_id: Purchase_Table_ItemSchema.shape.item_id.describe('在庫ID'),
          display_price:
            Purchase_Table_ItemSchema.shape.display_price.describe('表示価格'),
          any_model_number:
            Purchase_Table_ItemSchema.shape.any_model_number.describe(
              '型番問わないかどうか',
            ),
          is_psa10: Purchase_Table_ItemSchema.shape.is_psa10
            .optional()
            .describe('PSA10のカードかどうか'),
        }),
      ),
    }),
  },
  response: z.object({
    purchaseTable: Purchase_TableSchema.extend({
      items: z.array(Purchase_Table_ItemSchema),
      generated_images: z
        .array(Purchase_Table_Generated_ImageSchema)
        .describe('完成した画像'),
    }),
  }),
  error: {
    invalidCustomTemplate: {
      status: 400,
      messageText: 'カスタムテンプレートの形式が不正です',
    },
  } as const,
} satisfies BackendApiDef;

export const getPurchaseTableApi = {
  summary: '買取表の取得',
  description: '買取表情報を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/purchase-table',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      take: z.coerce
        .number()
        .min(1)
        .max(100)
        .default(20)
        .optional()
        .describe('取得件数'),
      skip: z.coerce
        .number()
        .min(0)
        .default(0)
        .optional()
        .describe('スキップ件数'),
      search: z.string().optional().describe('タイトル検索文字列'),
    }),
  },
  response: z.object({
    purchaseTables: z.array(
      z.object({
        id: Purchase_TableSchema.shape.id,
        title: Purchase_TableSchema.shape.title,
        format: Purchase_TableSchema.shape.format,
        order: Purchase_TableSchema.shape.order,
        show_store_name: Purchase_TableSchema.shape.show_store_name,
        show_title: z.boolean().optional(),
        color: Purchase_TableSchema.shape.color,
        background_text_color: Purchase_TableSchema.shape.background_text_color,
        cardname_and_price_text_color:
          Purchase_TableSchema.shape.cardname_and_price_text_color,
        custom_template_image_url:
          Purchase_TableSchema.shape.custom_template_image_url,
        comment: Purchase_TableSchema.shape.comment,
        staff_account_id: Purchase_TableSchema.shape.staff_account_id,
        store_id: Purchase_TableSchema.shape.store_id,
        genre_handle: Purchase_TableSchema.shape.genre_handle,
        display_on_app: Purchase_TableSchema.shape.display_on_app,
        created_at: Purchase_TableSchema.shape.created_at,
        updated_at: Purchase_TableSchema.shape.updated_at,
        items: z.array(
          Purchase_Table_ItemSchema.extend({
            item: z
              .object({
                image_url: z.string().nullable().optional(),
                display_name: z.string().nullable().optional(),
              })
              .optional(),
          }),
        ),
        generated_images: z
          .array(Purchase_Table_Generated_ImageSchema)
          .describe('完成した画像'),
      }),
    ),
    totalCount: z.number().describe('総件数'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const deletePurchaseTableApi = {
  summary: '買取表を削除する',
  description: '買取表を削除する',
  method: ApiMethod.DELETE,
  path: '/store/{store_id}/purchase-table/{purchase_table_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      purchase_table_id: Purchase_TableSchema.shape.id,
    }),
  },
  process: `

  `,
  response: defOk('買取表を削除しました'),
  error: {} as const,
} satisfies BackendApiDef;

export const updatePurchaseTableApi = {
  summary: '買取表更新',
  description: '買取表更新',
  method: ApiMethod.PUT,
  path: '/store/{store_id}/purchase-table/{purchase_table_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      purchase_table_id: Purchase_TableSchema.shape.id,
    }),
    body: z.object({
      genre_handle: Purchase_TableSchema.shape.genre_handle.optional(),
      display_on_app: Purchase_TableSchema.shape.display_on_app.optional(),
      sendPushNotification: z
        .boolean()
        .optional()
        .describe('プッシュ通知を送信するかどうか display_on_app: trueと併用'),
    }),
  },
  process: `

  `,
  response: Purchase_TableSchema,
  error: {} as const,
} satisfies BackendApiDef;

export const getAllStorePurchaseTableByMycaUserApi = {
  summary: 'Mycaユーザーが買取表情報を取得',
  description: 'Mycaユーザーが買取表情報を取得',
  method: ApiMethod.GET,
  path: '/store/all/purchase-table',
  privileges: {
    role: [apiRole.mycaUser],
  },
  request: {
    query: z.object({
      genre_handle: z
        .string()
        .optional()
        .describe('ジャンルのハンドル名 OPやポケモンなど'),
      store_id: z.string().optional().describe('店舗ID カンマ区切りで複数'),
    }),
  },
  process: `

  `,
  response: z.object({
    purchaseTables: z.array(
      z.object({
        id: Purchase_TableSchema.shape.id,
        title: Purchase_TableSchema.shape.title,
        store_id: Purchase_TableSchema.shape.store_id,
        genre_handle: Purchase_TableSchema.shape.genre_handle,
        generated_images: z.array(Purchase_Table_Generated_ImageSchema),
        published_at: Purchase_TableSchema.shape.published_at,
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;
