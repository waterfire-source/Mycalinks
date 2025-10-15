/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OnfileCardId } from './OnfileCardId';
import type { OnfileCardIndex } from './OnfileCardIndex';
import type { OnfileCardType } from './OnfileCardType';
/**
 * 登録されたカード情報
 */
export type OnfileCardInformation = {
  type?: OnfileCardType;
  cardId?: OnfileCardId;
  index?: OnfileCardIndex;
  /**
   * カード番号
   * 下4桁(**********9999)固定でマスクされます。
   *
   */
  cardNumber?: string;
  /**
   * カードの名義人
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
   * カードの発行カード会社コード
   */
  issuerCode?: string;
  /**
   * カードのブランド
   */
  brand?: OnfileCardInformation.brand;
  /**
   * デフォルトカード判定
   * デフォルトカードの場合<span class="mp-oas-code">true</span>、そうでない場合<span class="mp-oas-code">false</span>です。
   *
   */
  isDefault?: boolean;
};
export namespace OnfileCardInformation {
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
}
