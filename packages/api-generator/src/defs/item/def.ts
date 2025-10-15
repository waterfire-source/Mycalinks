import {
  AccountSchema,
  Bundle_Item_ProductSchema,
  Condition_Option_RateSchema,
  Consignment_ClientSchema,
  CustomerSchema,
  Item_Category_Condition_OptionSchema,
  Item_CategorySchema,
  Item_GenreSchema,
  Item_GroupSchema,
  ItemSchema,
  Original_Pack_ProductSchema,
  ProductSchema,
  SpecialtySchema,
  StoreSchema,
  Transaction_CartSchema,
  TransactionSchema,
} from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOk, defOrderBy, defPagination } from '../../generator/util';
import { StaffAccountComponent } from '@/defs/common/model';
extendZodWithOpenApi(z);

export const createItemGenreApi = {
  summary: 'ジャンル作成',
  description: '商品マスタのジャンルを作成する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/item/genre',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      myca_genre_id: z
        .number()
        .optional()
        .describe('Mycaのジャンルから追加する場合、そのIDを指定する'),
      display_name: Item_GenreSchema.shape.display_name.optional(),
    }),
  },
  process: `

  `,
  response: Item_GenreSchema,
  error: {
    invalidAppGenre: {
      status: 404,
      messageText: '存在しないMycaジャンルを指定しています',
    },
    alreadyRegistered: {
      status: 400,
      messageText: 'すでに存在するMycaジャンルです',
    },
  } as const,
} satisfies BackendApiDef;

export const getItemGenreApi = {
  summary: 'ジャンル取得',
  description: '商品マスタのジャンルを取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/item/genre',
  privileges: {
    role: [apiRole.pos, apiRole.everyone],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      fromTablet: z
        .boolean()
        .optional()
        .describe('在庫検索タブレットからかどうか'),
    }),
  },
  process: `
  `,
  response: z.object({
    itemGenres: z.array(Item_GenreSchema),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const createBundleApi = {
  summary: 'バンドル作成',
  description: 'バンドル商品マスタを作成する。同時に在庫数も調整する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/item/bundle',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      id: ItemSchema.shape.id.optional().describe('編集を行うときに必要なID'),
      sell_price: ItemSchema.shape.sell_price,
      init_stock_number: ItemSchema.shape.init_stock_number,
      display_name: ItemSchema.shape.display_name,
      expire_at: ItemSchema.shape.expire_at.optional(),
      start_at: ItemSchema.shape.start_at.optional(),
      genre_id: ItemSchema.shape.genre_id.optional(),
      image_url: ItemSchema.shape.image_url.optional(),
      products: z
        .array(
          z.object({
            product_id: Bundle_Item_ProductSchema.shape.product_id,
            item_count: Bundle_Item_ProductSchema.shape.item_count,
          }),
        )
        .describe('商品定義'),
    }),
  },
  process: `
  `,
  response: ItemSchema.merge(
    z.object({
      bundle_item_products: z.array(Bundle_Item_ProductSchema),
    }),
  ).describe('作成できたバンドル商品マスタの情報'),
  error: {} as const,
} satisfies BackendApiDef;

