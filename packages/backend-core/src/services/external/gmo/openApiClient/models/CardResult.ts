/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 支払いで利用したカードの情報
 */
export type CardResult = {
  /**
   * 利用されたカード番号
   * 下4桁(**********9999)固定でマスクされます。
   *
   */
  cardNumber?: string;
  /**
   * 利用されたカードの名義人
   */
  cardholderName?: string;
  /**
   * 利用されたカードの有効期限(月)
   */
  expiryMonth?: string;
  /**
   * 利用されたカードの有効期限(年)
   */
  expiryYear?: string;
  /**
   * 利用されたカードの発行カード会社コード
   * 最大7桁の半角英数字・半角スペースで構成されます。
   *
   */
  issuerCode?: string;
  /**
   * 利用されたカードのブランド
   */
  brand?: CardResult.brand;
};
export namespace CardResult {
  /**
   * 利用されたカードのブランド
   */
  export enum brand {
    VISA = 'VISA',
    MASTERCARD = 'MASTERCARD',
    JCB = 'JCB',
    DINERS = 'DINERS',
    AMEX = 'AMEX',
    UNKNOWN = 'UNKNOWN',
  }
}
