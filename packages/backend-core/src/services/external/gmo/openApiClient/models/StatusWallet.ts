/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Pay払いの取引ステータス
 * - <span class="mp-oas-code">UNPROCESSED</span>：未決済
 * - <span class="mp-oas-code">REQSUCCESS</span>：要求成功
 * - <span class="mp-oas-code">AUTHPROCESS</span>：認証処理中
 * - <span class="mp-oas-code">AUTH</span>：仮売上
 * - <span class="mp-oas-code">SALES</span>：実売上
 * - <span class="mp-oas-code">CAPTURE</span>：即時売上
 * - <span class="mp-oas-code">CANCEL</span>：キャンセル
 * - <span class="mp-oas-code">RETURN</span>：返品
 * - <span class="mp-oas-code">REQRETURN</span>：返品受付
 * - <span class="mp-oas-code">PAYFAIL</span>：決済失敗
 * - <span class="mp-oas-code">EXPIRED</span>：期限切れ
 * - <span class="mp-oas-code">REGISTER</span>：利用承諾
 * - <span class="mp-oas-code">END</span>：利用承諾終了
 *
 */
export enum StatusWallet {
  UNPROCESSED = 'UNPROCESSED',
  REQSUCCESS = 'REQSUCCESS',
  AUTHPROCESS = 'AUTHPROCESS',
  AUTH = 'AUTH',
  SALES = 'SALES',
  CAPTURE = 'CAPTURE',
  CANCEL = 'CANCEL',
  RETURN = 'RETURN',
  REQRETURN = 'REQRETURN',
  PAYFAIL = 'PAYFAIL',
  EXPIRED = 'EXPIRED',
  REGISTER = 'REGISTER',
  END = 'END',
}
