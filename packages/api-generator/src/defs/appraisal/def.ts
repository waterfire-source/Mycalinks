import {
  AppraisalSchema,
  Appraisal_ProductSchema,
  Item_Category_Condition_OptionSchema,
  ProductSchema,
  SpecialtySchema,
  StoreSchema,
} from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOk, defPagination } from '@/generator/util';

extendZodWithOpenApi(z);

export const createAppraisalApi = {
  summary: '鑑定作成',
  description: '鑑定を作成する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/appraisal',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      description: AppraisalSchema.shape.description
        .optional()
        .describe('備考 変更する時だけ指定する'),
      shipping_fee: AppraisalSchema.shape.shipping_fee
        .optional()
        .describe('送料 変更する時だけ指定する'),
      insurance_fee: AppraisalSchema.shape.insurance_fee
        .optional()
        .describe('保険料 変更する時だけ指定する'),
      handling_fee: AppraisalSchema.shape.handling_fee
        .optional()
        .describe('事務手数料 変更する時だけ指定する'),
      other_fee: AppraisalSchema.shape.other_fee
        .optional()
        .describe('その他の費用 変更する時だけ指定する'),
      appraisal_fee: AppraisalSchema.shape.appraisal_fee
        .refine((e) => e >= 0, {
          message: '鑑定費用は0以上の整数で指定する必要があります',
        })
        .describe('合計鑑定料'),
      products: z
        .array(
          z.object({
            product_id: Appraisal_ProductSchema.shape.product_id,
            item_count: z
              .number()
              .refine((e) => e > 0, {
                message:
                  '鑑定対象商品数は0より大きい値で指定しないといけません',
              })
              .describe('個数'),
          }),
        )
        .describe('鑑定に出す在庫のリスト'),
    }),
  },
  process: ``,
  response: AppraisalSchema.merge(
    z.object({
      products: z.array(Appraisal_ProductSchema),
    }),
  ).describe('作られた鑑定の情報'),
  error: {} as const,
} satisfies BackendApiDef;

export const inputAppraisalResultApi = {
  summary: '鑑定結果入力',
  description: '鑑定結果を入力する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/appraisal/{appraisal_id}/result',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      appraisal_id:
        AppraisalSchema.shape.id.describe('結果入力対象のappraisalId'),
    }),
    body: z.object({
      products: z
        .array(
          z.object({
            id: Appraisal_ProductSchema.shape.id.describe('結果入力するID'),
            specialty_id: Appraisal_ProductSchema.shape.specialty_id
              .describe(
                '鑑定結果（スペシャルティID） nullだったら鑑定として登録しないことになる',
              )
              .nullable(),
            appraisal_number: Appraisal_ProductSchema.shape.appraisal_number
              .optional()
              .describe('鑑定番号 任意'),
            sell_price: Appraisal_ProductSchema.shape.sell_price
              .optional()
              .describe(
                '販売価格 鑑定結果を登録しない場合、sell_priceは入力しない',
              ),
            appraisal_fee: Appraisal_ProductSchema.shape.appraisal_fee
              .optional()
              .describe(
                '鑑定費用 その他費用などを含みたいものについてもここに入力する',
              ),
            condition_option_id:
              Item_Category_Condition_OptionSchema.shape.id.describe(
                '状態の選択肢ID この状態に変更させる 登録する時もしない時も必要',
              ),
          }),
        )
        .describe('鑑定結果を入れる在庫のリスト'),
    }),
  },
  process: ``,
  response: AppraisalSchema.merge(
    z.object({
      products: z.array(Appraisal_ProductSchema),
    }),
  ),
  error: {} as const,
} satisfies BackendApiDef;