export const listItemWithTransactionApi = {
  summary: '商品マスタベース取引取得',
  description: '商品マスタベースで取引情報を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/item/transaction',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      transactionFinishedAtGte: z
        .date()
        .optional()
        .describe('取引終了日時の開始時間指定'),
      transactionFinishedAtLt: z
        .date()
        .optional()
        .describe('取引終了日時の終了時間指定'),
      includesTransactions: z
        .boolean()
        .optional()
        .describe('内訳の取引情報まで取得するかどうか'),
      includesSummary: z
        .boolean()
        .optional()
        .describe('合計件数まで取得するかどうか'),
      transaction_kind: TransactionSchema.shape.transaction_kind.optional(),
      item_id: ItemSchema.shape.id.optional(),
      display_name: ItemSchema.shape.display_name.optional(),
      category_id: ItemSchema.shape.category_id.optional(),
      genre_id: ItemSchema.shape.genre_id.optional(),
      rarity: ItemSchema.shape.rarity.optional(),
      cardnumber: ItemSchema.shape.cardnumber.optional(),
      expansion: ItemSchema.shape.expansion.optional(),
      customer_id: CustomerSchema.shape.id.optional(),
      ...defOrderBy({
        transactionCount: '取引件数',
        transactionProductsCount: '取引点数',
        transactionTotalPrice: '取引総額',
      }),
      ...defPagination(),
    }),
  },
  process: `
  `,
  response: z.object({
    items: z.array(
      z.object({
        item: ItemSchema,
        item_id: ItemSchema.shape.id,
        transaction_kind: TransactionSchema.shape.transaction_kind,
        transactionStats: z.object({
          transactionCount: z.number().describe('取引件数'),
          transactionProductsCount: z.number().describe('取引点数'),
          transactionTotalPrice: z.number().describe('取引総額'),
        }),
        //includesTransactions=trueの時のみ
        transactions: z
          .array(
            z.object({
              transaction: z.object({
                id: TransactionSchema.shape.id,
                finished_at: TransactionSchema.shape.finished_at,
                payment_method: TransactionSchema.shape.payment_method,
              }),
              item_count: Transaction_CartSchema.shape.item_count,
              total_unit_price: Transaction_CartSchema.shape.total_unit_price,
              total_discount_price:
                Transaction_CartSchema.shape.total_discount_price,
              product: z.object({
                id: ProductSchema.shape.id,
                condition_option: z
                  .object({
                    id: Item_Category_Condition_OptionSchema.shape.id,
                    display_name:
                      Item_Category_Condition_OptionSchema.shape.display_name,
                  })
                  .nullable(),
              }),
            }),
          )
          .optional(),
      }),
    ),
    summary: z
      .object({
        totalCount: z.number().describe('合計件数'),
        totalSellPrice: z.number().describe('合計販売価格'),
        totalBuyPrice: z.number().describe('合計買取価格'),
      })
      .optional(),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const createOriginalPackApi = {
  summary: 'オリパ作成',
  description: 'オリパを作成する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/item/original-pack',
  privileges: {
    role: [apiRole.pos],
    policies: ['list_original_pack'],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      id: ItemSchema.shape.id.optional().describe('編集を行うときに必要なID'),
      asDraft: z.boolean().optional().describe('下書きとして作成するかどうか'),
      staff_account_id: AccountSchema.shape.id
        .optional()
        .describe('担当者ID')
        .openapi({ deprecated: true }),
      display_name: ItemSchema.shape.display_name.optional(),
      sell_price: ItemSchema.shape.sell_price.optional(),
      init_stock_number: ItemSchema.shape.init_stock_number.optional(),
      image_url: ItemSchema.shape.image_url.optional(),
      genre_id: ItemSchema.shape.genre_id.optional(),
      category_id: ItemSchema.shape.category_id.optional(),
      products: z
        .array(
          z.object({
            product_id: Original_Pack_ProductSchema.shape.product_id,
            staff_account_id:
              Original_Pack_ProductSchema.shape.staff_account_id,
            item_count: Original_Pack_ProductSchema.shape.item_count,
          }),
        )
        .optional(),
      additional_products: z
        .array(
          z.object({
            product_id: Original_Pack_ProductSchema.shape.product_id,
            item_count: Original_Pack_ProductSchema.shape.item_count,
          }),
        )
        .optional(),
    }),
  },
  process: ``,
  response: ItemSchema.merge(
    z.object({
      original_pack_products: z.array(
        Original_Pack_ProductSchema.merge(
          z.object({
            staff_account: StaffAccountComponent,
          }),
        ),
      ),
      products: z.array(ProductSchema).optional(),
    }),
  ).describe('作成できたオリパの情報'),
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
    invalidDepartment: {
      status: 400,
      messageText: 'オリパ・福袋登録では指定できない部門です',
    },
    failedToCreateProducts: {
      status: 500,
      messageText: '正常に在庫が作成されませんでした',
    },
    notEnoughToFinish: {
      status: 400,
      messageText:
        'オリパの作成を完了させるためにはinit_stock_nunmberとsell_priceの登録が必要です',
    },
    noStaffAccountId: {
      status: 400,
      messageText:
        'オリパの登録を完了させるためには担当者のIDを指定する必要があります',
    },
  } as const,
} satisfies BackendApiDef;

