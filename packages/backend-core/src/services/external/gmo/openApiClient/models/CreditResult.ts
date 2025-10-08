/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CardResult } from './CardResult';
/**
 * カード支払い結果情報
 */
export type CreditResult = {
  /**
   * カードのタイプ
   * - <span class="mp-oas-code">CREDIT_CARD</span>：クレジットカード
   * - <span class="mp-oas-code">APPLE_PAY</span>：Apple Pay
   * - <span class="mp-oas-code">GOOGLE_PAY</span>：Google Pay
   *
   */
  cardType?: CreditResult.cardType;
  cardResult?: CardResult;
  /**
   * 仕向先カード会社コード
   * プロトコルタイプ/モジュールタイプにおける<span class="mp-oas-code">Forward</span>パラメーターと同じです。
   * 最大7桁の半角英数字・半角スペースで構成されます。
   *
   */
  forwardedAcquirerCode?: string;
  /**
   * カード会社が発行した承認番号
   * プロトコルタイプ/モジュールタイプにおける<span class="mp-oas-code">Approve</span>パラメーターと同じです。
   * 最大7桁の半角英数字・半角スペースで構成されます。
   * 有効性確認やキャンセルの場合には、全て半角スペース、または空になる可能性があります。
   *
   */
  approvalCode?: string;
  /**
   * クレジットカードネットワーク事業者が取引を特定するためのID
   * プロトコルタイプ/モジュールタイプにおける<span class="mp-oas-code">TranID</span>パラメーターと同じです。
   * 最大28桁の半角数字で構成されます。
   *
   */
  nwTransactionId?: string;
  /**
   * 処理日時
   * [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6)で定義された表記
   * 例) 2023-05-30T12:34:56+09:00
   *
   */
  transactionDateTime?: string;
  /**
   * 仮売上有効日時
   * [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6)で定義された表記
   * 例) 2023-06-30T12:34:56+09:00
   *
   */
  captureExpiryDateTime?: string;
  /**
   * 3Dセキュア認証の利用有無
   * 当該取引が3Dセキュア認証済である場合は<span class="mp-oas-code">true</span>です。
   *
   */
  useTds2?: boolean;
  /**
   * 不正検知の利用有無
   */
  useFraudDetection?: boolean;
};
export namespace CreditResult {
  /**
   * カードのタイプ
   * - <span class="mp-oas-code">CREDIT_CARD</span>：クレジットカード
   * - <span class="mp-oas-code">APPLE_PAY</span>：Apple Pay
   * - <span class="mp-oas-code">GOOGLE_PAY</span>：Google Pay
   *
   */
  export enum cardType {
    CREDIT_CARD = 'CREDIT_CARD',
    APPLE_PAY = 'APPLE_PAY',
    GOOGLE_PAY = 'GOOGLE_PAY',
  }
}
