/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * トークン化されたカード情報
 */
export type TokenizedCard = {
  /**
   * カード情報トークンのタイプ
   * カード情報トークン<span class="mp-oas-code">token</span>と合わせて設定してください。
   * - <span class="mp-oas-code">MP_TOKEN</span>: MPクレカトークン
   * - <span class="mp-oas-code">APPLE_PAY_TOKEN</span>: Apple Payトークン
   * - <span class="mp-oas-code">GOOGLE_PAY_TOKEN</span>: Google Payトークン
   *
   */
  type: TokenizedCard.type;
  /**
   * カード情報トークン
   * カード情報トークンのタイプ<span class="mp-oas-code">type</span>と合わせて設定してください。
   * - MPクレカトークン
   * カード情報をトークン化した値です。
   *
   * - Apple Payトークン
   * Apple Payに対応した端末で取得したApple PayのPayment tokenをbase64エンコードした値です。
   *
   * - Google Payトークン
   * Google Pay APIで取得したPayment tokenをbase64エンコードした値です。
   *
   * ***
   * カード情報トークンとカード情報を両方設定した場合は以下の通りです。
   * - PCI DSSの認定を得ている加盟店様
   * カード情報トークンが優先的に利用されます。
   * - PCI DSSの認定を得ていない加盟店様
   * 契約不備のエラーになります。
   *
   */
  token: string;
};
export namespace TokenizedCard {
  /**
   * カード情報トークンのタイプ
   * カード情報トークン<span class="mp-oas-code">token</span>と合わせて設定してください。
   * - <span class="mp-oas-code">MP_TOKEN</span>: MPクレカトークン
   * - <span class="mp-oas-code">APPLE_PAY_TOKEN</span>: Apple Payトークン
   * - <span class="mp-oas-code">GOOGLE_PAY_TOKEN</span>: Google Payトークン
   *
   */
  export enum type {
    MP_TOKEN = 'MP_TOKEN',
    APPLE_PAY_TOKEN = 'APPLE_PAY_TOKEN',
    GOOGLE_PAY_TOKEN = 'GOOGLE_PAY_TOKEN',
  }
}