export const getItemCategoryApi = {
  summary: 'カテゴリ取得',
  description: '商品マスタのカテゴリを取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/item/category',
  privileges: {
    role: [apiRole.pos, apiRole.everyone],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      includesCount: z
        .boolean()
        .optional()
        .describe('紐づいている在庫の数を含めるかどうか'),
    }),
  },
  response: z.object({
    itemCategories: z.array(
      Item_CategorySchema.merge(
        z.object({
          condition_options: z.array(
            Item_Category_Condition_OptionSchema.merge(
              z.object({
                _count: z.object({
                  products: z
                    .number()
                    .describe('この選択肢に紐づいている在庫数'),
                }),
                rate_variants: z.array(Condition_Option_RateSchema),
              }),
            ),
          ),
          groups: z
            .array(Item_GroupSchema)
            .describe('商品マスタグループ（高額など）'),
        }),
      ).describe('カテゴリ自体の情報'),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const updateItemGenreApi = {
  summary: 'ジャンル更新',
  description: '商品マスタのジャンルを更新する',
  method: ApiMethod.PUT,
  path: '/store/{store_id}/item/genre/{item_genre_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      item_genre_id: Item_GenreSchema.shape.id,
    }),
    body: z.object({
      display_name: Item_GenreSchema.shape.display_name.optional(),
      hidden: Item_GenreSchema.shape.hidden.optional(),
      auto_update: Item_GenreSchema.shape.auto_update.optional(),
      deleted: Item_GenreSchema.shape.deleted.optional(),
      order_number: Item_GenreSchema.shape.order_number.optional(),
    }),
  },
  process: ``,
  response: Item_GenreSchema,
  error: {
    cantDeleteSystemGenre: {
      status: 400,
      messageText: '自動生成部門は削除できません',
    },
    cantAutoUpdateSystemGenre: {
      status: 400,
      messageText: '自動生成部門以外は自動更新設定ができません',
    },
  } as const,
} satisfies BackendApiDef;

export const getItemMarketPriceHistoryApi = {
  summary: '相場価格の更新履歴取得',
  description: '商品マスタの相場価格の更新履歴を取得する',
  method: ApiMethod.GET,
  path: '/store/all/item/market-price/update-history',
  privileges: {
    role: [apiRole.pos],
  },
  request: {},
  process: ``,
  response: z.object({
    updatedHistory: z
      .array(
        z.object({
          id: z.number(),
          uploaded_at: z.date().describe('アップロード日時'),
          data_count: z.number().describe('アップロードデータ数'),
        }),
      )
      .describe('最新のものが最大10件取得される'),
  }),
  error: {} as const,
};

export const addOriginalPackApi = {
  summary: 'オリパ補充',
  description: 'オリパを補充する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/item/{item_id}/add-original-pack',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      item_id: ItemSchema.shape.id,
    }),
    body: z.object({
      additionalStockNumber: z
        .number()
        .int()
        .nonnegative()
        .describe('追加する在庫数'),
      additionalProducts: z
        .array(
          z.object({
            product_id: Original_Pack_ProductSchema.shape.product_id,
            item_count: Original_Pack_ProductSchema.shape.item_count,
          }),
        )
        .describe('追加する商品'),
    }),
  },
  process: ``,
  response: createOriginalPackApi.response,
  error: {} as const,
} satisfies BackendApiDef;

export const createOrUpdateItemCategoryApi = {
  summary: 'カテゴリ作成・更新',
  description: '商品マスタのカテゴリを作成・更新する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/item/category',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      id: Item_CategorySchema.shape.id
        .optional()
        .describe('編集を行うときに必要なID'),
      display_name: Item_CategorySchema.shape.display_name.optional(),
      hidden: Item_CategorySchema.shape.hidden.optional(),
      order_number: Item_CategorySchema.shape.order_number.optional(),
    }),
  },
  process: ``,
  response: Item_CategorySchema,
  error: {} as const,
} satisfies BackendApiDef;

export const deleteItemCategoryApi = {
  summary: 'カテゴリ削除',
  description: '商品マスタのカテゴリを削除する',
  method: ApiMethod.DELETE,
  path: '/store/{store_id}/item/category/{item_category_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      item_category_id: Item_CategorySchema.shape.id,
    }),
  },
  process: ``,
  response: defOk('削除が完了しました'),
  error: {} as const,
} satisfies BackendApiDef;

export const createOrUpdateConditionOptionApi = {
  summary: 'カテゴリ選択肢作成・更新',
  description: '商品マスタのカテゴリ選択肢を作成・更新する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/item/category/{item_category_id}/condition-option',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      item_category_id: Item_CategorySchema.shape.id,
    }),
    body: z.object({
      id: Item_Category_Condition_OptionSchema.shape.id
        .optional()
        .describe('編集を行うときに必要なID'),
      display_name:
        Item_Category_Condition_OptionSchema.shape.display_name.optional(),
      handle: Item_Category_Condition_OptionSchema.shape.handle
        .optional()
        .nullable(),
      order_number:
        Item_Category_Condition_OptionSchema.shape.order_number.optional(),
      description:
        Item_Category_Condition_OptionSchema.shape.description.optional(),
      rate_variants: z
        .array(
          z.object({
            group_id: Condition_Option_RateSchema.shape.group_id.optional(),
            genre_id: Condition_Option_RateSchema.shape.genre_id.optional(),
            auto_sell_price_adjustment:
              Condition_Option_RateSchema.shape.auto_sell_price_adjustment,
            auto_buy_price_adjustment:
              Condition_Option_RateSchema.shape.auto_buy_price_adjustment,
          }),
        )
        .optional()
        .describe('価格自動調整の定義'),
    }),
  },
  process: ``,
  response: Item_Category_Condition_OptionSchema.merge(
    z.object({
      rate_variants: z.array(Condition_Option_RateSchema),
    }),
  ),
  error: {} as const,
} satisfies BackendApiDef;