export const getAppraisalApi = {
  summary: '鑑定取得',
  description: '鑑定情報を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/appraisal',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      id: AppraisalSchema.shape.id.optional(),
      deleted: AppraisalSchema.shape.deleted
        .optional()
        .describe('編集時に削除済みのものからproduct情報を取得するため'),
      finished: AppraisalSchema.shape.finished
        .optional()
        .describe(
          'すでに完了しているものだけを取得する場合true、完了してないものだけを取得する場合false',
        ),
      ...defPagination(),
    }),
  },
  process: ``,
  response: z.object({
    appraisals: z.array(
      z.object({
        id: AppraisalSchema.shape.id.describe('鑑定のID'),
        store_id: AppraisalSchema.shape.store_id,
        shipping_date: AppraisalSchema.shape.shipping_date.describe('発送日'),
        appraisal_fee:
          AppraisalSchema.shape.appraisal_fee.describe('合計鑑定費用'),
        description: AppraisalSchema.shape.description.describe('備考'),
        shipping_fee: AppraisalSchema.shape.shipping_fee.describe('送料'),
        insurance_fee: AppraisalSchema.shape.insurance_fee.describe('保険料'),
        handling_fee: AppraisalSchema.shape.handling_fee.describe('事務手数料'),
        other_fee: AppraisalSchema.shape.other_fee.describe('その他費用'),
        staff_account_id:
          AppraisalSchema.shape.staff_account_id.describe('担当者ID'),
        finished:
          AppraisalSchema.shape.finished.describe('結果入力したかどうか'),
        created_at: AppraisalSchema.shape.created_at,
        updated_at: AppraisalSchema.shape.updated_at,
        products: z.array(
          z.object({
            id: Appraisal_ProductSchema.shape.id.describe(
              'それぞれの鑑定商品定義のID',
            ),
            product_id:
              Appraisal_ProductSchema.shape.product_id.describe(
                'もともとの在庫のID',
              ),
            to_product_id: Appraisal_ProductSchema.shape.to_product_id.describe(
              '結果入力した時、在庫を戻した時（作った時）のID',
            ),
            sell_price:
              Appraisal_ProductSchema.shape.sell_price.describe(
                '鑑定品として登録した時の販売価格',
              ),
            condition_option_id:
              Appraisal_ProductSchema.shape.condition_option_id.describe(
                '結果入力した時、在庫を戻した時の状態ID',
              ),
            condition_option: Item_Category_Condition_OptionSchema.describe(
              '結果入力した時、在庫を戻した時の状態の情報',
            ),
            specialty_id:
              Appraisal_ProductSchema.shape.specialty_id.describe(
                '鑑定結果（スペシャルティID）',
              ),
            specialty: SpecialtySchema.describe('スペシャルティ定義'),
            appraisal_number:
              Appraisal_ProductSchema.shape.appraisal_number.describe(
                '鑑定番号',
              ),
            wholesale_price:
              Appraisal_ProductSchema.shape.wholesale_price.describe(
                'この商品のもともとの仕入れ値',
              ),
            appraisal_fee:
              Appraisal_ProductSchema.shape.appraisal_fee.describe(
                'この商品の鑑定費用',
              ),
            product: z
              .object({
                display_name:
                  ProductSchema.shape.display_name.describe('商品名'),
                displayNameWithMeta: z
                  .string()
                  .optional()
                  .describe('メタ情報付き'),
                image_url: ProductSchema.shape.image_url.describe('商品画像'),
                condition_option_display_name: z
                  .string()
                  .optional()
                  .describe('状態名'),
              })
              .describe('元々の在庫の情報'),
          }),
        ),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const updateAppraisalApi = {
  summary: '鑑定を更新',
  description: '鑑定を更新',
  method: ApiMethod.PUT,
  path: '/store/{store_id}/appraisal/{appraisal_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      appraisal_id: AppraisalSchema.shape.id,
    }),
    body: z.object({
      //以下、結果入力する前のみ可能
      shipping_fee: AppraisalSchema.shape.shipping_fee.optional(),
      insurance_fee: AppraisalSchema.shape.insurance_fee.optional(),
      handling_fee: AppraisalSchema.shape.handling_fee.optional(),
      other_fee: AppraisalSchema.shape.other_fee.optional(),

      //以下、いつでも可能
      description: AppraisalSchema.shape.description.optional(),
    }),
  },
  process: `

  `,
  response: AppraisalSchema,
  error: {} as const,
} satisfies BackendApiDef;

export const cancelAppraisalApi = {
  summary: '鑑定をキャンセルする',
  description: '鑑定をキャンセルする',
  method: ApiMethod.POST,
  path: '/store/{store_id}/appraisal/{appraisal_id}/cancel',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      appraisal_id: AppraisalSchema.shape.id,
    }),
  },
  process: `

  `,
  response: defOk('鑑定をキャンセルし、削除しました'),
  error: {} as const,
} satisfies BackendApiDef;
