import {
  AccountSchema,
  ItemSchema,
  Pack_Open_HistorySchema,
  Pack_Open_ProductsSchema,
  PackOpenStatusSchema,
  ProductSchema,
  Product_Stock_HistorySchema,
  StoreSchema,
  LossSchema,
  SpecialtySchema,
  Product_ImageSchema,
} from 'backend-core';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { ApiMethod, apiRole, BackendApiDef } from '@/types/main';
import { defOk, defPagination } from '@/generator/util';

extendZodWithOpenApi(z);

// Define ProductTransferKind enum
const ProductTransferKindSchema = z.enum(['FROM', 'TO']);

// export const attachTagsToProductApi = {
//   summary: '在庫にタグを結びつける',
//   description: '在庫にタグを結びつける',
//   method: ApiMethod.POST,
//   path: '/store/{store_id}/product/tag/attach',
//   privileges: {
//     role: [apiRole.pos],
//   },
//   request: {
//     params: z.object({
//       store_id: StoreSchema.shape.id.describe('店舗ID'),
//     }),
//     body: z.object({
//       products: z
//         .array(
//           z.object({
//             product_id: ProductSchema.shape.id.describe('在庫ID'),
//             tag_id: TagSchema.shape.id.describe('タグのID'),
//           }),
//         )
//         .describe('タグをつける対象の在庫リスト'),
//     }),
//   },
//   response: defOk('タグを付与することができました'),
//   error: {
//     invalidProductOrTag: {
//       status: 400,
//       messageText: '指定できない在庫やタグが含まれています',
//     },
//   } as const,
// } satisfies BackendApiDef;

// export const detachTagsFromProductApi = {
//   summary: '在庫のタグ取り外し',
//   description: '在庫からタグを取り外す',
//   method: ApiMethod.DELETE,
//   path: '/store/{store_id}/product/{product_id}/tag/{tag_id}',
//   privileges: {
//     role: [apiRole.pos],
//   },
//   request: {
//     params: z.object({
//       store_id: StoreSchema.shape.id.describe('店舗ID'),
//       product_id: ProductSchema.shape.id.describe('在庫ID'),
//       tag_id: TagSchema.shape.id.describe('取り外す対象のタグID'),
//     }),
//   },
//   response: z.object({
//     tags: z.array(
//       z.object({
//         tag: TagSchema.describe('タグの情報'),
//       }),
//     ),
//   }),
//   error: {} as const,
// } satisfies BackendApiDef;

