/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessId } from './AccessId';
import type { AdditionalOptions } from './AdditionalOptions';
import type { CustomerDataAmazonPay } from './CustomerDataAmazonPay';
/**
 * /wallet/getCustomerData request body
 */
export type walletGetCustomerDataRequest = {
  /**
   * 取引リクエスト時に返る取引ID
   */
  accessId?: AccessId;
  /**
   * Amazon Pay V2専用パラメーター
   *
   */
  amazonPay?: CustomerDataAmazonPay;
  additionalOptions?: AdditionalOptions;
};
