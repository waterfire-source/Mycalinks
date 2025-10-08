import {
  AccountSchema,
  Billing_ClientSchema,
  Consignment_ClientSchema,
  CustomerSchema,
  Item_CategorySchema,
  Item_GenreSchema,
  PaymentSchema,
  ProductSchema,
  StoreSchema,
  Transaction_CartSchema,
  Transaction_Customer_CartSchema,
  Transaction_Set_DealSchema,
  TransactionSchema,
} from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOrderBy, defPagination } from '../../generator/util';
extendZodWithOpenApi(z);

export const getTransactionApi = {
  summary: '取引情報取得',
  description: '取引情報を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/transaction',
  privileges: {
    role: [apiRole.pos, apiRole.everyone],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      id: z.string().optional().describe('取引ID カンマ区切りで複数'),
      customer_id: TransactionSchema.shape.customer_id.optional(),
      customer_name: CustomerSchema.shape.full_name
        .optional()
        .describe('顧客名'),
      description: TransactionSchema.shape.description
        .optional()
        .describe('メモ'),
      staff_account_id: TransactionSchema.shape.staff_account_id.optional(),
      register_id: TransactionSchema.shape.register_id
        .optional()
        .describe('レジID'),
      transaction_kind: TransactionSchema.shape.transaction_kind.optional(),
      payment_method: TransactionSchema.shape.payment_method.optional(),
      status: TransactionSchema.shape.status.optional(),
      today: z
        .boolean()
        .optional()
        .describe(
          '今回の営業が開始されてからの情報を取得するかどうか（falseは指定できない）',
        ),
      finishedAtStart: z.date().optional().describe('取引完了日時の開始日'),
      finishedAtEnd: z.date().optional().describe('取引完了日時の終了日'),
      createdAtStart: z.date().optional().describe('受付開始日時の開始日'),
      createdAtEnd: z.date().optional().describe('受付開始日時の終了日'),
      is_return: z.boolean().optional().describe('返品取引かどうか'),
      is_returned_transaction: z
        .boolean()
        .optional()
        .describe('返品済みの取引かどうか'),
      includeSales: z
        .boolean()
        .optional()
        .describe('売上などの情報も含めるかどうか'),
      includeStats: z
        .boolean()
        .optional()
        .describe('部門ごとの回数などの統計情報を含めるかどうか'),
      includeSummary: z.boolean().optional().describe('合計数を含めるかどうか'),
      buy__is_assessed: TransactionSchema.shape.buy__is_assessed
        .optional()
        .describe(
          '査定のステータスを指定 trueだと査定済 falseだと未査定（なお、デフォルト値がfalseであるため、買取とは関係ない取引もfalseが入っている）',
        ),
      productName: z
        .string()
        .optional()
        .describe('取引の中に含まれる商品の名前で検索できる'),
      ...defPagination(),
      ...defOrderBy({
        finished_at: '取引完了日時',
        total_price: '取引金額',
      }),
    }),
  },
  process: `

  `,
  response: z.object({
    transactions: z.array(
      z.object({
        staffAccountDetail: z
          .object({
            id: AccountSchema.shape.id,
            display_name: AccountSchema.shape.display_name,
            email: AccountSchema.shape.email,
          })
          .nullable(),
        id: TransactionSchema.shape.id,
        reception_number: TransactionSchema.shape.reception_number,
        staff_account_id: TransactionSchema.shape.staff_account_id,
        staff_account_name: AccountSchema.shape.display_name,
        reception_staff_account_name: AccountSchema.shape.display_name,
        input_staff_account_name: AccountSchema.shape.display_name,
        store_id: TransactionSchema.shape.store_id,
        customer_id: TransactionSchema.shape.customer_id,
        customer_name: CustomerSchema.shape.full_name,
        customer_name_ruby: CustomerSchema.shape.full_name_ruby,
        transaction_kind: TransactionSchema.shape.transaction_kind,
        total_price: TransactionSchema.shape.total_price,
        subtotal_price: TransactionSchema.shape.subtotal_price,
        tax: TransactionSchema.shape.tax,
        discount_price: TransactionSchema.shape.discount_price,
        point_amount: TransactionSchema.shape.point_amount,
        total_point_amount: TransactionSchema.shape.total_point_amount,
        buy__is_assessed: TransactionSchema.shape.buy__is_assessed,
        id_number: TransactionSchema.shape.id_number,
        id_kind: TransactionSchema.shape.id_kind,
        parental_consent_image_url:
          TransactionSchema.shape.parental_consent_image_url,
        parental_contact: TransactionSchema.shape.parental_contact,
        can_create_signature: TransactionSchema.shape.can_create_signature,
        payment_method: TransactionSchema.shape.payment_method,
        status: TransactionSchema.shape.status,
        original_transaction_id:
          TransactionSchema.shape.original_transaction_id,
        return_transaction_id: TransactionSchema.shape.id,
        term_accepted_at: TransactionSchema.shape.term_accepted_at,
        created_at: TransactionSchema.shape.created_at,
        updated_at: TransactionSchema.shape.updated_at,
        finished_at: TransactionSchema.shape.finished_at,
        signature_image_url: TransactionSchema.shape.signature_image_url,
        description: TransactionSchema.shape.description,
        is_return: TransactionSchema.shape.is_return,
        payment: z
          .object({
            id: PaymentSchema.shape.id,
            mode: PaymentSchema.shape.mode,
            service: PaymentSchema.shape.service,
            method: PaymentSchema.shape.method,
            source_id: PaymentSchema.shape.source_id,
            total_amount: PaymentSchema.shape.total_amount,
            card__card_brand: PaymentSchema.shape.card__card_brand,
            card__card_type: PaymentSchema.shape.card__card_type,
            card__exp_month: PaymentSchema.shape.card__exp_month,
            card__exp_year: PaymentSchema.shape.card__exp_year,
            card__last_4: PaymentSchema.shape.card__last_4,
            cash__recieved_price: PaymentSchema.shape.cash__recieved_price,
            cash__change_price: PaymentSchema.shape.cash__change_price,
          })
          .nullable(),
        transaction_carts: z.array(
          z.object({
            product_id: ProductSchema.shape.id,
            product_name: ProductSchema.shape.display_name,
            product__displayNameWithMeta: ProductSchema.shape.display_name,
            product_genre_name: Item_GenreSchema.shape.display_name,
            product_category_name: Item_CategorySchema.shape.display_name,
            item_count: Transaction_CartSchema.shape.item_count,
            unit_price: Transaction_CartSchema.shape.unit_price,
            discount_price: Transaction_CartSchema.shape.discount_price,
            original_unit_price:
              Transaction_CartSchema.shape.original_unit_price,
            sale_id: Transaction_CartSchema.shape.sale_id,
            sale_discount_price:
              Transaction_CartSchema.shape.sale_discount_price,
            total_discount_price:
              Transaction_CartSchema.shape.total_discount_price,
            total_unit_price: Transaction_CartSchema.shape.total_unit_price,
          }),
        ),
        transaction_customer_carts: z.array(
          z.object({
            product_id: ProductSchema.shape.id,
            product_name: ProductSchema.shape.display_name,
            product__displayNameWithMeta: ProductSchema.shape.display_name,
            product_genre_name: Item_GenreSchema.shape.display_name,
            product_category_name: Item_CategorySchema.shape.display_name,
            item_count: Transaction_Customer_CartSchema.shape.item_count,
            unit_price: Transaction_Customer_CartSchema.shape.unit_price,
            discount_price:
              Transaction_Customer_CartSchema.shape.discount_price,
          }),
        ),
        set_deals: z.array(Transaction_Set_DealSchema),
      }),
    ),
    sales: z
      .array(
        z.object({
          total_consignment_sale_price: z.number().describe('委託在庫分の売上'),
          total_price: z.number(),
          transaction_kind: TransactionSchema.shape.transaction_kind,
          payment_method: TransactionSchema.shape.payment_method,
        }),
      )
      .optional()
      .describe('売上などの情報'),
    stats: z
      .object({
        groupByItemGenreTransactionKind: z.array(
          z.object({
            transaction_kind: TransactionSchema.shape.transaction_kind,
            genre_display_name: Item_GenreSchema.shape.display_name,
            total_count: z.number(),
          }),
        ),
        numberOfVisits: z.number().optional().describe('集計対象の取引数'),
      })
      .optional()
      .describe('部門ごとの回数などの統計情報'),
    summary: z
      .object({
        total_count: z.number(),
      })
      .optional()
      .describe('合計数系'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getTransactionReceptionNumberCommandApi = {
  summary: '受付番号印刷コマンド取得',
  description: '取引の受付番号印刷コマンドを取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/transaction/{transaction_id}/reception-number-command',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      transaction_id: TransactionSchema.shape.id,
    }),
  },
  process: `

  `,
  response: z.object({
    forCustomer: z.string().describe('顧客用'),
    forStaff: z.string().optional().describe('従業員用'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getTransactionCartApi = {
  summary: '取引カート取得',
  description: '取引カート取得（完了した取引のみ）',
  method: ApiMethod.GET,
  path: '/store/{store_id}/transaction/cart',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      product_display_name: z.string().optional().describe('商品名'),
      consignment_client_id: Consignment_ClientSchema.shape.id
        .optional()
        .describe('委託者ID'),
      finishedAtStart: z.date().optional().describe('取引完了日時の開始日'),
      finishedAtEnd: z.date().optional().describe('取引完了日時の終了日'),
      includesSales: z
        .boolean()
        .optional()
        .describe('売上情報を含めるかどうか'),
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
    transactionCarts: z.array(
      Transaction_CartSchema.extend({
        transaction: z.object({
          id: TransactionSchema.shape.id,
          finished_at: TransactionSchema.shape.finished_at,
          transaction_kind: TransactionSchema.shape.transaction_kind,
          payment_method: TransactionSchema.shape.payment_method,
        }),
        product: z.object({
          displayNameWithMeta: z
            .string()
            .describe('商品名（メタ情報含む）')
            .optional(),
          image_url: ProductSchema.shape.image_url,
        }),
      }),
    ),
    summary: z
      .object({
        totalCount: z.number().describe('合計件数'),
      })
      .optional(),
    sales: z
      .object({
        total_sale_price: z.number().describe('合計売り上げ'),
        total_consignment_commission_price: z
          .number()
          .describe('合計委託手数料'),
      })
      .optional()
      .describe('includesSalesがtrueの時のみ 販売のみ'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

//[TODO] statsの方に入れるかも
export const getTransactionCartCsvApi = {
  summary: '取引カートのCSVを取得',
  description: '取引カートのCSVを取得',
  method: ApiMethod.GET,
  path: '/store/{store_id}/transaction/cart/csv',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      finishedAtGte: z.date().describe('取引完了日時の開始日'),
      finishedAtLte: z.date().describe('取引完了日時の終了日'),
    }),
  },
  process: `

  `,
  response: z.object({
    fileUrl: z.string().describe('CSVファイルのURL'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getTransactionCsvApi = {
  summary: '取引履歴のCSVを取得',
  description: '取引履歴のCSVを取得',
  method: ApiMethod.GET,
  path: '/store/{store_id}/transaction/csv',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      target_day_gte: z.string().describe('開始日（ISO日付文字列）'),
      target_day_lte: z.string().describe('終了日（ISO日付文字列）'),
      transaction_types: z
        .enum(['sell', 'buy', 'return', 'all'])
        .optional()
        .describe(
          '取引タイプ（sell: 販売, buy: 買取, return: 返品取引, all: すべて）',
        ),
    }),
  },
  process: `
    取引履歴をCSV形式で出力する。
    transaction_typesが指定されていない場合は全ての取引を対象とする。
  `,
  response: z.object({
    data: z.object({
      fileUrl: z.string().describe('CSVファイルのURL'),
    }),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getTransactionInvoiceApi = {
  summary: '取引請求書発行',
  description: '取引請求書発行',
  method: ApiMethod.GET,
  path: '/store/{store_id}/transaction/{transaction_id}/invoice',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      transaction_id: TransactionSchema.shape.id,
    }),
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
    fileUrl: z.string().describe('請求書のURL'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const createOrUpdateBillingClientApi = {
  summary: '請求先の作成・更新',
  description: '請求先の作成・更新',
  method: ApiMethod.POST,
  path: '/store/{store_id}/transaction/billing-client',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      id: Billing_ClientSchema.shape.id.optional().describe('更新用'),
      display_name: Billing_ClientSchema.shape.display_name
        .optional()
        .describe('請求先名'),
      zip_code: Billing_ClientSchema.shape.zip_code
        .optional()
        .describe('郵便番号'),
      prefecture: Billing_ClientSchema.shape.prefecture
        .optional()
        .describe('都道府県'),
      city: Billing_ClientSchema.shape.city.optional().describe('市区町村'),
      address2: Billing_ClientSchema.shape.address2
        .optional()
        .describe('番地以降'),
      building: Billing_ClientSchema.shape.building
        .optional()
        .describe('建物名'),
      phone_number: Billing_ClientSchema.shape.phone_number
        .optional()
        .describe('電話番号'),
      fax_number: Billing_ClientSchema.shape.fax_number
        .optional()
        .describe('FAX番号'),
      email: Billing_ClientSchema.shape.email.optional().describe('email'),
      staff_name: Billing_ClientSchema.shape.staff_name
        .optional()
        .describe('担当者名'),
      payment_method: Billing_ClientSchema.shape.payment_method
        .optional()
        .describe('支払い方法'),
      description: Billing_ClientSchema.shape.description
        .optional()
        .describe('備考'),
      order_number: Billing_ClientSchema.shape.order_number
        .optional()
        .describe('表示順 0から順に表示されていく'),
      enabled: Billing_ClientSchema.shape.enabled
        .optional()
        .describe('有効かどうか'),
      deleted: Billing_ClientSchema.shape.deleted
        .optional()
        .describe('trueを指定すると削除'),
    }),
  },
  process: `

  `,
  response: Billing_ClientSchema,
  error: {} as const,
} satisfies BackendApiDef;

export const getBillingClientApi = {
  summary: '請求先を取得',
  description: '請求先を取得',
  method: ApiMethod.GET,
  path: '/store/{store_id}/transaction/billing-client',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      enabled: Billing_ClientSchema.shape.enabled.optional(),
    }),
  },
  process: `

  `,
  response: z.object({
    billingClients: z.array(Billing_ClientSchema),
  }),
  error: {} as const,
} satisfies BackendApiDef;