export const deleteConditionOptionApi = {
  summary: 'カテゴリ選択肢削除',
  description: '商品マスタのカテゴリ選択肢を削除する',
  method: ApiMethod.DELETE,
  path: '/store/{store_id}/item/category/{item_category_id}/condition-option/{condition_option_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      item_category_id: Item_CategorySchema.shape.id,
      condition_option_id: Item_Category_Condition_OptionSchema.shape.id,
    }),
  },
  process: ``,
  response: defOk('削除が完了しました'),
  error: {
    stillHasProducts: {
      status: 400,
      messageText:
        '状態選択肢を削除するためには、紐づいている在庫の在庫数がすべて0でないといけません',
    },
  } as const,
} satisfies BackendApiDef;

const ItemTypeSchema = z.enum(['ORIGINAL_PACK', 'BUNDLE', 'NORMAL']);

export const getItemApi = {
  summary: '商品マスタ取得',
  description: '商品マスタを取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/item',
  privileges: {
    role: [apiRole.pos, apiRole.everyone],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      id: z.string().optional().describe('商品マスタID カンマ区切りで複数指定'),
      genre_id: ItemSchema.shape.genre_id.optional(),
      category_id: ItemSchema.shape.category_id.optional(),
      is_buy_only: ItemSchema.shape.is_buy_only
        .optional()
        .describe('買取専用商品かどうか'),
      rarity: ItemSchema.shape.rarity.optional(),
      cardnumber: ItemSchema.shape.cardnumber.optional(),
      expansion: ItemSchema.shape.expansion.optional(),
      cardseries: ItemSchema.shape.cardseries.optional(),
      card_type: ItemSchema.shape.card_type.optional(),
      option1: ItemSchema.shape.option1.optional(),
      option2: ItemSchema.shape.option2.optional(),
      option3: ItemSchema.shape.option3.optional(),
      option4: ItemSchema.shape.option4.optional(),
      option5: ItemSchema.shape.option5.optional(),
      option6: ItemSchema.shape.option6.optional(),
      displaytype1: ItemSchema.shape.displaytype1.optional(),
      displaytype2: ItemSchema.shape.displaytype2.optional(),
      myca_primary_pack_id: ItemSchema.shape.myca_primary_pack_id.optional(),
      modelNumber: z.string().optional(),
      display_name: ItemSchema.shape.display_name.optional(),
      ...defPagination(),
      hasStock: z
        .boolean()
        .optional()
        .describe('在庫数を持っているもの限定にするかどうか'),
      isPack: z.boolean().optional().describe('パックかどうか'),
      isMycalinksItem: z
        .boolean()
        .optional()
        .describe('Mycaアプリで管理されている商品かどうか'),
      fromTablet: z
        .boolean()
        .optional()
        .describe(
          '在庫検索タブレットからのリクエストかどうか（取得できる商品カテゴリ、ジャンル等が制限される）',
        ),
      onlyEcPublishableProducts: z
        .boolean()
        .optional()
        .describe('ECに公開可能な商品のみを取得する'),
      infinite_stock: z
        .boolean()
        .optional()
        .describe(
          'trueを指定すると無限在庫のみを取得 falseだと無限在庫を除く 未指定だとすべて',
        ),
      hasMarketPriceGap: z
        .boolean()
        .optional()
        .describe(
          'trueを指定すると、相場価格（market_price）と商品マスタ販売価格（sell_price）の差があるもののみを取得する',
        ),
      marketPriceUpdatedAtGte: z
        .date()
        .optional()
        .describe('相場価格が指定した日時以降に変動しているもののみ取得'),
      type: ItemTypeSchema.optional().describe('商品のタイプ'),
      status: ItemSchema.shape.status.optional().describe('商品のステータス'),
      ...defOrderBy({
        sell_price: '販売価格',
        buy_price: '買取価格',
        order_number: '指定された並び順',
        products_stock_number: '総在庫数',
        display_name: '名前',
        id: 'ID',
        market_price: '市場相場価格',
        market_price_gap_rate: '市場相場価格変動率',
      }),
      includesSummary: z
        .boolean()
        .optional()
        .describe('統計情報を入れるかどうか（入れない場合は未指定）'),
      includesProducts: z
        .boolean()
        .optional()
        .describe('productsの情報まで同時に取得するかどうか'),
      includesMycaItemInfo: z
        .boolean()
        .optional()
        .describe('Mycaの商品情報を取得するかどうか 相場価格用'),
      includesInnerBoxItemInfo: z
        .boolean()
        .optional()
        .describe('カートンマスタだった場合、内包ボックスの情報まで取得するか'),
      code: z
        .string()
        .optional()
        .describe('商品コード')
        .openapi({ deprecated: true }),
    }),
  },
  process: ``,
  response: z.object({
    items: z.array(
      ItemSchema.merge(
        z.object({
          genre_display_name: Item_GenreSchema.shape.display_name,
          category_handle: Item_CategorySchema.shape.handle,
          category_display_name: Item_CategorySchema.shape.display_name,
          category_condition_options: z.array(
            z.object({
              id: Item_Category_Condition_OptionSchema.shape.id,
              display_name:
                Item_Category_Condition_OptionSchema.shape.display_name,
            }),
          ),
          metas: z.array(
            z.object({
              label: z.string(),
              value: z.string(),
              columnOnPosItem: z.string(),
            }),
          ),
          products: z.array(
            ProductSchema.merge(
              z.object({
                item_infinite_stock: ItemSchema.shape.infinite_stock,
                displayNameWithMeta: z.string(),
                tablet_limit_count: z
                  .number()
                  .optional()
                  .describe('タブレットでの注文可能数'),
                condition_option_display_name:
                  Item_Category_Condition_OptionSchema.shape.display_name,
                condition_option_order_number:
                  Item_Category_Condition_OptionSchema.shape.order_number,
                actual_ec_publishable_stock_number: z
                  .number()
                  .describe(
                    'ECに公開可能な在庫数 無限在庫ではない場合は、在庫数 - 予約数',
                  ),
              }),
            ),
          ),
          bundle_item_products: z
            .array(Bundle_Item_ProductSchema)
            .optional()
            .describe('type=BUNDLEを指定した時'),
          original_pack_products: z
            .array(
              Original_Pack_ProductSchema.merge(
                z.object({
                  product__display_name: ProductSchema.shape.display_name,
                  product__displayNameWithMeta: z.string(),
                  product__item__rarity: ItemSchema.shape.rarity,
                  product__item__cardnumber: ItemSchema.shape.cardnumber,
                  product__item__expansion: ItemSchema.shape.expansion,
                  product__image_url: ProductSchema.shape.image_url,
                }),
              ),
            )
            .describe('type=ORIGINAL_PACKを指定した時'),

          //以下、includesMycaItemInfo=trueの時のみ
          market_price_updated_at: z
            .date()
            .optional()
            .describe('Mycaの市場価格更新日時'),
          market_price: z.number().optional().describe('Mycaの市場価格'),
          previous_market_price: z
            .number()
            .optional()
            .describe('Mycaの市場価格の前の値'),
          market_price_gap_rate: z
            .number()
            .optional()
            .describe('Mycaの市場価格の前の値'),
          inner_box_item: ItemSchema.optional()
            .nullable()
            .describe(
              'includesInnerBoxItemInfo=trueの時、値が入る可能性がある',
            ),
        }),
      ),
    ),
    totalValues: z
      .object({
        itemCount: z.number().describe('ヒットした件数'),
      })
      .optional()
      .describe('統計情報'),
  }),
} satisfies BackendApiDef;

