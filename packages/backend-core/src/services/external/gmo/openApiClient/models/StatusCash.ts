/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 現金払いの取引ステータス
 * - <span class="mp-oas-code">UNPROCESSED</span>：未決済
 * - <span class="mp-oas-code">REQSUCCESS</span>：要求成功
 * - <span class="mp-oas-code">TRADING</span>：取引中
 * - <span class="mp-oas-code">PAYSUCCESS</span>：決済完了
 * - <span class="mp-oas-code">EXPIRED</span>：期限切れ
 * - <span class="mp-oas-code">CANCEL</span>：キャンセル
 * - <span class="mp-oas-code">STOP</span>：取引停止
 *
 */
export enum StatusCash {
  UNPROCESSED = 'UNPROCESSED',
  REQSUCCESS = 'REQSUCCESS',
  TRADING = 'TRADING',
  PAYSUCCESS = 'PAYSUCCESS',
  EXPIRED = 'EXPIRED',
  CANCEL = 'CANCEL',
  STOP = 'STOP',
}
