import { Account_GroupSchema, AccountSchema, StoreSchema } from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOk, defPolicies } from '../../generator/util';

extendZodWithOpenApi(z);

export const AccountPolicySchema = Account_GroupSchema.omit({
  id: true,
  corporation_id: true,
  display_name: true,
  description: true,
  created_at: true,
  updated_at: true,
});

export const createOrUpdateAccountGroupApi = {
  summary: 'アカウントグループ作成・更新',
  description: 'アカウントグループの作成・更新を行う',
  method: ApiMethod.POST,
  path: '/account/group',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    body: z
      .object({
        id: AccountSchema.shape.id
          .optional()
          .describe('更新したい場合はそのID'),
        display_name: Account_GroupSchema.shape.display_name
          .optional()
          .describe('権限名 新規作成の場合は必須'),
      })
      .merge(AccountPolicySchema),
  },
  process: `
  アカウントグループの作成・更新を行う
  `,
  response: Account_GroupSchema,
  error: {} as const,
} satisfies BackendApiDef;

export const deleteAccountGroupApi = {
  summary: 'アカウントグループ削除',
  description: 'アカウントグループの削除を行う',
  method: ApiMethod.DELETE,
  path: '/account/group/{account_group_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      account_group_id: Account_GroupSchema.shape.id,
    }),
  },
  process: `
  アカウントグループの削除を行う
  `,
  response: defOk('アカウントグループの削除に成功しました'),
  error: {} as const,
} satisfies BackendApiDef;

export const getAccountGroupApi = {
  summary: 'アカウントグループ取得',
  description: 'アカウントグループの取得を行う',
  method: ApiMethod.GET,
  path: '/account/group',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    query: z.object({
      id: Account_GroupSchema.shape.id.optional(),
    }),
  },
  process: `
  アカウントグループの取得を行う
  `,
  response: z.object({
    account_groups: z.array(
      Account_GroupSchema.merge(
        z.object({
          accountsCount: z
            .number()
            .describe('このアカウントグループに所属しているアカウントの数'),
        }),
      ),
    ),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const deleteAccountApi = {
  summary: 'アカウント削除',
  description: 'アカウントの論理削除を行う',
  method: ApiMethod.DELETE,
  path: '/account/{account_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      account_id: AccountSchema.shape.id,
    }),
  },
  process: `
  アカウントの論理削除を行う
  `,
  response: defOk('アカウントの削除に成功しました'),
  error: {
    invalidAccount: {
      status: 400,
      messageText: 'このアカウントが存在しないか、削除する権限がありません',
    },
  } as const,
} satisfies BackendApiDef;

export const createAccountApi = {
  summary: 'アカウント作成',
  description: 'アカウントを作成する',
  method: ApiMethod.POST,
  path: '/account',
  privileges: {
    role: [apiRole.pos],
    policies: defPolicies(['create_account']),
  },
  request: {
    body: z.object({
      email: AccountSchema.shape.email,
      stores: z
        .array(
          z.object({
            store_id: StoreSchema.shape.id,
          }),
        )
        .describe('所属店舗'),
      group_id: Account_GroupSchema.shape.id.describe(
        'このスタッフに結びつけるアカウントグループ',
      ),
      display_name: AccountSchema.shape.display_name.describe(
        'アカウント名 スタッフの名前に相当する',
      ),
      nick_name: AccountSchema.shape.nick_name
        .optional()
        .describe('ニックネーム'),
    }),
  },
  process: ``,
  response: z.object({
    id: AccountSchema.shape.id.describe('つくられたアカウントのID'),
    code: AccountSchema.shape.code,
  }),
  error: {} as const,
} satisfies BackendApiDef;
