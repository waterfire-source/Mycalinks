/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessId } from './AccessId';
import type { AdditionalOptions } from './AdditionalOptions';
import type { VerificationId } from './VerificationId';
/**
 * /verification/inquiry request body
 */
export type VerificationInquiryRequest = {
  /**
   * 認証開始時に返る取引ID
   * 認証IDを省略する場合、取引IDは必ず設定してください。
   * 取引IDと認証IDを設定した場合、組み合わせが一致する認証情報が返ります。
   *
   */
  accessId?: AccessId;
  /**
   * 認証開始時に設定した任意の認証ID
   * 取引IDを省略する場合、認証IDは必ず設定してください。
   * 取引IDと認証IDを設定した場合、組み合わせが一致する認証情報が返ります。
   *
   */
  verificationId?: VerificationId;
  additionalOptions?: AdditionalOptions;
};
