import { apiMethod, apiRole } from '@/api/backendApi/main';
import { OpenAPIObject } from 'api-generator';

/**
 * @deprecated Use getOpenApiJsonApi from api-generator instead
 */
export const getOpenApiJsonDef = {
  method: apiMethod.GET,
  path: 'system/docs/openapi',
  privileges: {
    role: [apiRole.everyone],
  },
  request: {},
  process: `
  `,
  response: <OpenAPIObject>{},
};
