/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * レスポンスを受け取った後の加盟店様側の処理
 * - <span class="mp-oas-code">CAPTURE</span>：確定処理が必要
 * - <span class="mp-oas-code">NO_ACTION</span>：後続処理なし
 * - <span class="mp-oas-code">REDIRECT</span>：リダイレクトが必要
 * - <span class="mp-oas-code">AWAIT</span>：入金結果待ち
 *
 */
export enum NextAction {
  CAPTURE = 'CAPTURE',
  NO_ACTION = 'NO_ACTION',
  REDIRECT = 'REDIRECT',
  AWAIT = 'AWAIT',
}
