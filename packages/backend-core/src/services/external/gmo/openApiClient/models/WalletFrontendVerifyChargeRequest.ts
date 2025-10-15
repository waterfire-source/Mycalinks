/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessId } from './AccessId';
import type { AdditionalOptions } from './AdditionalOptions';
import type { PayPay } from './PayPay';
/**
 * Pay払い 都度支払い（フロントエンド方式）(/wallet/front-end/verifyCharge)のリクエストパラメーター
 */
export type WalletFrontendVerifyChargeRequest = {
  /**
   * 取引リクエスト時に返る取引ID
   */
  accessId: AccessId;
  payPay?: PayPay;
  additionalOptions?: AdditionalOptions;
};
