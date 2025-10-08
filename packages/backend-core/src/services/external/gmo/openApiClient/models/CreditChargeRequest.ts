/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdditionalOptions } from './AdditionalOptions';
import type { CreditInformation } from './CreditInformation';
import type { FraudDetectionInformation } from './FraudDetectionInformation';
import type { Merchant } from './Merchant';
import type { Order } from './Order';
import type { Payer } from './Payer';
import type { Tds2Information } from './Tds2Information';
/**
 * クレカ払い 都度支払い(/credit/charge)のリクエストパラメーター
 */
export type CreditChargeRequest = {
  merchant: Merchant;
  order: Order;
  payer: Payer;
  /**
   * クレカ払い情報
   */
  creditInformation: CreditInformation;
  tds2Information?: Tds2Information;
  fraudDetectionInformation?: FraudDetectionInformation;
  additionalOptions?: AdditionalOptions;
};
