/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AmazonPay } from './AmazonPay';
import type { WalletChargeOptions } from './WalletChargeOptions';
import type { WalletType } from './WalletType';
/**
 * Pay払い(都度)情報
 */
export type WalletInformation = {
  walletChargeOptions: WalletChargeOptions;
  walletType: WalletType;
  amazonPay?: AmazonPay;
};
