/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdditionalOptions } from './AdditionalOptions';
import type { CashInformation } from './CashInformation';
import type { Merchant } from './Merchant';
import type { Order } from './Order';
import type { Payer } from './Payer';
/**
 * 現金払い(/cash/charge)のリクエストパラメーター
 */
export type CashChargeRequest = {
  merchant: Merchant;
  order: Order;
  payer: Payer;
  cashInformation: CashInformation;
  additionalOptions?: AdditionalOptions;
};
