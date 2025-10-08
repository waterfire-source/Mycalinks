/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * カード情報
 */
export type Card = {
  /**
   * カード番号<br>ハイフンは含めないでください。
   */
  cardNumber: string;
  /**
   * カード名義人
   */
  cardholderName?: string;
  /**
   * カード有効期限(月)
   */
  expiryMonth: string;
  /**
   * カード有効期限(年)
   */
  expiryYear: string;
  /**
   * セキュリティコード<br>CVCやCVVとも呼ばれます。
   */
  securityCode?: string;
};
