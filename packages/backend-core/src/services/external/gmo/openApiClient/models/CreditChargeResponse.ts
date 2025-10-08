/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreditResult } from './CreditResult';
import type { FraudDetectionResult } from './FraudDetectionResult';
import type { NextAction } from './NextAction';
import type { OrderReferenceCredit } from './OrderReferenceCredit';
/**
 * クレカ払い 都度支払い・随時支払い(/credit/charge, /credit/on-file/charge)のオーソリ成功時のレスポンスパラメーター
 */
export type CreditChargeResponse = {
  /**
   * レスポンスを受け取った後の加盟店様側の処理
   * 仮売上成功時は<span class="mp-oas-code">CAPTURE</span>、即時売上成功時は<span class="mp-oas-code">NO_ACTION</span>です。
   * - <span class="mp-oas-code">CAPTURE</span>：確定処理が必要
   * - <span class="mp-oas-code">NO_ACTION</span>：後続処理なし
   *
   */
  nextAction?: NextAction;
  /**
   * 支払いリクエストの取引情報
   * - <span class="mp-oas-code">status</span>フィールドは以下の値が返ります。
   * - 仮売上成功時: <span class="mp-oas-code">AUTH</span>
   * - 即時売上成功時: <span class="mp-oas-code">CAPTURE</span>
   * - <span class="mp-oas-code">chargeType</span>フィールドは必ず<span class="mp-oas-code">CREDIT</span>です。
   *
   */
  orderReference?: OrderReferenceCredit;
  /**
   * クレカ払いの結果情報
   */
  creditResult?: CreditResult;
  /**
   * 不正検知の結果情報
   * 非同期モードが<span class="mp-oas-code">true</span>の場合は<span class="mp-oas-code">screeningType</span>のみが返ります。
   *
   */
  fraudDetectionResult?: FraudDetectionResult;
};