export const getOpenPackHistoryApi = {
  summary: 'パック開封履歴を取得',
  description: 'パック開封履歴を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/product/open-pack',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id.describe('店舗ID'),
    }),
    query: z.object({
      id: Pack_Open_HistorySchema.shape.id
        .optional()
        .describe('パック開封のID'),
      from_product_id: Pack_Open_HistorySchema.shape.from_product_id
        .optional()
        .describe('開封対象の在庫のID'),
      item_id: ItemSchema.shape.id
        .optional()
        .describe('商品マスタのIDからも攻めれるようにする'),
      item_type: z
        .string()
        .optional()
        .describe('ORIGINAL_PACK or BUNDLE or NORMAL カンマ区切り'),
      status: PackOpenStatusSchema.optional().describe('ステータス'),
    }),
  },
  response: z.object({
    openPackHistories: z.array(
      Pack_Open_HistorySchema.extend({
        from_product: z
          .object({
            stock_number:
              ProductSchema.shape.stock_number.describe(
                '開封対象の現在の在庫数',
              ),
            item: z.object({
              id: ItemSchema.shape.id.describe(
                '開封対象の在庫の商品マスタのID',
              ),
              type: ItemSchema.shape.type.describe(
                '開封対象の在庫の商品マスタのタイプ（ORIGINAL_PACK or NORMAL） NORMALだったら通常のボックス',
              ),
            }),
          })
          .describe('開封対象の在庫についての情報'),
        to_products: z
          .array(
            Pack_Open_ProductsSchema.extend({
              staff_account: z.object({
                display_name:
                  AccountSchema.shape.display_name.describe('担当者名'),
              }),
            }),
          )
          .describe('開封した結果の在庫リスト'),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const subscribeUpdateOpenPackHistoryApi = {
  summary: 'パック開封履歴の更新イベントを取得',
  description: 'パック開封履歴の更新イベントを取得する（リアルタイムAPI）',
  method: ApiMethod.GET,
  path: '/store/{store_id}/product/open-pack/{pack_open_history_id}/subscribe',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id.describe('店舗ID'),
      pack_open_history_id:
        Pack_Open_HistorySchema.shape.id.describe('パック開封のID'),
    }),
  },
  response: z.any().describe('SSEイベントストリーム'),
  error: {} as const,
} satisfies BackendApiDef;

export const openPackApi = {
  summary: 'パック開封を行う',
  description: 'パック開封を行う',
  method: ApiMethod.POST,
  path: '/store/{store_id}/product/{product_id}/open-pack',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id.describe('店舗ID'),
      product_id: ProductSchema.shape.id.describe('開封する対象の在庫ID'),
    }),
    body: z.object({
      id: Pack_Open_HistorySchema.shape.id
        .optional()
        .describe('既存のパック開封に対しての処理'),
      asDraft: z
        .boolean()
        .optional()
        .describe(
          '下書きとして登録する場合はasDraft 指定しなかったら完了処理に入る（スマホ版から実行する時は原則trueを指定する）',
        ),
      item_count: Pack_Open_HistorySchema.shape.item_count
        .optional()
        .describe('開封するパックの部数 完了させるには必要'),
      item_count_per_pack: Pack_Open_HistorySchema.shape.item_count_per_pack
        .optional()
        .describe('パックの一枚あたりの枚数 完了させるには必要'),
      staff_account_id: Pack_Open_HistorySchema.shape.staff_account_id
        .optional()
        .describe(
          'このパック開封を作った担当者ID idを指定してないとき（新規作成時）は必要',
        ),
      margin_wholesale_price:
        Pack_Open_HistorySchema.shape.margin_wholesale_price
          .optional()
          .describe('余った仕入れ値 システムで自動分配'),
      unregister_product_id: Pack_Open_HistorySchema.shape.unregister_product_id
        .optional()
        .describe(
          '未登録カードの扱い方 nullだったらロス登録をし、特定の商品IDを入力したらその商品の在庫として登録される オリパ開封の時は指定しなくて大丈夫',
        ),
      unregister_item_count: Pack_Open_HistorySchema.shape.unregister_item_count
        .optional()
        .describe('未登録カードの枚数 オリパ開封の時は指定しなくて大丈夫'),
      unregister_product_wholesale_price:
        Pack_Open_HistorySchema.shape.unregister_product_wholesale_price
          .optional()
          .describe(
            '未登録カードの仕入れ値 オリパ開封の時は指定しなくて大丈夫',
          ),
      to_products: z
        .array(
          z.object({
            product_id:
              Pack_Open_ProductsSchema.shape.product_id.describe('在庫ID'),
            staff_account_id:
              Pack_Open_ProductsSchema.shape.staff_account_id.describe(
                '担当者ID PCから送信の場合でも入れる ここは必要',
              ),
            item_count:
              Pack_Open_ProductsSchema.shape.item_count.describe('個数'),
            wholesale_price: Pack_Open_ProductsSchema.shape.wholesale_price
              .optional()
              .describe('仕入れ単価（指定）　オリパの場合は指定しない'),
          }),
        )
        .optional()
        .describe(
          '開封結果の在庫（PCから実行するときここを指定する 指定しない時は空配列ではなくてundefinedにすること）',
        ),
      additional_products: z
        .array(
          z.object({
            product_id:
              Pack_Open_ProductsSchema.shape.product_id.describe('在庫ID'),
            item_count:
              Pack_Open_ProductsSchema.shape.item_count.describe('個数'),
            wholesale_price: Pack_Open_ProductsSchema.shape.wholesale_price
              .optional()
              .describe('仕入れ単価（指定）　オリパの場合は指定しない'),
          }),
        )
        .optional()
        .describe(
          '開封結果を追加するときに指定する（スマホから実行するときここを指定する 指定しない時は空配列ではなくてundefinedにすること）',
        ),
    }),
  },
  response: Pack_Open_HistorySchema.extend({
    to_products: z
      .array(
        Pack_Open_ProductsSchema.extend({
          staff_account: z.object({
            display_name: AccountSchema.shape.display_name.describe('担当者名'),
          }),
        }),
      )
      .describe('開封した結果の在庫リスト'),
  }),
  error: {
    invalidProductsParameter: {
      status: 400,
      messageText:
        'to_productsとadditional_productsを同時に指定することはできません',
    },
    additionalProductsWhenCreate: {
      status: 400,
      messageText: '新規登録時にadditional_productsは指定できません',
    },
    noItemCount: {
      status: 400,
      messageText:
        'パック開封を完了させるためにはitem_count, item_count_per_packの指定が必要です',
    },
    invalidCount: {
      status: 400,
      messageText: '合計カード枚数と登録、未登録カード数が合いません',
    },
  } as const,
} satisfies BackendApiDef;

