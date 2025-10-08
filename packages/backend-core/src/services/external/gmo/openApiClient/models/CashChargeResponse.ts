/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CashResult } from './CashResult';
import type { NextAction } from './NextAction';
import type { OrderReferenceCash } from './OrderReferenceCash';
/**
 * 現金払い(/cash/charge)のレスポンスパラメーター
 */
export type CashChargeResponse = {
  /**
   * レスポンスを受け取った後の加盟店様側の処理
   * 現金払いは必ず<span class="mp-oas-code">AWAIT</span>です。
   * - <span class="mp-oas-code">AWAIT</span>：入金結果待ち
   *
   */
  nextAction?: NextAction;
  /**
   * 支払いリクエストの取引情報
   * - <span class="mp-oas-code">status</span>フィールドは以下の値が返ります。
   * - <span class="mp-oas-code">REQSUCCESS</span>：コンビニ、Pay-easy
   * - <span class="mp-oas-code">TRADING</span>：銀行振込
   * - <span class="mp-oas-code">chargeType</span>フィールドは必ず<span class="mp-oas-code">CASH</span>です。
   *
   */
  orderReference?: OrderReferenceCash;
  cashResult?: CashResult;
};
