/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CashOptions } from './CashOptions';
import type { DisplayInformation } from './DisplayInformation';
import type { mulpay } from './mulpay';
/**
 * 現金払い情報
 */
export type CashInformation = {
  cashType: mulpay;
  cashOptions?: CashOptions;
  displayInformation?: DisplayInformation;
};
