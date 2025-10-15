/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Merchant } from './Merchant';
import type { VerificationInformation } from './VerificationInformation';
/**
 * /verification/start request body
 */
export type VerificationStartRequest = {
  merchant: Merchant;
  /**
   * 本人確認情報
   *
   */
  verificationInformation: VerificationInformation;
};
