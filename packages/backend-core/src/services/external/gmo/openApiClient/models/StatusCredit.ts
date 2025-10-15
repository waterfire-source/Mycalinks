/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * クレカ払いの取引ステータス
 * - <span class="mp-oas-code">UNPROCESSED</span>：未決済
 * - <span class="mp-oas-code">AUTHENTICATED</span>：未決済(3DS登録済)
 * - <span class="mp-oas-code">AUTH</span>：仮売上
 * - <span class="mp-oas-code">CAPTURE</span>：即時売上
 * - <span class="mp-oas-code">SALES</span>：実売上
 * - <span class="mp-oas-code">CHECK</span>：有効性チェック
 * - <span class="mp-oas-code">CANCEL</span>：キャンセル
 *
 */
export enum StatusCredit {
  UNPROCESSED = 'UNPROCESSED',
  AUTHENTICATED = 'AUTHENTICATED',
  AUTH = 'AUTH',
  CAPTURE = 'CAPTURE',
  SALES = 'SALES',
  CHECK = 'CHECK',
  CANCEL = 'CANCEL',
}
