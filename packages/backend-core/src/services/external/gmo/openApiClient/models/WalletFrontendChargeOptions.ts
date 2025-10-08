/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Pay払いの支払いオプション
 */
export type WalletFrontendChargeOptions = {
  /**
   * 支払い要求のタイプ
   * - <span class="mp-oas-code">AUTH</span>：仮売上
   * - <span class="mp-oas-code">CAPTURE</span>：即時売上
   *
   */
  authorizationMode: WalletFrontendChargeOptions.authorizationMode;
};
export namespace WalletFrontendChargeOptions {
  /**
   * 支払い要求のタイプ
   * - <span class="mp-oas-code">AUTH</span>：仮売上
   * - <span class="mp-oas-code">CAPTURE</span>：即時売上
   *
   */
  export enum authorizationMode {
    AUTH = 'AUTH',
    CAPTURE = 'CAPTURE',
  }
}