export const createOrUpdateItemGroupApi = {
  summary: '商品グループ作成・更新',
  description: '商品グループを作成・更新する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/item/category/{item_category_id}/group',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      item_category_id: Item_CategorySchema.shape.id,
    }),
    body: z.object({
      id: Item_GroupSchema.shape.id.optional().describe('更新する場合、そのID'),
      display_name: Item_GroupSchema.shape.display_name.describe('名前'),
    }),
  },
  process: ``,
  response: Item_GroupSchema,
  error: {} as const,
} satisfies BackendApiDef;

export const deleteItemGroupApi = {
  summary: '商品グループ削除',
  description: '商品グループを削除する',
  method: ApiMethod.DELETE,
  path: '/store/{store_id}/item/category/{item_category_id}/group/{item_group_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      item_category_id: Item_CategorySchema.shape.id,
      item_group_id: Item_GroupSchema.shape.id,
    }),
  },
  process: ``,
  response: defOk('商品グループが削除されました'),
  error: {} as const,
} satisfies BackendApiDef;

// export const getItemFindOptionApi = {
//   summary: '商品検索オプション取得',
//   description: '商品マスタを検索するための絞り込み選択肢を取得する',
//   method: ApiMethod.GET,
//   path: '/store/{store_id}/item/find-option',
//   privileges: {
//     role: [apiRole.pos, apiRole.everyone],
//   },
//   request: {
//     params: z.object({
//       store_id: StoreSchema.shape.id,
//     }),
//     query: z.object({
//       genre_id: Item_GenreSchema.shape.id.describe(
//         'POS上でのジャンルIDを指定しないといけない',
//       ),
//       category_id: Item_CategorySchema.shape.id.describe(
//         'POS上でのカテゴリIDを指定しないといけない',
//       ),
//     }),
//   },
//   process: ``,
//   response: z.object({
//     searchElements: z.array(
//       z.object({
//         metaLabel: z.string().describe('この絞り込み要素の名前'),
//         columnOnPosItem: z.string().describe('POSのItem上でのカラム名'),
//         options: z.array(
//           z.object({
//             label: z.string().describe('選択肢名'),
//             value: z.string().describe('選択肢値 現状labelと同値'),
//           }),
//         ),
//       }),
//     ),
//   }),
//   error: {
//     invalidCategoryGenre: {
//       status: 400,
//       messageText: 'カテゴリIDとジャンルIDの指定が不適切です',
//     },
//   } as const,
// } satisfies BackendApiDef;

