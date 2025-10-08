import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOk } from '../../generator/util';
import { StoreSchema, TemplateSchema } from 'backend-core';

extendZodWithOpenApi(z);

//テンプレート系
export const createTemplateApi = {
  summary: 'テンプレートを作成',
  description: 'テンプレートを作成',
  method: ApiMethod.POST,
  path: '/store/{store_id}/template',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    body: z.object({
      kind: TemplateSchema.shape.kind.describe('テンプレートの種類'),
      display_name:
        TemplateSchema.shape.display_name.describe('テンプレートの表示名'),
      url: TemplateSchema.shape.url.describe('テンプレートのURL'),
    }),
  },
  process: `

  `,
  response: TemplateSchema,
  error: {} as const,
} satisfies BackendApiDef;

export const getTemplateApi = {
  summary: 'テンプレートを取得する',
  description: 'テンプレートを取得する',
  method: ApiMethod.GET,
  path: '/store/{store_id}/template',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
    }),
    query: z.object({
      kind: TemplateSchema.shape.kind.optional().describe('テンプレートの種類'),
    }),
  },
  process: `

  `,
  response: z.object({
    templates: z.array(TemplateSchema),
  }),
  error: {} as const,
} satisfies BackendApiDef;

export const deleteTemplateApi = {
  summary: 'テンプレートを削除',
  description: 'テンプレートを削除',
  method: ApiMethod.DELETE,
  path: '/store/{store_id}/template/{template_id}',
  privileges: {
    role: [apiRole.pos],
  },
  request: {
    params: z.object({
      store_id: StoreSchema.shape.id,
      template_id: TemplateSchema.shape.id,
    }),
  },
  process: `

  `,
  response: defOk('テンプレートが削除できました'),
  error: {} as const,
} satisfies BackendApiDef;
