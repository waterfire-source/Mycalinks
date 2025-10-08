/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdditionalOptions } from './AdditionalOptions';
import type { Merchant } from './Merchant';
import type { OrderWithoutAmount } from './OrderWithoutAmount';
import type { Payer } from './Payer';
import type { WalletAuthorizationInformation } from './WalletAuthorizationInformation';
/**
 * Pay払い 利用承諾(/wallet/authorizeAccount)のリクエストパラメーター
 */
export type WalletAuthorizationRequest = {
  merchant: Merchant;
  order: OrderWithoutAmount;
  payer: Payer;
  walletAuthorizationInformation: WalletAuthorizationInformation;
  additionalOptions?: AdditionalOptions;
};
