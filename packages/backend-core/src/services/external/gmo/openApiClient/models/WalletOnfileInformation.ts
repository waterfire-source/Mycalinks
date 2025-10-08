/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OnfileAmazonPay } from './OnfileAmazonPay';
import type { OnfileWallet } from './OnfileWallet';
import type { WalletChargeOptions } from './WalletChargeOptions';
/**
 * Pay払い(随時)情報
 */
export type WalletOnfileInformation = {
  walletChargeOptions: WalletChargeOptions;
  onfileWallet: OnfileWallet;
  amazonPay?: OnfileAmazonPay;
};
