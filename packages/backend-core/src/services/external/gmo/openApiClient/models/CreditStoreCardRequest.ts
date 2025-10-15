/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdditionalOptions } from './AdditionalOptions';
import type { CreditStoringInformation } from './CreditStoringInformation';
import type { Merchant } from './Merchant';
/**
 * クレカ払い カード登録(/credit/storeCard)のリクエストパラメーター
 */
export type CreditStoreCardRequest = {
  merchant: Merchant;
  creditStoringInformation: CreditStoringInformation;
  additionalOptions?: AdditionalOptions;
};
