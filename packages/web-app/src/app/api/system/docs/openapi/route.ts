import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { getOpenApiJsonDef } from '@/app/api/system/docs/def';
import { ApiGenerator } from 'api-generator';

//@ts-expect-error becuase of because of
export const GET = BackendAPI.defineApi(getOpenApiJsonDef, async () => {
  if (
    process.env.RUN_MODE != 'local' &&
    process.env.RUN_MODE != 'dev' &&
    process.env.RUN_MODE != 'stg'
  )
    throw new ApiError('permission');

  const openapi = await ApiGenerator.openapiGenerate();

  return openapi;
});
