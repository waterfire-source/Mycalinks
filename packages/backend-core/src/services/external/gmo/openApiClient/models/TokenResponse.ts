/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * アクセストークン発行(/token)成功時のレスポンスパラメーター
 */
export type TokenResponse = {
  /**
   * アクセストークン
   *
   */
  access_token?: string;
  /**
   * 有効期間(秒)
   * アクセストークンの有効期間が秒数で返ります。
   *
   */
  expires_in?: string;
  /**
   * スコープ
   * <span class="mp-oas-code">openapi</span>が返ります。
   *
   */
  scope?: TokenResponse.scope;
  /**
   * アクセストークンのタイプ
   * <span class="mp-oas-code">bearer</span>が返ります。
   *
   */
  token_type?: TokenResponse.token_type;
};
export namespace TokenResponse {
  /**
   * スコープ
   * <span class="mp-oas-code">openapi</span>が返ります。
   *
   */
  export enum scope {
    OPENAPI = 'openapi',
  }
  /**
   * アクセストークンのタイプ
   * <span class="mp-oas-code">bearer</span>が返ります。
   *
   */
  export enum token_type {
    BEARER = 'bearer',
  }
}
