/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BuyerId } from './BuyerId';
import type { CustomerBillingAddress } from './CustomerBillingAddress';
import type { CustomerShippingAddress } from './CustomerShippingAddress';
import type { Remarks } from './Remarks';
/**
 * /wallet/getCustomerData response body
 */
export type WalletGetCustomerDataResponse = {
  /**
   * 購入者のID
   */
  buyerId?: BuyerId;
  /**
   * 購入者の氏名
   */
  name?: string;
  /**
   * 購入者のメールアドレス
   */
  email?: string;
  /**
   * 備考<br>Amazon Pay V2ではお支払い情報が設定されます。
   */
  remarks?: Remarks;
  /**
   * 配送先情報
   */
  shippingInformation?: CustomerShippingAddress;
  /**
   * 請求先情報
   */
  billingInformation?: CustomerBillingAddress;
};
