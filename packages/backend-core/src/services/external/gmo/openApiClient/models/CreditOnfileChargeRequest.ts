/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdditionalOptions } from './AdditionalOptions';
import type { CreditOnfileInformation } from './CreditOnfileInformation';
import type { FraudDetectionInformation } from './FraudDetectionInformation';
import type { Merchant } from './Merchant';
import type { Order } from './Order';
import type { Payer } from './Payer';
import type { Tds2Information } from './Tds2Information';
/**
 * クレカ払い 随時支払い(/credit/on-file/charge)のリクエストパラメーター
 */
export type CreditOnfileChargeRequest = {
  merchant: Merchant;
  order: Order;
  payer: Payer;
  creditOnfileInformation: CreditOnfileInformation;
  tds2Information?: Tds2Information;
  fraudDetectionInformation?: FraudDetectionInformation;
  additionalOptions?: AdditionalOptions;
};
