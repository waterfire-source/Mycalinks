/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessId } from './AccessId';
import type { AdditionalOptions } from './AdditionalOptions';
/**
 * クレカ払い 3Dセキュア後支払い(/tds2/finalizeCharge)のリクエストパラメーター
 */
export type Tds2FinalizeChargeRequest = {
  /**
   * 3Dセキュアにリダイレクトする前の支払いリクエスト時に返る取引ID
   */
  accessId: AccessId;
  additionalOptions?: AdditionalOptions;
};
