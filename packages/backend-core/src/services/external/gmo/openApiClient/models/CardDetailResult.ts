/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClientCardBinData } from './ClientCardBinData';
import type { DebitInformation } from './DebitInformation';
/**
 * カード詳細情報
 */
export type CardDetailResult = {
  /**
   * カード番号
   * 下4桁(**********9999)固定でマスクされます。
   *
   */
  cardNumber?: string;
  /**
   * 利用されたカードの名義人
   */
  cardholderName?: string;
  /**
   * カードの有効期限(月)
   */
  expiryMonth?: string;
  /**
   * カードの有効期限(年)
   */
  expiryYear?: string;
  /**
   * カードのブランド
   */
  brand?: CardDetailResult.brand;
  /**
   * カードの発行会社所在地
   * - <span class="mp-oas-code">JP</span>：日本国内
   * - <span class="mp-oas-code">INTERNATIONAL</span>：海外
   * - <span class="mp-oas-code">UNKNOWN</span>：不明
   *
   */
  issuerLocation?: CardDetailResult.issuerLocation;
  /**
   * カードの発行カード会社コード
   */
  issuerCode?: string;
  debitInformation?: DebitInformation;
  clientCardBinData?: ClientCardBinData;
};
export namespace CardDetailResult {
  /**
   * カードのブランド
   */
  export enum brand {
    VISA = 'VISA',
    MASTERCARD = 'MASTERCARD',
    JCB = 'JCB',
    DINERS = 'DINERS',
    AMEX = 'AMEX',
    UNKNOWN = 'UNKNOWN',
  }
  /**
   * カードの発行会社所在地
   * - <span class="mp-oas-code">JP</span>：日本国内
   * - <span class="mp-oas-code">INTERNATIONAL</span>：海外
   * - <span class="mp-oas-code">UNKNOWN</span>：不明
   *
   */
  export enum issuerLocation {
    JP = 'JP',
    INTERNATIONAL = 'INTERNATIONAL',
    UNKNOWN = 'UNKNOWN',
  }
}
