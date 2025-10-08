/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderReferenceWallet } from './OrderReferenceWallet';
import type { WalletResult } from './WalletResult';
/**
 * /order/cancel response body
 */
export type OrderCancelResponseWallet = {
  /**
   * 取引参照情報
   *
   */
  orderReference?: OrderReferenceWallet;
  walletResult?: WalletResult;
};
