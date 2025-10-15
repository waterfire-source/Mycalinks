/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 認証のオプション
 */
export type VerificationOptions = {
  /**
   * セッション有効期間（秒）
   * ユーザーが認証操作を行える期間を60~1800秒の間で設定できます。
   * 未指定の場合は600秒(10分)です。
   *
   */
  sessionDurationSeconds?: string;
  /**
   * 認証リトライ最大回数
   * ユーザーの認証リトライ最大回数を0~5回の間で設定できます。
   * SMS認証の場合、認証コード入力をリトライできる最大回数を指します。
   * 未指定の場合は3回です。
   *
   */
  userMaxRetry?: string;
};
