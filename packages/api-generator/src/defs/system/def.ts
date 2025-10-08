import { ApiMethod, apiRole, BackendApiDef } from '../../types/main';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { defOk } from '../../generator/util';

extendZodWithOpenApi(z);

// OpenAPIObject type defined in api-generator
const OpenAPIObjectSchema = z.any();

export const getOpenApiJsonApi = {
  summary: 'OpenAPI JSON取得',
  description: 'OpenAPI定義JSONを取得する',
  method: ApiMethod.GET,
  path: '/system/docs/openapi',
  privileges: {
    role: [apiRole.everyone],
  },
  request: {},
  process: ``,
  response: OpenAPIObjectSchema,
  error: {} as const,
} satisfies BackendApiDef;

export const createMetricsGraphApi = {
  summary: 'メトリクスグラフ生成',
  description: 'システムメトリクスのグラフを生成してSlackに送信する',
  method: ApiMethod.POST,
  path: '/system/report/metrics/graph',
  privileges: {
    role: [apiRole.bot, apiRole.pos],
  },
  request: {},
  process: ``,
  response: defOk('generated and sent to slack'),
  error: {} as const,
} satisfies BackendApiDef;
