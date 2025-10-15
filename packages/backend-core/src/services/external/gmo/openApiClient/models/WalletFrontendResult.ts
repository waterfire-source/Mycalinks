/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WalletFrontendType } from './WalletFrontendType';
/**
 * Pay払い 都度支払い（フロントエンド方式）結果情報
 */
export type WalletFrontendResult = {
  walletType?: WalletFrontendType;
  /**
   * 決済番号 <br/>
   * [/wallet/front-end/charge](#tag/wallet/operation/walletFrontendCharge)では返りません。<br/>
   *
   */
  settlementCode?: string;
  /**
   * 仮売上有効日時
   * [/wallet/front-end/charge](#tag/wallet/operation/walletFrontendCharge)では返りません。<br/>
   * [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6)で定義された表記です。
   * 例) 2023-06-30T12:34:56+09:00
   *
   */
  captureExpiryDateTime?: string;
  /**
   * 決済番号（フロントエンド利用）<br/>
   * [/wallet/front-end/verifyCharge](#tag/wallet/operation/walletFrontendVerifyCharge)では返りません。
   *
   */
  frontendPaymentId?: string;
};
