import {
  AccountSchema,
  InventorySchema,
  Inventory_CategorySchema,
  Inventory_GenreSchema,
  Inventory_ProductsSchema,
  Pack_Open_HistorySchema,
  Product_Wholesale_Price_HistorySchema,
  StoreSchema,
  ItemSchema,
  SpecialtySchema,
  Item_CategorySchema,
  Item_GenreSchema,
  Item_Category_Condition_OptionSchema,
} from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOk, defPagination, defPolicies } from '../../generator/util';
extendZodWithOpenApi(z);

export const createOrUpdateInventoryApi = {
  summary: '棚卸作成・更新',
  description: '棚卸を作成・更新する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/inventory',
  privileges: {
    role: [apiRole.pos],
    policies: defPolicies(['list_inventory']),
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      id: Pack_Open_HistorySchema.shape.id
        .optional()
        .describe('既存のパック開封に対しての処理'),

      item_category_ids: z
        .array(
          z.object({
            id: InventorySchema.shape.item_category_id,
          }),
        )
        .optional()
        .describe('商品種別ID 複数選択可能、新規作成時にのみ指定可能'),

      item_genre_ids: z
        .array(
          z.object({
            id: InventorySchema.shape.item_genre_id,
          }),
        )
        .optional()
        .describe('商品ジャンルID 複数選択可能、新規作成時にのみ指定可能'),

      staff_account_id: InventorySchema.shape.staff_account_id
        .optional()
        .describe('登録したスタッフ 編集モードの時は必要ない'),

      products: z
        .array(
          z.object({
            shelf_id:
              Inventory_ProductsSchema.shape.shelf_id.describe('棚のID'),
            product_id:
              Inventory_ProductsSchema.shape.product_id.describe('在庫ID'),
            staff_account_id:
              Inventory_ProductsSchema.shape.staff_account_id.describe(
                '担当者ID PCから送信の場合でも入れる',
              ),
            item_count:
              Inventory_ProductsSchema.shape.item_count.describe('個数'),
            input_total_wholesale_price:
              Inventory_ProductsSchema.shape.input_total_wholesale_price
                .optional()
                .describe('棚卸で入力した分の仕入れ値合計'),
          }),
        )
        .optional()
        .describe('棚卸対象の商品（PCから実行するときここを指定する）'),

      additional_products: z
        .array(
          z.object({
            shelf_id:
              Inventory_ProductsSchema.shape.shelf_id.describe('棚のID'),
            product_id:
              Inventory_ProductsSchema.shape.product_id.describe('在庫ID'),
            item_count:
              Inventory_ProductsSchema.shape.item_count.describe('個数'),
            input_total_wholesale_price:
              Inventory_ProductsSchema.shape.input_total_wholesale_price
                .optional()
                .describe('棚卸で入力した分の仕入れ値合計'),
          }),
        )
        .optional()
        .describe(
          '棚卸し対象の商品を追加するときに指定する（スマホから実行するときここを指定する）',
        ),

      title: InventorySchema.shape.title.optional(),
    }),
  },
  process: ``,
  response: InventorySchema.merge(
    z.object({
      products: z.array(
        Inventory_ProductsSchema.merge(
          z.object({
            staff_account: z.object({
              display_name:
                AccountSchema.shape.display_name.describe('担当者名'),
            }),
          }),
        ),
      ),
      item_genres: z.array(Inventory_GenreSchema),
      item_categories: z.array(Inventory_CategorySchema),
    }),
  ),
  error: {
    invalidProductsParameter: {
      status: 400,
      messageText:
        'productsとadditional_productsを同時に指定することはできません',
    },
    additionalProductsWhenCreate: {
      status: 400,
      messageText: '新規登録時にadditional_productsは指定できません',
    },
  } as const,
} satisfies BackendApiDef;

export const subscribeUpdateInventoryApi = {
  summary: '棚卸更新イベント取得',
  description: '棚卸の更新イベントを取得する（リアルタイムAPI）',
  method: ApiMethod.GET,
  path: '/store/{store_id}/inventory/{inventory_id}/subscribe',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      inventory_id: InventorySchema.shape.id.describe('棚卸ID'),
    }),
  },
  process: ``,
  response: z.any().describe('ストリームレスポンス'),
  error: {} as const,
} satisfies BackendApiDef;

