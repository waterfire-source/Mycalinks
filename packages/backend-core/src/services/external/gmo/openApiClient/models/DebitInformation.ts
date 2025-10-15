/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * デビットカード情報
 */
export type DebitInformation = {
  /**
   * カードの種類
   * - <span class="mp-oas-code">DEBIT</span>：デビットカード
   * - <span class="mp-oas-code">PREPAID</span>：プリペイドカード
   * - <span class="mp-oas-code">OTHER</span>：その他
   *
   */
  type?: DebitInformation.type;
  /**
   * カードの発行会社名
   * <span class="mp-oas-code">cardType</span>が <span class="mp-oas-code">DEBIT</span>、<span class="mp-oas-code">PREPAID</span>の場合のみパラメーターが返ります。
   *
   */
  issuerName?: string;
};
export namespace DebitInformation {
  /**
   * カードの種類
   * - <span class="mp-oas-code">DEBIT</span>：デビットカード
   * - <span class="mp-oas-code">PREPAID</span>：プリペイドカード
   * - <span class="mp-oas-code">OTHER</span>：その他
   *
   */
  export enum type {
    DEBIT = 'DEBIT',
    PREPAID = 'PREPAID',
    OTHER = 'OTHER',
  }
}