export const getTabletAllowedGenresCategoriesApi = {
  summary: 'タブレット許可ジャンル/カテゴリ取得',
  description: '在庫検索タブレットで許可するカテゴリ・ジャンルの設定を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/item/tablet-allowed-genres-categories',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
  },
  process: ``,
  response: z.object({
    tabletAllowedGenresCategories: z.array(z.any()),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const setTabletAllowedGenresCategoriesApi = {
  summary: 'タブレット許可ジャンル/カテゴリ設定',
  description: '在庫検索タブレットで許可するカテゴリ・ジャンルを設定する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/item/tablet-allowed-genres-categories',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      tabletAllowedGenresCategories: z.array(
        z.object({
          genre_id: z.number().describe('ジャンルID'),
          category_id: z.number().describe('カテゴリID'),
          condition_option_id: z
            .number()
            .optional()
            .nullable()
            .describe('状態選択肢ID nullは全許容'),
          specialty_id: z
            .number()
            .optional()
            .nullable()
            .describe('スペシャルティID nullは全許容'),
          no_specialty: z
            .boolean()
            .optional()
            .describe(
              'スペシャルティなしのみ許容 これを指定する時、specialty_idはnullじゃないといけない',
            ),
          limit_count: z
            .number()
            .optional()
            .describe('一回の注文数の上限 0は無制限'),
        }),
      ),
    }),
  },
  process: ``,
  response: z.object({
    tabletAllowedGenresCategories: z.array(z.any()),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const importAllItemsFromAppByGenreApi = {
  summary: 'アプリから指定ジャンルのアイテム一括インポート',
  description: 'アプリから指定ジャンルのアイテムを一気にインポートする',
  method: ApiMethod.POST,
  path: '/store/{store_id}/item/genre/{item_genre_id}/import-items-from-app',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      item_genre_id: Item_GenreSchema.shape.id,
    }),
    body: z.object({
      targetCategoryHandles: z
        .array(Item_CategorySchema.shape.handle)
        .optional()
        .describe('インポートするカテゴリのハンドル CARD / BOX'),
    }),
  },
  process: ``,
  response: defOk('アイテムのインポートを開始しました'),
  error: {
    cantDeleteSystemGenre: {
      status: 400,
      messageText: '自動生成部門は削除できません',
    },
    cantAutoUpdateSystemGenre: {
      status: 400,
      messageText: '自動生成部門以外は自動更新設定ができません',
    },
  } as const,
} satisfies BackendApiDef;

export const createAllItemsFromPackApi = {
  summary: 'パックからのアイテム一括追加',
  description: 'ボックスごとアイテムを一気に追加する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/item/pack',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      myca_pack_id: z
        .number()
        .describe('Myca上のアイテムIDではなく、パックIDを指定する'),
    }),
  },
  process: ``,
  response: defOk('カードの登録が開始されました'),
  error: {} as const,
} satisfies BackendApiDef;

