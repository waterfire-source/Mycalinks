/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessId } from './AccessId';
import type { AdditionalOptions } from './AdditionalOptions';
import type { AuthorizationMode } from './AuthorizationMode';
/**
 * /order/update request body
 */
export type OrderUpdateRequest = {
  /**
   * 取引リクエスト時に返る取引ID
   */
  accessId: AccessId;
  /**
   * 税送料込の取引金額
   * 決済手段により設定可能な値が異なります。
   *
   */
  amount: string;
  /**
   * 支払い要求のタイプ
   * クレカ払いの場合は必ず設定してください。
   * クレカ払い以外は設定しても無視されます。
   * - <span class="mp-oas-code">AUTH</span>：仮売上
   * - <span class="mp-oas-code">CAPTURE</span>：即時売上
   *
   */
  authorizationMode?: AuthorizationMode;
  additionalOptions?: AdditionalOptions;
};
