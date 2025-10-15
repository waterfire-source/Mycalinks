/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { mulpay } from './mulpay';
import type { mulpay_2 } from './mulpay_2';
/**
 * 現金払い結果情報
 */
export type CashResult = {
  cashType?: mulpay;
  /**
   * 支払い期限日時
   * [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6)で定義された表記です。
   * 例) 2023-05-30T12:34:56+09:00
   *
   */
  paymentExpiryDateTime?: string;
  /**
   * コンビニ支払い情報
   */
  konbiniPaymentInformation?: {
    konbiniCode?: mulpay_2;
    /**
     * 確認番号
     */
    confirmationNumber?: string;
    /**
     * 受付番号
     */
    receiptNumber?: string;
    /**
     * 払込票URL(一部のコンビニのみ)
     */
    voucherUrl?: string;
  };
  /**
   * Pay-easy支払い情報
   */
  'pay-easyPaymentInformation'?: {
    /**
     * お客様番号
     */
    customerNumber?: string;
    /**
     * 収納機関番号
     */
    institutionCode?: string;
    /**
     * 確認番号
     */
    confirmationNumber?: string;
    /**
     * 銀行サイトURL
     */
    bankUrl?: string;
  };
  /**
   * バーチャル口座振込支払い情報
   */
  bankTransferPaymentInformation?: {
    /**
     * 銀行コード
     */
    bankCode?: string;
    /**
     * 銀行名
     */
    bankName?: string;
    /**
     * 支店コード
     */
    branchCode?: string;
    /**
     * 支店名
     */
    branchName?: string;
    /**
     * 口座種目
     */
    accountType?: string;
    /**
     * 口座番号
     */
    accountNumber?: string;
    /**
     * 口座名義人名
     */
    accountHolderName?: string;
    /**
     * 合計入金金額
     */
    depositAmount?: string;
    /**
     * 振込コード
     */
    bankTransferCode?: string;
  };
};
