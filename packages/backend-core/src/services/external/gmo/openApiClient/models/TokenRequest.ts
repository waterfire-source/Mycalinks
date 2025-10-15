/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * アクセストークン発行(/token)のリクエストパラメーター
 */
export type TokenRequest = {
  /**
   * グラントタイプ
   * <span class="mp-oas-code">client_credentials</span>を設定してください。
   *
   */
  grant_type: TokenRequest.grant_type;
  /**
   * スコープ
   * <span class="mp-oas-code">openapi</span>を設定してください。
   *
   */
  scope: TokenRequest.scope;
};
export namespace TokenRequest {
  /**
   * グラントタイプ
   * <span class="mp-oas-code">client_credentials</span>を設定してください。
   *
   */
  export enum grant_type {
    CLIENT_CREDENTIALS = 'client_credentials',
  }
  /**
   * スコープ
   * <span class="mp-oas-code">openapi</span>を設定してください。
   *
   */
  export enum scope {
    OPENAPI = 'openapi',
  }
}