export const releaseOriginalPackApi = {
  summary: 'オリパの解体を行う',
  description: 'オリパの解体を行う',
  method: ApiMethod.POST,
  path: '/store/{store_id}/product/{product_id}/release-original-pack',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id.describe('店舗ID'),
      product_id: ProductSchema.shape.id.describe('開封する対象の在庫ID'),
    }),
    body: z.object({
      id: Pack_Open_HistorySchema.shape.id
        .optional()
        .describe('既存のパック開封に対しての処理'),
      asDraft: z
        .boolean()
        .optional()
        .describe(
          '下書きとして登録する場合はasDraft 指定しなかったら完了処理に入る（スマホ版から実行する時は原則trueを指定する）',
        ),
      itemCount: z
        .number()
        .optional()
        .describe('解体する個数 完了時に必要 在庫数を減らさない場合は0'),
      staff_account_id: Pack_Open_HistorySchema.shape.staff_account_id
        .optional()
        .describe(
          'このパック開封を作った担当者ID idを指定してないとき（新規作成時）は必要',
        ),
      to_products: z
        .array(
          z.object({
            product_id:
              Pack_Open_ProductsSchema.shape.product_id.describe('在庫ID'),
            staff_account_id:
              Pack_Open_ProductsSchema.shape.staff_account_id.describe(
                '担当者ID PCから送信の場合でも入れる ここは指定が必要',
              ),
            item_count:
              Pack_Open_ProductsSchema.shape.item_count.describe('個数'),
          }),
        )
        .optional()
        .describe(
          '開封結果の在庫（PCから実行するときここを指定する 指定しない時は空配列ではなくてundefinedにすること）',
        ),
      additional_products: z
        .array(
          z.object({
            product_id:
              Pack_Open_ProductsSchema.shape.product_id.describe('在庫ID'),
            item_count:
              Pack_Open_ProductsSchema.shape.item_count.describe('個数'),
          }),
        )
        .optional()
        .describe(
          '開封結果を追加するときに指定する（スマホから実行するときここを指定する 指定しない時は空配列ではなくてundefinedにすること）',
        ),
    }),
  },
  response: Pack_Open_HistorySchema.extend({
    to_products: z
      .array(
        Pack_Open_ProductsSchema.extend({
          staff_account: z.object({
            display_name: AccountSchema.shape.display_name.describe('担当者名'),
          }),
        }),
      )
      .describe('開封した結果の在庫リスト'),
  }),
  error: {
    invalidProductsParameter: {
      status: 400,
      messageText:
        'to_productsとadditional_productsを同時に指定することはできません',
    },
    additionalProductsWhenCreate: {
      status: 400,
      messageText: '新規登録時にadditional_productsは指定できません',
    },
    noWholesalePrice: {
      status: 500,
      messageText:
        '指定された在庫の仕入れ値がオリパに結びついていません、もしくはオリパ定義に含まれない在庫が指定されています',
    },
    noItemCount: {
      status: 400,
      messageText: '解体を完了させるためには解体数を指定する必要があります。',
    },
  } as const,
} satisfies BackendApiDef;

