/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OnfileCardOptions } from './OnfileCardOptions';
import type { Referrer } from './Referrer';
/**
 * クレカ払い カード登録(/credit/storeCard)のリクエストパラメーター(成功取引版)
 */
export type CreditStoringReferrerInformation = {
  referrer: Referrer;
  /**
   * カード登録オプション情報
   *
   */
  onfileCardOptions: OnfileCardOptions;
};
