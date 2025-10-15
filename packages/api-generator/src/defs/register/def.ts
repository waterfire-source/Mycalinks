import {
  AccountSchema,
  RegisterSchema,
  Register_Cash_HistorySchema,
  Register_SettlementSchema,
  Register_Settlement_DrawerSchema,
  Register_Settlement_SalesSchema,
  RegisterSettlementKindSchema,
  RegisterStatusSchema,
  StoreSchema,
  TransactionPaymentMethodSchema,
  TransactionSalesKindSchema,
} from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOk } from '../../generator/util';

extendZodWithOpenApi(z);

// Define ChangeRegisterKind enum
const ChangeRegisterKindSchema = z.enum([
  'SALES',
  'ADJUST',
  'EXPORT',
  'IMPORT',
  'RESET',
]);

export const registerSettlementApi = {
  summary: 'レジ精算',
  description: 'レジ精算を行う',
  method: ApiMethod.POST,
  path: '/store/{store_id}/register/{register_id}/settlement',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      register_id: RegisterSchema.shape.id.describe('対象のレジID'),
    }),
    body: z.object({
      actual_cash_price:
        Register_SettlementSchema.shape.actual_cash_price.describe(
          '実際の現金量',
        ),
      kind: Register_SettlementSchema.shape.kind.describe(
        '精算のモード 開店or閉店or中間点検',
      ),
      drawerContents: z
        .array(
          z.object({
            denomination:
              Register_Settlement_DrawerSchema.shape.denomination.describe(
                '金種',
              ),
            item_count:
              Register_Settlement_DrawerSchema.shape.item_count.describe(
                'その個数',
              ),
          }),
        )
        .describe('ドロワの中身（金種）'),
    }),
  },
  process: `レジ精算処理`,
  response: Register_SettlementSchema.describe('作成されたリソースの情報'),
  error: {} as const,
} satisfies BackendApiDef;

export const createRegisterApi = {
  summary: 'レジ作成・更新',
  description: 'レジの作成・更新を行う',
  method: ApiMethod.POST,
  path: '/store/{store_id}/register',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      id: RegisterSchema.shape.id.optional().describe('更新したいレジのID'),
      display_name: RegisterSchema.shape.display_name
        .optional()
        .describe('新規作成時は必要'),
      cash_reset_price: RegisterSchema.shape.cash_reset_price
        .optional()
        .describe('レジ金リセットの価格'),
      sell_payment_method: RegisterSchema.shape.sell_payment_method
        .optional()
        .describe('販売の支払い方法'),
      buy_payment_method: RegisterSchema.shape.buy_payment_method
        .optional()
        .describe('買取の支払い方法'),
      status: RegisterSchema.shape.status
        .optional()
        .describe('レジ自体の開閉状態'),
      auto_print_receipt_enabled:
        RegisterSchema.shape.auto_print_receipt_enabled
          .optional()
          .describe('レシートの自動印刷がONになっているかどうか'),
    }),
  },
  process: `レジ作成処理`,
  response: RegisterSchema.describe('作成されたレジの情報'),
  error: {
    invalidAccountId: {
      status: 400,
      messageText:
        '紐づけるアカウントのIDはログイン中のIDを指定する必要があります',
    },
  } as const,
} satisfies BackendApiDef;

export const deleteRegisterApi = {
  summary: 'レジ削除',
  description: 'レジを削除する',
  method: ApiMethod.DELETE,
  path: '/store/{store_id}/register/{register_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      register_id: RegisterSchema.shape.id,
    }),
  },
  process: `レジ削除処理`,
  response: defOk('レジの削除に成功しました'),
  error: {} as const,
} satisfies BackendApiDef;

