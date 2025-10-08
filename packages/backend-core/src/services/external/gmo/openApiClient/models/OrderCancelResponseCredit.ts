/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreditResult } from './CreditResult';
import type { OrderReferenceCredit } from './OrderReferenceCredit';
/**
 * /order/cancel response body
 */
export type OrderCancelResponseCredit = {
  /**
   * 取引参照情報
   *
   */
  orderReference?: OrderReferenceCredit;
  /**
   * カード支払い結果情報
   * キャンセル時は元の取引が3Dセキュア認証済であっても、3Dセキュア認証の利用有無<span class="mp-oas-code">useTds2</span>は必ず<span class="mp-oas-code">false</span>です。
   *
   */
  creditResult?: CreditResult;
};
