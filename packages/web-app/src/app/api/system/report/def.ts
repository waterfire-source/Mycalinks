import { apiMethod, apiRole } from '@/api/backendApi/main';

//メトリクスグラフ生成
/**
 * @deprecated Use createMetricsGraphApi from api-generator instead
 */
export const createMetricsGraphDef = {
  method: apiMethod.POST,
  path: 'system/report/metrics/graph',
  privileges: {
    role: [apiRole.bot, apiRole.pos],
  },
  request: {
    body: 'any' as const,
  },
  process: `
  `,
  response: {
    ok: 'generated and sent to slack',
  },
};
