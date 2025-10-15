import { AccountSchema, ContractSchema, CorporationSchema } from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOk } from '../../generator/util';

extendZodWithOpenApi(z);

export const createContractApi = {
  summary: '契約作成',
  description: '新規契約を作成する',
  method: ApiMethod.POST,
  path: '/contract',
  privileges: {
    role: [apiRole.admin, apiRole.pos],
  },
  request: {
    body: z.object({
      start_at: ContractSchema.shape.start_at.describe('利用開始日'),
      main_account_monthly_fee:
        ContractSchema.shape.main_account_monthly_fee.describe(
          'メインアカウント月額利用料',
        ),
      corporation_management_account_fee:
        ContractSchema.shape.corporation_management_account_fee.describe(
          '本部管理アカウント利用料',
        ),
      mobile_device_connection_fee:
        ContractSchema.shape.mobile_device_connection_fee.describe(
          'スマホ・タブレット連携費用',
        ),
      initial_fee: ContractSchema.shape.initial_fee.describe('初期費用'),
    }),
  },
  process: ``,
  response: ContractSchema,
  error: {
    pastStartAt: {
      status: 400,
      messageText: '利用開始日を過去にすることはできません',
    },
  } as const,
} satisfies BackendApiDef;

export const payContractApi = {
  summary: '契約支払い',
  description: '契約の支払い処理を行う',
  method: ApiMethod.POST,
  path: '/contract/pay',
  privileges: {
    role: [apiRole.everyone],
  },
  request: {
    body: z.object({
      token:
        ContractSchema.shape.token.describe(
          'トークン（クエリパラメータから取得）',
        ),
      corporation: z
        .object({
          name: CorporationSchema.shape.name.describe('法人名'),
          ceo_name: CorporationSchema.shape.ceo_name.describe('法人代表者名'),
          head_office_address:
            CorporationSchema.shape.head_office_address.describe('本社所在地'),
          phone_number:
            CorporationSchema.shape.phone_number.describe('電話番号'),
        })
        .describe('本部情報'),
      account: z
        .object({
          email:
            AccountSchema.shape.email.describe('本部アカウントメールアドレス'),
        })
        .describe('本部用アカウント用'),
      card: z
        .object({
          token: z
            .string()
            .describe('MyToken.jsで発行したクレジットカードトークン'),
        })
        .describe('クレジットカード情報'),
    }),
  },
  process: ``,
  response: z.object({
    contract: z.object({
      status: ContractSchema.shape.status.describe(
        'ここがNOT_STARTEDだったら決済ができていない＝3Dセキュアが必要か、何らかのエラー STARTEDだったら3Dセキュアをせずに決済完了した感じ',
      ),
    }),
    tds: z
      .object({
        redirectUrl: z
          .string()
          .describe(
            '3Dセキュアの手続きを進めるためのURL このURLにアクセスして3Dセキュアの手続きをすすめたら、自動的にThanks画面に遷移する',
          ),
      })
      .optional()
      .describe('3Dセキュア情報（必要だったら）'),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const payContractSubscriptionApi = {
  summary: '契約月額料支払い',
  description: '契約の月額料金の支払い処理を行う',
  method: ApiMethod.POST,
  path: '/contract/pay/subscription',
  privileges: {
    role: [apiRole.bot, apiRole.pos],
  },
  request: {},
  process: ``,
  response: defOk('処理が完了しました'),
  error: {} as const,
} satisfies BackendApiDef;

export const getContractsApi = {
  summary: '契約取得',
  description: '契約情報を取得する',
  method: ApiMethod.GET,
  path: '/contract',
  privileges: {
    role: [apiRole.everyone],
  },
  request: {
    query: z.object({
      token: ContractSchema.shape.token.describe('トークンを指定する'),
    }),
  },
  process: ``,
  response: z.object({
    token_expires_at: ContractSchema.shape.token_expires_at,
    start_at: ContractSchema.shape.start_at,
    main_account_monthly_fee:
      ContractSchema.shape.main_account_monthly_fee.describe(
        'メインアカウント利用料',
      ),
    corporation_management_account_fee:
      ContractSchema.shape.corporation_management_account_fee.describe(
        '本部管理アカウント利用料',
      ),
    mobile_device_connection_fee:
      ContractSchema.shape.mobile_device_connection_fee.describe(
        'スマホ・タブレット連携費用',
      ),
    initial_fee: ContractSchema.shape.initial_fee.describe('初期費用'),
    initial_payment_price:
      ContractSchema.shape.initial_payment_price.describe(
        '初期支払い料 自動計算',
      ),
    monthly_payment_price:
      ContractSchema.shape.monthly_payment_price.describe(
        '月額支払い料 自動計算',
      ),
  }),
  error: {} as const,
} satisfies BackendApiDef;