export const listItemWithEcOrderApi = {
  summary: 'EC在庫別取引一覧',
  description: 'ECの在庫別取引一覧を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/item/ec-order',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      display_name: ItemSchema.shape.display_name.optional().describe('商品名'),
      item_id: ItemSchema.shape.id.optional().describe('商品ID'),
      cardnumber: ItemSchema.shape.cardnumber
        .optional()
        .describe('商品カード番号'),
      rarity: ItemSchema.shape.rarity.optional().describe('レアリティ'),
      genre_id: Item_GenreSchema.shape.id
        .optional()
        .describe('商品マスタジャンルID'),
      orderCreatedAtGte: z.date().optional().describe('注文日時（開始）'),
      orderCreatedAtLt: z.date().optional().describe('注文日時（終了）'),
      ...defOrderBy({
        total_item_count: '合計取引点数',
        total_order_count: '合計注文数',
        total_price: '取引総額',
      }),
      ...defPagination(),
      includesSummary: z
        .boolean()
        .optional()
        .describe('trueだったら合計数も取得する'),
      includesEcOrders: z
        .boolean()
        .optional()
        .describe('trueだったらECの注文履歴情報も取得する'),
    }),
  },
  process: `パスパラムで指定されているストアのECの注文履歴を商品マスタベースで取得する`,
  response: z.object({
    items: z.array(
      z.object({
        item: ItemSchema.describe('商品マスタ自体の情報'),
        item_id: ItemSchema.shape.id,
        ecOrderStats: z.object({
          ecOrderCount: z.number().describe('ECの取引件数'),
          ecOrderItemCount: z.number().describe('ECの取引点数'),
          ecOrderTotalPrice: z.number().describe('ECの取引総額'),
        }),
        ecOrderCartStoreProducts: z
          .array(
            z.object({
              order_store: z
                .object({
                  order: z.object({
                    id: z.number().describe('注文ID'),
                    ordered_at: z.date().describe('注文日時').nullable(),
                  }),
                })
                .describe('店舗ごとのカート情報'),
              product: z
                .object({
                  id: ProductSchema.shape.id.describe('在庫ID'),
                  condition_option: z
                    .object({
                      id: Item_Category_Condition_OptionSchema.shape.id.describe(
                        '状態の選択肢ID',
                      ),
                      display_name:
                        Item_Category_Condition_OptionSchema.shape.display_name.describe(
                          '状態の選択肢名',
                        ),
                    })
                    .nullable(),
                })
                .describe('在庫の詳細情報'),
              item_count: z.number().describe('この在庫の点数'),
              total_unit_price: z.number().describe('最終的な単価'),
            }),
          )
          .optional()
          .describe('includesEcOrders=trueの時のみ'),
      }),
    ),
    summary: z
      .object({
        totalCount: z.number().describe('合計件数'),
        totalSellPrice: z.number().describe('合計販売価格'),
      })
      .optional()
      .describe('includesSummary=trueを指定したら返ってくるフィールド'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const adjustItemsWithMarketPriceGapApi = {
  summary: '相場価格とのギャップがある商品マスタ取得・調整',
  description:
    '相場価格とギャップがある商品マスタをスリムに取得し、オプションで価格調整を行う',
  method: ApiMethod.POST,
  path: '/store/{store_id}/item/market-price/adjust-gap',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      genre_id: Item_GenreSchema.shape.id.optional().describe('対象ジャンルID'),
      category_id: Item_CategorySchema.shape.id
        .optional()
        .describe('対象カテゴリID'),
    }),
    body: z.object({
      adjustAll: z.boolean().optional().describe('価格の調整を行うかどうか'),
    }),
  },
  process: ``,
  response: z.object({
    targetItems: z
      .array(
        z.object({
          id: ItemSchema.shape.id,
          display_name: ItemSchema.shape.display_name,
          market_price: ItemSchema.shape.market_price,
          sell_price: ItemSchema.shape.sell_price,
          cardnumber: ItemSchema.shape.cardnumber.describe('型番'),
          expansion: ItemSchema.shape.expansion.describe('エキスパンション'),
          rarity: ItemSchema.shape.rarity.describe('レアリティ'),
        }),
      )
      .describe('対象の商品マスタたち'),
    adjustRequested: z
      .boolean()
      .describe('価格調整リクエストが送信されたかどうか'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const subscribeUpdateItemApi = {
  summary: '商品マスタ更新イベント取得',
  description: '商品マスタの更新イベントを取得する（リアルタイムAPI）',
  method: ApiMethod.GET,
  path: '/store/{store_id}/item/{item_id}/subscribe',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      item_id: ItemSchema.shape.id,
    }),
  },
  process: `商品マスタの定義などが更新された時に通知する`,
  response: z.any().describe('ストリームレスポンス'),
  error: {} as const,
} satisfies BackendApiDef;

export const createProductApi = {
  summary: '在庫作成',
  description: '在庫を作成',
  method: ApiMethod.POST,
  path: '/store/{store_id}/item/{item_id}/product',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      item_id: ItemSchema.shape.id,
    }),
    body: z.object({
      specific_sell_price: ProductSchema.shape.specific_sell_price
        .optional()
        .describe('独自販売価格'),
      specific_buy_price: ProductSchema.shape.specific_buy_price
        .optional()
        .describe('独自買取価格'),
      condition_option_id:
        Item_Category_Condition_OptionSchema.shape.id.describe(
          '状態の選択肢ID',
        ),
      specialty_id: ProductSchema.shape.specialty_id
        .optional()
        .describe('スペシャルティID'),
      management_number: ProductSchema.shape.management_number
        .optional()
        .describe('管理番号 鑑定番号'),
      consignment_client_id: ProductSchema.shape.consignment_client_id
        .optional()
        .describe('委託者ID'),
      allowDuplicate: z
        .boolean()
        .optional()
        .describe('重複を許可するかどうか 通常は指定しなくて大丈夫'),
    }),
  },
  process: `

  `,
  response: ProductSchema,
  error: {} as const,
} satisfies BackendApiDef;