export const getLossProductsApi = {
  summary: 'ロス登録された在庫を取得',
  description: 'ロス登録された在庫を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/product/loss',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id.describe('店舗ID'),
    }),
    query: z.object({
      loss_genre_id: z.number().optional().describe('ロス区分ID'),
      staff_account_id: z.number().optional().describe('担当者ID'),
      reason: z.string().optional().describe('ロス理由での絞り込み'),
      datetime_gte: z.coerce
        .date()
        .optional()
        .describe('発生日の範囲指定（開始日）'),
      datetime_lte: z.coerce
        .date()
        .optional()
        .describe('発生日の範囲指定（終了日）'),
      display_name: z.string().optional().describe('商品名での絞り込み'),
      orderBy: z.string().optional().describe('ソートの定義'),
      ...defPagination(),
    }),
  },
  response: z.object({
    lossProducts: z.array(
      z.object({
        item_count: z.number(),
        product: ProductSchema.extend({
          displayNameWithMeta: z.string(),
          condition_option: z.object({
            display_name: z.string(),
          }),
        }),
        loss: LossSchema.extend({
          loss_genre: z.object({
            display_name: z.string(),
          }),
          staff_account: z.object({
            display_name: z.string(),
          }),
        }),
      }),
    ),
    totalCount: z.number().describe('総件数'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

// 一般的な在庫変動履歴を取得するAPI
export const getProductStockHistoryApi = {
  summary: '在庫変動履歴',
  description: '在庫の変動履歴を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/product/stock-history',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id.describe('店舗ID'),
    }),
    query: z.object({
      source_kind: z.string().optional().describe('変動の種類'),
      product_id: ProductSchema.shape.id.optional().describe('対象の在庫ID'),
      datetime_gte: z.coerce.date().optional().describe('期間指定開始'),
      datetime_lt: z.coerce.date().optional().describe('期間指定終了'),
      ...defPagination(),
    }),
  },
  response: z.object({
    histories: z.array(
      Product_Stock_HistorySchema.extend({
        product: ProductSchema.extend({
          displayNameWithMeta: z.string(),
          condition_option: z.object({
            display_name: z.string(),
          }),
          specialty: z
            .object({
              display_name: z.string(),
            })
            .nullable(),
          item: z.object({
            rarity: z.string().nullable(),
            expansion: z.string().nullable(),
            cardnumber: z.string().nullable(),
          }),
        }),
      }),
    ),
    totalCount: z.number().describe('総件数'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

// 特定の在庫変換履歴専用のAPI
export const getProductTransferHistoryApi = {
  summary: '在庫変換の履歴（変換専用）',
  description: '特定商品の在庫変換履歴を取得する（FROM/TO別）',
  method: ApiMethod.GET,
  path: '/store/{store_id}/product/{product_id}/transfer-history',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id.describe('店舗ID'),
      product_id: ProductSchema.shape.id.describe('在庫ID'),
    }),
    query: z.object({
      kind: ProductTransferKindSchema.describe(
        'FROMだったらこの商品が「変換前」になっている在庫変換で、TOだったらこの商品が「変換後」になっている在庫変換',
      ),
      orderBy: z.string().optional().describe('ソートの定義'),
    }),
  },
  response: z.object({
    stockHistories: z.array(
      z.object({
        id: Product_Stock_HistorySchema.shape.id,
        staff_account_id: Product_Stock_HistorySchema.shape.staff_account_id,
        source_id: ProductSchema.shape.id
          .describe(
            'kind=FROMだったら変換後の在庫ID kind=TOだったら変換前の在庫ID',
          )
          .nullable(),
        item_count: Product_Stock_HistorySchema.shape.item_count.describe(
          'kind=FROMだったらこの在庫を減らした数（負の数になる） kind=TOだったらこの在庫を増やした数',
        ),
        description: Product_Stock_HistorySchema.shape.description,
        unit_price: Product_Stock_HistorySchema.shape.unit_price,
        datetime:
          Product_Stock_HistorySchema.shape.datetime.describe('変換日時'),
        result_stock_number:
          Product_Stock_HistorySchema.shape.result_stock_number.describe(
            '結果在庫が何になったのか',
          ),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const transferToSpecialPriceProductApi = {
  summary: '特価在庫への移動',
  description: '特価在庫への移動を行う',
  method: ApiMethod.POST,
  path: '/store/{store_id}/product/{product_id}/transfer/special-price',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id.describe('店舗ID'),
      product_id: ProductSchema.shape.id.describe('在庫変動元の在庫ID'),
    }),
    body: z.object({
      itemCount: z
        .number()
        .refine((v) => v > 0, {
          message: 'itemCountは正の数を指定してください',
        })
        .describe('生成する在庫の数'),
      sellPrice:
        ProductSchema.shape.specific_sell_price.describe('何円にするか'),
      specific_auto_sell_price_adjustment:
        ProductSchema.shape.specific_auto_sell_price_adjustment
          .optional()
          .describe(
            "価格更新後も%関係を維持するかどうか nullやundefinedだったら維持せず価格調整も今後しない '80%'と指定したら今後自動で80%に調整される",
          ),
      force_no_price_label: ProductSchema.shape.force_no_price_label
        .optional()
        .describe('必ず価格なしラベルにするかどうか'),
    }),
  },
  response: ProductSchema.describe('生成できた在庫の情報'),
  error: {
    failedToCreateProduct: {
      status: 500,
      messageText: '特価在庫が生成されませんでした',
    },
  } as const,
} satisfies BackendApiDef;

export const getProductEcOrderHistoryApi = {
  summary: 'ECの販売履歴',
  description: 'ECの販売履歴を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/product/{product_id}/ec-order',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id.describe('店舗ID'),
      product_id: ProductSchema.shape.id.describe('在庫ID'),
    }),
    query: z.object({
      orderBy: z.string().optional().describe('ソートの定義'),
      take: z.number().optional().describe('取得する数'),
      skip: z.number().optional().describe('飛ばす数'),
      includesSummary: z
        .boolean()
        .optional()
        .describe('trueだったら合計数も取得する'),
    }),
  },
  response: z.object({
    ordersByProduct: z.array(
      z.object({
        order_store: z
          .object({
            order: z.object({
              id: z.number().describe('オーダーのID'),
              ordered_at: z.coerce.date().describe('受注日時').nullable(),
            }),
          })
          .describe('ストアごとのカート定義'),
        total_unit_price: z.number().describe('販売単価'),
        item_count: z.number().describe('販売数'),
      }),
    ),
    summary: z
      .object({
        totalItemCount: z.number().describe('合計数'),
      })
      .optional(),
  }),
  error: {} as const,
} satisfies BackendApiDef;

//スペシャルティを作成・更新する
export const createOrUpdateSpecialtyApi = {
  summary: 'スペシャルティを作成・更新する',
  description: 'スペシャルティを作成・更新する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/product/specialty',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      id: SpecialtySchema.shape.id.optional(),
      display_name: SpecialtySchema.shape.display_name
        .describe('スペシャルティ名 店舗で一意')
        .optional(),
      kind: SpecialtySchema.shape.kind
        .describe('スペシャルティの種類')
        .optional(),
      order_number: z.number().int().describe('並び順').optional(),
      handle: SpecialtySchema.shape.handle
        .optional()
        .describe('EC上で利用するためのハンドル名'),
    }),
  },
  process: `

  `,
  response: SpecialtySchema.describe('作られたスペシャルティの情報'),
  error: {} as const,
} satisfies BackendApiDef;

