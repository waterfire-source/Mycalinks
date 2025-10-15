/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ErrorInformation } from './ErrorInformation';
import type { OrderReferenceWallet } from './OrderReferenceWallet';
import type { WalletResult } from './WalletResult';
/**
 * /order/inquiry response body
 */
export type OrderInquiryResponseWallet = {
  /**
   * 取引参照情報
   *
   */
  orderReference?: OrderReferenceWallet;
  walletResult?: WalletResult;
  errorInformation?: ErrorInformation;
};
