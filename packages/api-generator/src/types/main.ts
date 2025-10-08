import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { apiPolicies } from 'common';
import { z } from 'zod';

export enum ApiMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
}

export const apiRole = {
  pos: 'pos', //POSのアカウントとして認証されている状態
  god: 'god', //神モードのアカウントとして認証されている状態
  everyone: '',
  bot: 'bot',
  mycaUser: 'myca_user',
  admin: 'admin', //MycaAdminとして
} as const;

export const roleDict = {
  [apiRole.pos]: 'POSユーザー',
  [apiRole.everyone]: '全てのユーザー',
  [apiRole.bot]: 'bot',
  [apiRole.mycaUser]: 'アプリユーザー',
  [apiRole.admin]: '管理者',
  [apiRole.god]: '神モード',
} as const;

export type ValueOf<T> = T[keyof T];

export type apiRoleValues = ValueOf<typeof apiRole>;

/**
 * バックエンドで扱うAPI定義の型
 */
export type BackendApiDef = {
  cache?: number;
  summary: RouteConfig['summary'];
  description?: RouteConfig['description'];
  process?: string;
  method: RouteConfig['method'];
  path: RouteConfig['path'];
  request: {
    params?: RouteConfig['request']['params'];
    body?: RouteConfig['request']['body']['content']['application/json']['schema'];
    query?: RouteConfig['request']['query'];
  };
  response: z.ZodType<any>;
  privileges?: {
    role: Array<apiRoleValues>;
    policies?: Array<keyof typeof apiPolicies>;
  };
  error?: Record<
    string,
    {
      status: number;
      messageText?: string;
    }
  >;
};

export type ApiResponse<T extends BackendApiDef> = z.infer<T['response']>;
