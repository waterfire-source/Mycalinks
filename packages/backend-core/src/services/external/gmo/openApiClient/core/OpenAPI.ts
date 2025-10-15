/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiRequestOptions } from './ApiRequestOptions';

type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;
type Headers = Record<string, string>;

export type OpenAPIConfig = {
  BASE: string;
  VERSION: string;
  WITH_CREDENTIALS: boolean;
  CREDENTIALS: 'include' | 'omit' | 'same-origin';
  TOKEN?: string | Resolver<string> | undefined;
  USERNAME?: string | Resolver<string> | undefined;
  PASSWORD?: string | Resolver<string> | undefined;
  HEADERS?: Headers | Resolver<Headers> | undefined;
  ENCODE_PATH?: ((path: string) => string) | undefined;
};

export const OpenAPI: OpenAPIConfig = {
  BASE: process.env.GMO_OPENAPI_BASE_URL!, //←ステージング
  VERSION: '1.6.2',
  WITH_CREDENTIALS: false,
  CREDENTIALS: 'include',
  USERNAME: process.env.GMO_OPENAPI_USERNAME!, //齊田ショップ
  PASSWORD: process.env.GMO_OPENAPI_PASSWORD!,
};

//以下、手動で追記
export const getGeneralSetting = (mode: 'contract' | 'ec') => {
  return {
    BASE: process.env.GMO_OPENAPI_BASE_URL!, //←ステージング
    VERSION: '1.6.2',
    WITH_CREDENTIALS: false,
    CREDENTIALS: 'include',
    USERNAME:
      mode === 'ec'
        ? process.env.GMO_OPENAPI_USERNAME!
        : process.env.GMO_OPENAPI_USERNAME_CONTRACT!, //齊田ショップ
    PASSWORD:
      mode === 'ec'
        ? process.env.GMO_OPENAPI_PASSWORD!
        : process.env.GMO_OPENAPI_PASSWORD_CONTRACT!,
  } as OpenAPIConfig;
};