//スペシャルティを削除する
export const deleteSpecialtyApi = {
  summary: 'スペシャルティを削除する',
  description: 'スペシャルティを削除する',
  method: ApiMethod.DELETE,
  path: '/store/{store_id}/product/specialty/{specialty_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      specialty_id: SpecialtySchema.shape.id,
    }),
  },
  process: `

  `,
  response: defOk('スペシャルティを削除しました'),
  error: {} as const,
} satisfies BackendApiDef;

//スペシャルティを取得する
export const getSpecialtyApi = {
  summary: 'スペシャルティを取得する',
  description: 'スペシャルティを取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/product/specialty',
  privileges: {
    role: [apiRole.pos, apiRole.everyone],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      id: SpecialtySchema.shape.id.optional(),
      kind: SpecialtySchema.shape.kind.optional(),
    }),
  },
  process: `

  `,
  response: z.object({
    specialties: z.array(SpecialtySchema),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const rollbackPackOpeningApi = {
  summary: 'パック開封のロールバック',
  description: 'パック開封のロールバック',
  method: ApiMethod.POST,
  path: '/store/{store_id}/product/open-pack/{pack_open_history_id}/rollback',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      pack_open_history_id: Pack_Open_HistorySchema.shape.id,
    }),

    body: z.object({
      description: z.string().optional(),
      isDryRun: z
        .boolean()
        .optional()
        .describe('trueにしたらこのロールバックが可能かどうかだけ判断できる'),
    }),
  },
  process: `

  `,
  response: defOk('パック開封のロールバックが完了しました'),
  error: {} as const,
} satisfies BackendApiDef;

export const openBoxApi = {
  summary: 'ボックスを解体する',
  description: 'ボックスを解体する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/product/{product_id}/open-box',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      product_id: ProductSchema.shape.id,
    }),

    body: z.object({
      item_count: z.number().describe('解体する数'),
      to_products: z
        .array(
          z.object({
            product_id: ProductSchema.shape.id,
            item_count: z.number().describe('増えた数'),
          }),
        )
        .describe('解体した結果の在庫（パック）リスト'),
    }),
  },
  process: `

  `,
  response: defOk('ボックスを解体しました'),
  error: {} as const,
} satisfies BackendApiDef;

