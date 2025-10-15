/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreditResult } from './CreditResult';
import type { OrderReferenceCredit } from './OrderReferenceCredit';
/**
 * /order/capture response body
 */
export type OrderCaptureResponseCredit = {
  /**
   * 取引参照情報
   *
   */
  orderReference?: OrderReferenceCredit;
  creditResult?: CreditResult;
};
