/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderReferenceWallet } from './OrderReferenceWallet';
import type { WalletResult } from './WalletResult';
/**
 * /order/capture response body
 */
export type OrderCaptureResponseWallet = {
  /**
   * 取引参照情報
   *
   */
  orderReference?: OrderReferenceWallet;
  walletResult?: WalletResult;
};
