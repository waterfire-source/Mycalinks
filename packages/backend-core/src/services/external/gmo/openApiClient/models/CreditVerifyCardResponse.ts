/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreditResult } from './CreditResult';
import type { NextAction } from './NextAction';
import type { OnfileCardResult } from './OnfileCardResult';
import type { OrderReferenceCredit } from './OrderReferenceCredit';
/**
 * クレカ払い 有効性確認(/credit/verifyCard)のオーソリ成功時のレスポンスパラメーター
 */
export type CreditVerifyCardResponse = {
  /**
   * レスポンスを受け取った後の加盟店様側の処理
   * 有効性確認成功時は<span class="mp-oas-code">NO_ACTION</span>です。
   * - <span class="mp-oas-code">NO_ACTION</span>：後続処理なし
   *
   */
  nextAction?: NextAction;
  /**
   * 有効性確認リクエストの取引情報
   * - <span class="mp-oas-code">amount</span>フィールドは返りません。
   * - <span class="mp-oas-code">status</span>フィールドは必ず<span class="mp-oas-code">CHECK</span>です。
   * - <span class="mp-oas-code">chargeType</span>フィールドは必ず<span class="mp-oas-code">CREDIT</span>です。
   *
   */
  orderReference?: OrderReferenceCredit;
  creditResult?: CreditResult;
  onfileCardResult?: OnfileCardResult;
};
