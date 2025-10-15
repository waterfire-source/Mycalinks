/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CashResult } from './CashResult';
import type { ErrorInformation } from './ErrorInformation';
import type { OrderReferenceCash } from './OrderReferenceCash';
/**
 * /order/inquiry response body
 */
export type OrderInquiryResponseCash = {
  /**
   * 取引参照情報
   *
   */
  orderReference?: OrderReferenceCash;
  cashResult?: CashResult;
  errorInformation?: ErrorInformation;
};
