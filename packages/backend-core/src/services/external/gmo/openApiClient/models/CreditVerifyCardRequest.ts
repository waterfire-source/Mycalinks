/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdditionalOptions } from './AdditionalOptions';
import type { CreditVerificationInformation } from './CreditVerificationInformation';
import type { Merchant } from './Merchant';
import type { OrderWithoutAmount } from './OrderWithoutAmount';
import type { Payer } from './Payer';
import type { Tds2Information } from './Tds2Information';
/**
 * クレカ払い 有効性確認(/credit/verifyCard)のリクエストパラメーター
 */
export type CreditVerifyCardRequest = {
  merchant: Merchant;
  order: OrderWithoutAmount;
  payer: Payer;
  creditVerificationInformation: CreditVerificationInformation;
  tds2Information?: Tds2Information;
  additionalOptions?: AdditionalOptions;
};