export const listRegisterSettlementApi = {
  summary: 'レジ精算リスト取得',
  description: 'レジ精算のリストを取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/register/settlement',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      kind: RegisterSettlementKindSchema.optional().describe('レジ精算の種類'),
      register_id: RegisterSchema.shape.id.optional().describe('レジID'),
      today: z
        .boolean()
        .optional()
        .describe('本日のものかどうか（開店中のみ可能）'),
    }),
  },
  process: ``,
  response: z.object({
    settlements: z.array(
      Register_SettlementSchema.merge(
        z.object({
          register_settlement_drawers: z
            .array(Register_Settlement_DrawerSchema)
            .describe('ドロワーの内訳'),
          sales: z
            .array(Register_Settlement_SalesSchema)
            .describe('売り上げの情報（支払い方法別）'),
        }),
      ),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getRegisterSettlementApi = {
  summary: 'レジ精算詳細取得',
  description: 'レジ精算の詳細情報を取得する（精算レシート印刷用）',
  method: ApiMethod.GET,
  path: '/store/{store_id}/register/{register_id}/settlement/{settlement_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      register_id: RegisterSchema.shape.id,
      settlement_id: Register_SettlementSchema.shape.id.describe('レジ精算ID'),
    }),
  },
  process: ``,
  response: z.object({
    settlementInfo: Register_SettlementSchema.merge(
      z.object({
        register_settlement_drawers: z.array(Register_Settlement_DrawerSchema),
      }),
    ),
    receiptCommand: z
      .string()
      .describe('レジ精算レシートを印刷するためのEPOSコマンド'),
    closeReceiptCommand: z
      .string()
      .nullable()
      .describe('閉店精算レシートを印刷するためのEPOSコマンド'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const changeRegisterCashApi = {
  summary: 'レジ内現金変動',
  description: 'レジ内の現金を変動させる',
  method: ApiMethod.PUT,
  path: '/store/{store_id}/register/{register_id}/cash',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      register_id: RegisterSchema.shape.id.describe(
        'レジ金を個別で管理しない場合でも、自分のレジIDをここに入れる',
      ),
    }),
    body: z
      .object({
        changeAmount: Register_Cash_HistorySchema.shape.change_price
          .optional()
          .refine((v) => v === undefined || v !== 0, {
            message: '変動値には0以外の値を指定してください',
          })
          .describe('変動させる現金量 +だったら入金 -だったら出金'),
        toAmount: z
          .number()
          .optional()
          .refine((v) => v === undefined || v >= 0, {
            message: '指定金額は0円以上にしてください',
          })
          .describe('〜円にしたい時の指定'),
        reason: Register_Cash_HistorySchema.shape.description
          .optional()
          .describe('理由'),
        kind: ChangeRegisterKindSchema.describe('変動の種類'),
      })
      .refine(
        (data) =>
          data.changeAmount !== undefined || data.toAmount !== undefined,
        {
          message: '変動額または目標額のいずれかを指定してください',
        },
      ),
  },
  process: ``,
  response: RegisterSchema.describe('レジの情報'),
  error: {} as const,
} satisfies BackendApiDef;

export const getRegisterCashHistoryApi = {
  summary: 'レジ現金変動履歴取得',
  description: 'レジの現金変動履歴を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/register/cash-history',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      source_kind: z
        .string()
        .optional()
        .describe(
          '変動の理由を指定することができる カンマ区切りで複数指定可能',
        ),
      startAt: Register_Cash_HistorySchema.shape.datetime
        .optional()
        .describe('取得期間の開始日時'),
      endAt: Register_Cash_HistorySchema.shape.datetime
        .optional()
        .describe('取得期間の終了日時'),
      register_id: Register_Cash_HistorySchema.shape.register_id
        .optional()
        .describe('レジのID'),
      skip: z.number().optional().describe('ページネーション用'),
      take: z.number().optional().describe('ページネーション用'),
    }),
  },
  process: ``,
  response: z.object({
    history: z.array(
      z.object({
        id: Register_Cash_HistorySchema.shape.id.describe('変動レコードのID'),
        staff_account_id:
          Register_Cash_HistorySchema.shape.staff_account_id.describe(
            '担当者のアカウントID',
          ),
        staff_display_name:
          AccountSchema.shape.display_name.describe('担当者の名前'),
        source_kind:
          Register_Cash_HistorySchema.shape.source_kind.describe(
            '現金変動の種類',
          ),
        change_price:
          Register_Cash_HistorySchema.shape.change_price.describe('変動額'),
        description:
          Register_Cash_HistorySchema.shape.description.describe(
            '変動の説明など',
          ),
        result_cash_price:
          Register_Cash_HistorySchema.shape.result_cash_price.describe(
            '変動した結果、ストア内の現金はいくらになったのか',
          ),
        result_register_cash_price:
          Register_Cash_HistorySchema.shape.result_register_cash_price.describe(
            'ストアでレジ金を個別管理している時の金額',
          ),
        datetime:
          Register_Cash_HistorySchema.shape.datetime.describe('変動日時'),
        register_id:
          Register_Cash_HistorySchema.shape.register_id.describe('レジID'),
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getRegisterTodaySummaryApi = {
  summary: 'レジ当日まとめ情報取得',
  description: 'レジの当日まとめ情報を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/register/{register_id}/today-summary',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      register_id: RegisterSchema.shape.id,
    }),
  },
  process: ``,
  response: z.object({
    cashFlowData: z.object({
      openedDateTime: z.date().describe('本日の開店時間'),
      initCashPrice:
        Register_SettlementSchema.shape.actual_cash_price.describe(
          '営業開始時の現金',
        ),
      idealCashPrice: z.number().describe('理論上の現金'),
      transaction_sell: z.number().describe('本日の現金販売売上'),
      transaction_buy: z.number().describe('本日の現金買取合計'),
      transaction_sell_return: z.number().describe('本日の現金販売返金合計'),
      transaction_buy_return: z.number().describe('本日の現金買取返金合計'),
      import: z.number().describe('本日の入金合計'),
      export: z.number().describe('本日の出金合計'),
      sales: z.number().describe('本日のリセット調整額合計（+ - あり）'),
      adjust: z.number().describe('本日の調整（過不足修正用）合計（+ - あり）'),
      manageSeparately: z
        .boolean()
        .describe('レジごとのデータか一括か（店の設定に依存）'),
    }),
    transactionSalesData: z
      .array(
        z.object({
          kind: TransactionSalesKindSchema.describe(
            'returnがついているものは返金',
          ),
          payment_method: TransactionPaymentMethodSchema.describe('支払い方法'),
          total_price: z.number().describe('合計額'),
        }),
      )
      .describe('取引種類、支払い方法ごとのデータ'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getRegisterApi = {
  summary: 'レジ取得',
  description: 'レジ情報を取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/register',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      inUse: z
        .boolean()
        .optional()
        .describe(
          '使用中のものだけ取得する時true 使用中じゃないものだけ取得する時false',
        ),
      me: z
        .boolean()
        .optional()
        .describe('ログイン中の端末に結びついているレジだけ取得するかどうか'),
      status:
        RegisterStatusSchema.optional().describe('開いているか閉まっているか'),
    }),
  },
  process: ``,
  response: z.object({
    registers: z.array(RegisterSchema),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const createSquareTerminalDeviceCodeApi = {
  summary: 'Squareターミナル端末コード発行',
  description: 'Squareターミナルの端末コードを発行する',
  method: ApiMethod.POST,
  path: '/store/{store_id}/register/{register_id}/square/create-device-code',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      register_id: RegisterSchema.shape.id,
    }),
  },
  process: ``,
  response: RegisterSchema,
  error: {} as const,
} satisfies BackendApiDef;
