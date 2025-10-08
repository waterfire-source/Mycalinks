/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NextAction } from './NextAction';
import type { RedirectInformation } from './RedirectInformation';
import type { VerificationReference } from './VerificationReference';
/**
 * /verification/start response body
 */
export type VerificationStartResponse = {
  /**
   * レスポンスを受け取った後の加盟店様側の処理
   * 認証開始時は必ず<span class="mp-oas-code">REDIRECT</span>です。
   * - <span class="mp-oas-code">REDIRECT</span>：リダイレクトが必要
   *
   */
  nextAction?: NextAction;
  /**
   * 本人確認リクエストの認証情報
   * - <span class="mp-oas-code">status</span>フィールドは必ず<span class="mp-oas-code">REQSUCCESS</span>です。
   *
   */
  verificationReference?: VerificationReference;
  /**
   * リダイレクト情報
   * 認証コード入力画面に進むためのリダイレクトの情報です。
   * <span class="mp-oas-code">redirectType</span>フィールドは必ず<span class="mp-oas-code">VERIFY</span>です。
   * <span class="mp-oas-code">httpMethod</span>フィールドは必ず<span class="mp-oas-code">GET</span>です。
   * お客様のブラウザを<span class="mp-oas-code">redirectUrl</span>にリダイレクトしてください。
   *
   */
  redirectInformation?: RedirectInformation;
};