export const getInventoriesApi = {
  summary: '棚卸情報を取得',
  description: '棚卸の基本情報を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/inventory',
  privileges: {
    role: [apiRole.pos],
    policies: defPolicies(['list_inventory']),
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      id: InventorySchema.shape.id.optional().describe('ID'),
      title: InventorySchema.shape.title.optional().describe('タイトル'),
      status: InventorySchema.shape.status.optional().describe('ステータス'),
      genre_id: ItemSchema.shape.genre_id.optional(),
      category_id: ItemSchema.shape.category_id.optional(),
      ...defPagination(),
    }),
  },
  process: ``,
  response: z.object({
    inventories: z.array(
      InventorySchema.merge(
        z.object({
          item_categories: z.array(
            z.object({
              item_category_id: z.number(),
            }),
          ),
          item_genres: z.array(
            z.object({
              item_genre_id: z.number(),
            }),
          ),
        }),
      ),
    ),
    totalCount: z.number(),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getInventoryProductsApi = {
  summary: '棚卸の在庫商品を取得',
  description: '指定された棚卸の在庫商品一覧を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/inventory/{inventory_id}/products',
  privileges: {
    role: [apiRole.pos],
    policies: defPolicies(['list_inventory']),
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      inventory_id: InventorySchema.shape.id,
    }),
    query: z.object({
      isInjectedWholesalePrice:
        Inventory_ProductsSchema.shape.wholesale_price_injected
          .optional()
          .describe(
            '棚卸の仕入れ値入力可否周りのパラメータ。true:仕入れ値入力が必要ですでに入力、false:仕入れ値入力が必要でまだ未入力',
          ),
      shelfId: Inventory_ProductsSchema.shape.shelf_id
        .optional()
        .describe('どの棚の商品を取得するか'),
      genre_id: Item_GenreSchema.shape.id
        .optional()
        .describe('ジャンルIDでフィルタリング'),
      category_id: Item_CategorySchema.shape.id
        .optional()
        .describe('カテゴリIDでフィルタリング'),
      condition_option_name:
        Item_Category_Condition_OptionSchema.shape.display_name
          .optional()
          .describe('コンディション名でフィルタリング'),
      diff_filter: z
        .enum(['all', 'hasDiff', 'noDiff', 'plus', 'minus'])
        .optional()
        .describe(
          '差分フィルタリング - all:全て、hasDiff:差分あり、noDiff:差分なし、plus:プラス差分、minus:マイナス差分',
        ),
      orderBy: z
        .enum(['item_count', 'diff_count', 'average_price', 'stock_count'])
        .optional()
        .describe(
          '並び順 - item_count:棚卸数量、diff_count:差分数量、average_price:平均仕入れ値、stock_count:理論在庫数',
        ),
      orderDirection: z
        .enum(['asc', 'desc'])
        .optional()
        .describe('並び方向 - asc:昇順、desc:降順'),
      ...defPagination(),
    }),
  },
  process: ``,
  response: z.object({
    products: z.array(
      Inventory_ProductsSchema.merge(
        z.object({
          product: z.object({
            id: z.number(),
            item_id: z.number(),
            display_name: z.string(),
            sell_price: z.number(),
            specific_sell_price: z.number().nullable(),
            condition_option_id: z.number().nullable(),
            specialty_id: z.number().nullable(),
            image_url: z.string().nullable(),
            management_number: z.string().nullable(),
            created_at: z.date(),
            updated_at: z.date(),
            deleted: z.boolean(),
            store_id: z.number(),
            displayNameWithMeta: z.string(),
            condition: Item_Category_Condition_OptionSchema,
            item: z.object({
              id: z.number(),
              display_name: z.string(),
              expansion: z.string(),
              cardnumber: z.string(),
              rarity: z.string(),
              genre: Item_GenreSchema,
              category: Item_CategorySchema,
            }),
            specialty: SpecialtySchema.nullable(),
          }),
        }),
      ),
    ),
    total_count: z.number(),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getInventoryCsvApi = {
  summary: '棚卸結果のCSVを取得',
  description: '棚卸結果のCSVを取得',
  method: ApiMethod.GET,
  path: '/store/{store_id}/inventory/{inventory_id}/csv',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      inventory_id: InventorySchema.shape.id,
    }),
  },
  process: `

  `,
  response: z.object({
    fileUrl: z.string().describe('CSVファイルのURL'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const injectInventoryWholesalePriceApi = {
  summary: '過去の棚卸に対して仕入れ値を注入する',
  description: '過去の棚卸に対して仕入れ値を注入する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/inventory/{inventory_id}/inject-wholesale-price',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      inventory_id: InventorySchema.shape.id,
    }),

    body: z.object({
      wholesalePriceList: z.array(
        z.object({
          product_id: Inventory_ProductsSchema.shape.product_id,
          wholesale_price_history_id:
            Inventory_ProductsSchema.shape.wholesale_price_history_id.describe(
              '書き換える仕入れ値のID',
            ),
          unit_price:
            Product_Wholesale_Price_HistorySchema.shape.unit_price.describe(
              '書き換える仕入れ値',
            ),
        }),
      ),
    }),
  },
  process: `

  `,
  response: defOk('仕入れ値を注入しました'),
  error: {} as const,
} satisfies BackendApiDef;
