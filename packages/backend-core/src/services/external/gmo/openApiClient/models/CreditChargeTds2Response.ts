/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NextAction } from './NextAction';
import type { OrderReferenceCredit } from './OrderReferenceCredit';
import type { RedirectInformation } from './RedirectInformation';
/**
 * クレカ払い 都度支払い・随時支払い(/credit/charge, /credit/on-file/charge)の3Dセキュアリダイレクト時のレスポンスパラメーター
 */
export type CreditChargeTds2Response = {
  /**
   * レスポンスを受け取った後の加盟店様側の処理
   * 3Dセキュアリダイレクト時は必ず<span class="mp-oas-code">REDIRECT</span>です。
   * - <span class="mp-oas-code">REDIRECT</span>：リダイレクトが必要
   *
   */
  nextAction?: NextAction;
  /**
   * 支払いリクエストの取引情報
   * - <span class="mp-oas-code">status</span>フィールドは、3Dセキュア開始前であるため<span class="mp-oas-code">AUTHENTICATED</span>です。
   * - <span class="mp-oas-code">chargeType</span>フィールドは必ず<span class="mp-oas-code">CREDIT</span>です。
   *
   */
  orderReference?: OrderReferenceCredit;
  /**
   * リダイレクト情報
   * 3Dセキュアに進むためのリダイレクトの情報です。
   * <span class="mp-oas-code">redirectType</span>フィールドは必ず<span class="mp-oas-code">TDS2</span>です。
   * お客様のブラウザを<span class="mp-oas-code">redirectUrl</span>にリダイレクトしてください。
   *
   */
  redirectInformation?: RedirectInformation;
};
