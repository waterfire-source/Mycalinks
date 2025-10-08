/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreditResult } from './CreditResult';
import type { ErrorInformation } from './ErrorInformation';
import type { FraudDetectionResult } from './FraudDetectionResult';
import type { OrderReferenceCredit } from './OrderReferenceCredit';
import type { Tds2Result } from './Tds2Result';
/**
 * /order/inquiry response body
 */
export type OrderInquiryResponseCredit = {
  /**
   * 取引参照情報
   *
   */
  orderReference?: OrderReferenceCredit;
  creditResult?: CreditResult;
  tds2Result?: Tds2Result;
  /**
   * 不正検知の結果情報
   */
  fraudDetectionResult?: FraudDetectionResult;
  errorInformation?: ErrorInformation;
};
