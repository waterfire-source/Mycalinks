/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CashResult } from './CashResult';
import type { OrderReferenceCash } from './OrderReferenceCash';
/**
 * /order/cancel response body
 */
export type OrderCancelResponseCash = {
  /**
   * 取引参照情報
   *
   */
  orderReference?: OrderReferenceCash;
  cashResult?: CashResult;
};
