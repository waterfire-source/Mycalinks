/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NextAction } from './NextAction';
import type { OrderReferenceWallet } from './OrderReferenceWallet';
import type { RedirectInformation } from './RedirectInformation';
/**
 * Pay払い 利用承諾(/wallet/authorizeAccount)のレスポンスパラメーター
 */
export type WalletAuthorizationResponse = {
  /**
   * レスポンスを受け取った後の加盟店様側の処理
   * Pay払いの利用承諾時は必ず<span class="mp-oas-code">REDIRECT</span>です。
   * - <span class="mp-oas-code">REDIRECT</span>：リダイレクトが必要
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
  /**
   * リダイレクト情報
   * Pay払いの決済事業者のWebサイト、モバイルアプリに進むためのリダイレクトの情報です。
   * <span class="mp-oas-code">redirectType</span>フィールドは必ず<span class="mp-oas-code">WALLET_AUTHORIZE</span>です。
   * お客様のブラウザを<span class="mp-oas-code">redirectUrl</span>にリダイレクトしてください。
   * リダイレクトせずに120秒経過すると<span class="mp-oas-code">redirectUrl</span>は無効となります。
   *
   */
  redirectInformation?: RedirectInformation;
};
