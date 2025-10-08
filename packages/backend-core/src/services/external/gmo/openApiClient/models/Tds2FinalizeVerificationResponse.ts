/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreditResult } from './CreditResult';
import type { NextAction } from './NextAction';
import type { OnfileCardResult } from './OnfileCardResult';
import type { OrderReferenceCredit } from './OrderReferenceCredit';
import type { Tds2Result } from './Tds2Result';
/**
 * クレカ払い 3Dセキュア後有効性確認(/tds2/finalizeVerification)のレスポンスパラメーター
 */
export type Tds2FinalizeVerificationResponse = {
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
  /**
   * クレカ払いの結果情報
   * 3Dセキュア後有効性確認では、3Dセキュア認証の利用有無<span class="mp-oas-code">useTds2</span>は必ず<span class="mp-oas-code">true</span>です。
   *
   */
  creditResult?: CreditResult;
  onfileCardResult?: OnfileCardResult;
  tds2Result?: Tds2Result;
};
