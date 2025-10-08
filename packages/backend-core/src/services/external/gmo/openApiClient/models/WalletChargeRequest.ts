/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdditionalOptions } from './AdditionalOptions';
import type { Merchant } from './Merchant';
import type { Order } from './Order';
import type { Payer } from './Payer';
import type { WalletInformation } from './WalletInformation';
/**
 * Pay払い 都度支払い(/wallet/charge)のリクエストパラメーター
 */
export type WalletChargeRequest = {
  merchant: Merchant;
  order: Order;
  payer: Payer;
  walletInformation: WalletInformation;
  additionalOptions?: AdditionalOptions;
};
