/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NextAction } from './NextAction';
import type { OrderReferenceWallet } from './OrderReferenceWallet';
import type { WalletFrontendResult } from './WalletFrontendResult';
/**
 * Pay払い 都度支払い（フロントエンド方式）(/wallet/front-end/verifyCharge)のレスポンスパラメーター
 */
export type WalletFrontendVerifyChargeResponse = {
  /**
   * レスポンスを受け取った後の加盟店様側の処理
   * 仮売上成功時は<span class="mp-oas-code">CAPTURE</span>、即時売上成功時は<span class="mp-oas-code">NO_ACTION</span>です。
   * - <span class="mp-oas-code">NO_ACTION</span>：後続処理なし
   *
   */
  nextAction?: NextAction;
  /**
   * 支払いリクエストの取引情報
   * - <span class="mp-oas-code">status</span>フィールドは以下の値が返ります。
   * - 仮売上成功時: <span class="mp-oas-code">AUTH</span>
   * - 即時売上成功時: <span class="mp-oas-code">CAPTURE</span>
   * - <span class="mp-oas-code">chargeType</span>フィールドは必ず<span class="mp-oas-code">WALLET</span>です。
   *
   */
  orderReference?: OrderReferenceWallet;
  walletFrontendResult?: WalletFrontendResult;
};
