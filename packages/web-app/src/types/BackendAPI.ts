import { apiRoleValues } from '@/api/backendApi/main';
import { PosRunMode } from '@/types/next-auth';
import { apiPolicies } from 'common';

export type apiPrivilegesType = {
  privileges: {
    role: Array<apiRoleValues>; //実行に必要なアカウントの種類（こちらが優先的に使われる）
    policies: Array<keyof typeof apiPolicies>; //実行に必要なポリシー
  };
};

export type customJwtType = {
  sub: string;
  email: string;
  display_name: string;
  corporation_id: number;
  store_id?: number;
  register_id?: number | null;
  isGod?: boolean;
  mode: PosRunMode;
  iat: number;
  exp: number;
  jti: string;
  role: string;
};

//MycaApp
export type MycaAppUser = {
  id: number;
  display_name?: string;
  created: string;
  mail: string;
  birthday?: string;
  address?: string;
  zip_code?: string;
  city?: string;
  prefecture?: string;
  building?: string;
  address2?: string;
  phone_number?: string;
  gender?: string;
  career?: string;
  full_name?: string;
  full_name_ruby?: string;
  device_id?: string;
};

export type fileData = {
  nameOnServer: string;
  fileKind: string;
  rawName: string;
  extension: string;
  fsData: Buffer | null;
  dontDelete?: boolean;
};
