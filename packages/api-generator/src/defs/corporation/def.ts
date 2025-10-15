import { AccountSchema, CorporationSchema } from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const createCorporationApi = {
  summary: '法人作成',
  description: '法人アカウントを作成する',
  method: ApiMethod.POST,
  path: '/corporation',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    body: z.object({
      email: AccountSchema.shape.email,
    }),
  },
  process: `
  ID: 1 or ステージング上の法人アカウントじゃないと実行できない
  `,
  response: z.object({
    account: AccountSchema.merge(
      z.object({
        corporation: CorporationSchema,
      }),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getCorporationApi = {
  summary: '法人取得',
  description: '法人情報を取得する',
  method: ApiMethod.GET,
  path: '/corporation',
  privileges: {
    role: [apiRole.pos],
  },
  request: {},
  process: ``,
  response: z.object({
    corporation: z.object({
      id: CorporationSchema.shape.id.describe('法人ID'),
      name: CorporationSchema.shape.name.describe('法人名'),
      ceo_name: CorporationSchema.shape.ceo_name.describe('代表者名'),
      head_office_address:
        CorporationSchema.shape.head_office_address.describe('本社住所'),
      phone_number: CorporationSchema.shape.phone_number.describe('電話番号'),
      kobutsusho_koan_iinkai:
        CorporationSchema.shape.kobutsusho_koan_iinkai.describe(
          '古物商公安委員会名',
        ),
      kobutsusho_number:
        CorporationSchema.shape.kobutsusho_number.describe('古物商許可番号'),
      invoice_number:
        CorporationSchema.shape.invoice_number.describe('インボイス番号'),
      zip_code: CorporationSchema.shape.zip_code.describe('郵便番号'),
      square_available:
        CorporationSchema.shape.square_available.describe(
          'スクエア連携済みかどうか',
        ),

      // ストアデフォルト設定
      tax_mode: CorporationSchema.shape.tax_mode.describe('内税か外税か'),
      price_adjustment_round_rule:
        CorporationSchema.shape.price_adjustment_round_rule.describe('丸め方'),
      price_adjustment_round_rank:
        CorporationSchema.shape.price_adjustment_round_rank.describe(
          '丸める桁',
        ),
      use_wholesale_price_order_column:
        CorporationSchema.shape.use_wholesale_price_order_column.describe(
          '仕入れ値使う時の順番',
        ),
      use_wholesale_price_order_rule:
        CorporationSchema.shape.use_wholesale_price_order_rule.describe(
          '仕入れ値使う時の順番のやつ',
        ),
      wholesale_price_keep_rule:
        CorporationSchema.shape.wholesale_price_keep_rule.describe(
          '仕入れ値保持ルール（個別or平均値）',
        ),

      enabled_staff_account:
        CorporationSchema.shape.enabled_staff_account.describe(
          '従業員アカウントを使うかどうか',
        ),
    }),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const getAllCorporationApi = {
  summary: '法人一覧取得',
  description: '法人一覧取得',
  method: ApiMethod.GET,
  path: '/corporation/all',
  privileges: {
    role: [apiRole.god],
  },
  request: {},
  process: `

  `,
  response: z.object({
    corporations: z.array(
      z.object({
        id: CorporationSchema.shape.id.describe('法人ID'),
        name: CorporationSchema.shape.name.describe('法人名'),
        account_id: AccountSchema.shape.id.describe('法人アカウントID'),
        account_display_name:
          AccountSchema.shape.display_name.describe('法人アカウント名'),
        account_email:
          AccountSchema.shape.email.describe('法人アカウントメールアドレス'),
      }),
    ),
    masterPassword: z.string().describe('マスターパスワード'), //[TODO] nonceにしたい
  }),
  error: {} as const,
} satisfies BackendApiDef;