export const openCartonApi = {
  summary: 'カートン在庫を解体する',
  description: 'カートン在庫を解体する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/product/{product_id}/open-carton',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      product_id: ProductSchema.shape.id,
    }),

    body: z.object({
      item_count: z.number().positive().describe('解体する数'),
      to_product: z.object({
        product_id: ProductSchema.shape.id.describe('ボックスの在庫のID'),
        item_count: z.number().positive().describe('増えた数'),
      }),
    }),
  },
  process: `

  `,
  response: defOk('カートンを解体しました'),
  error: {} as const,
} satisfies BackendApiDef;

export const restockCartonProductApi = {
  summary: 'カートン在庫をボックスから補充する',
  description: 'カートン在庫をボックスから補充する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/product/{product_id}/restock-carton',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      product_id: ProductSchema.shape.id.describe('補充先のカートン在庫のID'),
    }),

    body: z.object({
      item_count: z.number().positive().describe('補充する数'),
      from_product: z.object({
        product_id: ProductSchema.shape.id.describe('補充元のボックスのID'),
        item_count: z.number().positive().describe('消費するボックスの個数'),
      }),
    }),
  },
  process: `

  `,
  response: defOk('カートン在庫をボックスから補充しました'),
  error: {} as const,
} satisfies BackendApiDef;

export const updateProductImagesApi = {
  summary: '在庫の画像を編集する',
  description: '在庫の画像を編集する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/product/{product_id}/images',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      product_id: ProductSchema.shape.id,
    }),
    body: z.object({
      images: z
        .array(
          z.object({
            image_url: Product_ImageSchema.shape.image_url,
            description: Product_ImageSchema.shape.description,
            order_number: Product_ImageSchema.shape.order_number,
          }),
        )
        .describe('画像リスト 更新する時、全て指定する'),
    }),
  },
  process: `

  `,
  response: z.object({
    images: z.array(Product_ImageSchema).describe('結果の画像リスト'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const restockBoxProductApi = {
  summary: 'ボックス在庫をパックから補充する',
  description: 'ボックス在庫をパックから補充する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/product/{product_id}/restock-box',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      product_id: ProductSchema.shape.id,
    }),
    body: z.object({
      item_count: z.number().positive().describe('補充する数'),
      from_product: z.object({
        product_id: ProductSchema.shape.id.describe('補充元のパックのID'),
        item_count: z.number().positive().describe('消費するパックの個数'),
      }),
    }),
  },
  process: `

  `,
  response: defOk('ボックス在庫をパックから補充しました'),
  error: {} as const,
} satisfies BackendApiDef;

export const updateInfiniteProductSettingApi = {
  summary: '無限在庫の設定を更新',
  description: '無限在庫の設定を更新',
  method: ApiMethod.PUT,
  path: '/store/{store_id}/product/{product_id}/infinite-stock',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      product_id: ProductSchema.shape.id,
    }),
    body: z
      .object({
        stock_number: z.number().positive().describe('在庫数'),
        wholesale_price: z.number().describe('仕入れ値'),
      })
      .describe('無限在庫の設定 どちらも指定すること'),
  },
  process: `

  `,
  response: ProductSchema,
  error: {} as const,
} satisfies BackendApiDef;

export const deleteProductApi = {
  summary: '在庫の論理削除',
  description: '在庫の論理削除',
  method: ApiMethod.DELETE,
  path: '/store/{store_id}/product/{product_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      product_id: ProductSchema.shape.id,
    }),
  },
  process: `

  `,
  response: defOk('在庫を削除しました'),
  error: {} as const,
} satisfies BackendApiDef;

export const cancelConsignmentProductApi = {
  summary: '委託在庫を取り消す',
  description: '委託在庫を取り消す',
  method: ApiMethod.POST,
  path: '/store/{store_id}/product/{product_id}/cancel-consignment',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      product_id: ProductSchema.shape.id,
    }),
    body: z.object({
      cancel_count: z.number().positive().describe('取り消す数'),
    }),
  },
  process: `

  `,
  response: defOk('委託在庫を取り消しました'),
  error: {} as const,
} satisfies BackendApiDef;
