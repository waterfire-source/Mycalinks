/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessId } from './AccessId';
import type { AdditionalOptions } from './AdditionalOptions';
/**
 * クレカ払い 3Dセキュア後有効性確認(/tds2/finalizeVerification)のリクエストパラメーター
 */
export type Tds2FinalizeVerificationRequest = {
  /**
   * 3Dセキュアにリダイレクトする前の有効性確認リクエスト時に返る取引ID
   */
  accessId: AccessId;
  additionalOptions?: AdditionalOptions;
};
