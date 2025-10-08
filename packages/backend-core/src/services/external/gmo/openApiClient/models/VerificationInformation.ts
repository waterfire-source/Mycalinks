/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmsPinData } from './SmsPinData';
import type { VerificationId } from './VerificationId';
import type { VerificationOptions } from './VerificationOptions';
import type { VerificationType } from './VerificationType';
/**
 * Verify情報
 */
export type VerificationInformation = {
  type: VerificationType;
  /**
   * 認証ID
   * 加盟店様にてユニークな値を発行してください。
   *
   */
  verificationId: VerificationId;
  verificationOptions?: VerificationOptions;
  smsPinData?: SmsPinData;
};
