import {
  AccountSchema,
  CorporationSchema,
  RegisterSchema,
  StoreSchema,
} from 'backend-core';
import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// PosRunMode enum from types/next-auth
const PosRunModeSchema = z.enum(['sales', 'admin']);

export const launchApi = {
  summary: '起動モード取得',
  description: 'システムの起動モードを取得する',
  method: ApiMethod.POST,
  path: '/launch',
  privileges: {
    role: [apiRole.everyone],
  },
  request: {
    body: z.object({
      email: z.string().describe('メールアドレス'),
      password: z.string().describe('パスワード'),
    }),
  },
  process: ``,
  response: z.object({
    availableModes: z.array(PosRunModeSchema).describe('選択できる営業モード'),
    account: z.object({
      id: AccountSchema.shape.id.describe('自分のアカウントID'),
      code: AccountSchema.shape.code.describe('自分のコード'),
      linked_corporation: z.object({
        id: CorporationSchema.shape.id,
        name: CorporationSchema.shape.name.describe('法人名'),
      }),
      stores: z.array(
        z.object({
          store: z
            .object({
              id: StoreSchema.shape.id.describe('店舗ID'),
              display_name: StoreSchema.shape.display_name.describe('店舗名'),
              registers: z.array(
                z.object({
                  id: RegisterSchema.shape.id.describe('レジID'),
                  display_name:
                    RegisterSchema.shape.display_name.describe('レジ名'),
                }),
              ),
            })
            .describe('自分が管理できる店舗'),
        }),
      ),
    }),
  }),
  error: {
    notFound: {
      status: 404,
      messageText: 'アカウントが見つかりませんでした',
    },
    noModeAvailable: {
      status: 401,
      messageText: 'このアカウントではログインが許可されていません',
    },
    invalidCredentials: {
      status: 401,
      messageText: 'メールアドレスかパスワードが間違っています',
    },
  } as const,
} satisfies BackendApiDef;
