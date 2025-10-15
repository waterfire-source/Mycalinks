/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WalletType } from './WalletType';
/**
 * Pay払い結果情報
 */
export type WalletResult = {
  walletType?: WalletType;
  /**
   * 決済番号
   */
  settlementCode?: string;
  /**
   * 利用承諾番号
   */
  acceptanceCode?: string;
  /**
   * 仮売上有効日時
   * [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6)で定義された表記です。
   * 例) 2023-06-30T12:34:56+09:00
   *
   */
  captureExpiryDateTime?: string;
};