export const regenerateConditionOptionProductsApi = {
  summary: '特定の状態の在庫を作る',
  description:
    '特定の状態の在庫を作る（不具合などにより追加できてなかった時用）',
  method: ApiMethod.POST,
  path: '/store/{store_id}/item/category/{item_category_id}/condition-option/{condition_option_id}/regenerate-products',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      item_category_id: Item_CategorySchema.shape.id,
      condition_option_id: Item_Category_Condition_OptionSchema.shape.id,
    }),
  },
  process: `

  `,
  response: defOk('在庫の生成を開始しました'),
  error: {} as const,
} satisfies BackendApiDef;

export const createCartonItemApi = {
  summary: 'カートンマスタを作成する',
  description: 'カートンマスタを作成する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/item/{item_id}/carton',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      item_id: ItemSchema.shape.id,
    }),
    body: z.object({
      box_pack_count: z
        .number()
        .positive()
        .describe('1カートンあたりのボックス数'),
    }),
  },
  process: `

  `,
  response: z.object({
    item: ItemSchema.describe('ボックスマスタの方の情報'),
    cartonItem: ItemSchema.describe('カートンマスタ'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getPackItemBoxDefApi = {
  summary: 'パック商品マスタのボックス情報を取得',
  description: 'パック商品マスタのボックス情報を取得',
  method: ApiMethod.GET,
  path: '/store/{store_id}/item/{item_id}/box-def',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      item_id: ItemSchema.shape.id,
    }),
  },
  process: `

  `,
  response: z.object({
    boxItems: z.array(
      z.object({
        pos_item_info: ItemSchema.nullable().describe(
          'POS上に登録されていたらその商品マスタ情報',
        ),
        myca_item_id: z.number().describe('Mycaデータベース上でのID'),
        image_url: z.string().nullable().describe('画像URL'),
        genre_name: z.string().describe('ジャンル名'),
        display_name: z.string().describe('カード名'),
        cardnumber: z.string().nullable().describe('カード番号'),
        cardseries: z.string().nullable().describe('カードシリーズ'),
        expansion: z.string().nullable().describe('エキスパンション'),
        rarity: z.string().nullable().describe('レアリティ'),
        myca_pack_id: z
          .number()
          .nullable()
          .describe('Mycaデータベース上でのpack_id'),
        pack_item_count: z
          .number()
          .nullable()
          .describe(
            'このパックの中のこのアイテムのアイテム数（決まっている場合）',
          ),
        displayNameWithMeta: z.string().describe('メタ情報付きの表示名'),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getAllStoreItemApi = {
  summary: '全店舗商品マスタ取得',
  description: '全店舗商品マスタ取得',
  method: ApiMethod.GET,
  path: '/store/all/item',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    query: z.object({
      genre_display_name: Item_GenreSchema.shape.display_name
        .optional()
        .describe('ジャンル名'),
      category_display_name: Item_CategorySchema.shape.display_name
        .optional()
        .describe('カテゴリ名'),
      name: z.string().optional().describe('文字列検索'),

      ...defPagination(),
    }),
  },
  process: `

  `,
  response: z.object({
    items: z.array(
      ItemSchema.extend({
        products: z.array(
          ProductSchema.extend({
            condition_option: Item_Category_Condition_OptionSchema.nullable(),
            specialty: SpecialtySchema.nullable(),
            // consignment_client: Consignment_ClientSchema.nullable(),
            item: z.object({
              rarity: ItemSchema.shape.rarity,
              expansion: ItemSchema.shape.expansion,
              cardnumber: ItemSchema.shape.cardnumber,
              infinite_stock: ItemSchema.shape.infinite_stock,
              myca_item_id: ItemSchema.shape.myca_item_id,
            }),
            displayNameWithMeta: z
              .string()
              .optional()
              .describe('メタ情報付きの表示名'),
          }),
        ),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;
