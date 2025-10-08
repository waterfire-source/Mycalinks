/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NextAction } from './NextAction';
import type { OrderReferenceWallet } from './OrderReferenceWallet';
import type { WalletFrontendResult } from './WalletFrontendResult';
/**
 * Pay払い 都度支払い（フロントエンド方式）(/wallet/front-end/charge)のレスポンスパラメーター
 */
export type WalletFrontendChargeResponse = {
  /**
   * レスポンスを受け取った後の加盟店様側の処理
   * 都度支払い（フロントエンド方式）の場合は必ず<span class="mp-oas-code">AWAIT</span>です。
   * - <span class="mp-oas-code">AWAIT</span>：お客様の決済待ち
   *
   */
  nextAction?: NextAction;
  /**
   * 支払いリクエストの取引情報
   * - <span class="mp-oas-code">status</span>フィールドは必ず<span class="mp-oas-code">REQSUCCESS</span>です。
   * - <span class="mp-oas-code">chargeType</span>フィールドは必ず<span class="mp-oas-code">WALLET</span>です。
   *
   */
  orderReference?: OrderReferenceWallet;
  walletFrontendResult?: WalletFrontendResult;
};
