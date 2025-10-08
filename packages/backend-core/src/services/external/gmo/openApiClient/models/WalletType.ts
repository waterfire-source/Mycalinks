/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Pay払いタイプ
 * Pay払いタイプによってパラメーターの設定要否が異なります。
 * 詳細は[共通パラメーター対応表 - Pay払い](#tag/common-parameters/Pay)を参照ください。
 * - <span class="mp-oas-code">PAYPAY</span>：PayPay
 * - <span class="mp-oas-code">DOCOMO</span>：d払い
 * - <span class="mp-oas-code">RAKUTEN</span>：楽天ペイ(オンライン決済)V2
 * - <span class="mp-oas-code">AMAZON</span>：Amazon Pay V2
 * - <span class="mp-oas-code">AU_APP</span>：au PAY(ネット支払い)アプリ方式
 * - <span class="mp-oas-code">MERPAY</span>：メルペイ
 * - <span class="mp-oas-code">ALIPAY</span>：Alipay  **<span style="color: #d41f1c">※本番環境ではAlipayは2025年8月以降に利用いただけます。</span>**
 *
 */
export enum WalletType {
  PAYPAY = 'PAYPAY',
  DOCOMO = 'DOCOMO',
  RAKUTEN = 'RAKUTEN',
  AU_APP = 'AU_APP',
  MERPAY = 'MERPAY',
  AMAZON = 'AMAZON',
  ALIPAY = 'ALIPAY',
}
