/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessId } from './AccessId';
import type { VerificationId } from './VerificationId';
import type { VerificationStatus } from './VerificationStatus';
import type { VerificationType } from './VerificationType';
/**
 * 認証情報
 */
export type VerificationReference = {
  accessId?: AccessId;
  verificationId?: VerificationId;
  status?: VerificationStatus;
  /**
   * 最終更新日時
   * [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6)で定義された表記
   * 例) 2023-05-30T12:34:56+09:00
   *
   */
  created?: string;
  /**
   * 最終更新日時
   * [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6)で定義された表記
   * 例) 2023-05-30T12:34:56+09:00
   *
   */
  updated?: string;
  type?: VerificationType;
};
