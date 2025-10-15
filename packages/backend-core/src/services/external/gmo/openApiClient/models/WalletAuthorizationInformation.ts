/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AmazonPay } from './AmazonPay';
import type { OnfileWalletType } from './OnfileWalletType';
import type { WalletAuthorizationOptions } from './WalletAuthorizationOptions';
/**
 * Pay払い利用承諾情報
 */
export type WalletAuthorizationInformation = {
  /**
   * 登録するPay払い利用承諾のタイプ
   * 登録するPay払い利用承諾のタイプによってパラメーターの設定要否が異なります。
   * 詳細は[共通パラメーター対応表 - Pay払い](#tag/common-parameters/Pay)を参照ください。
   * - <span class="mp-oas-code">PAYPAY</span>：PayPay
   * - <span class="mp-oas-code">DOCOMO</span>：d払い
   * - <span class="mp-oas-code">RAKUTEN</span>：楽天ペイ(オンライン決済)V2
   * - <span class="mp-oas-code">AMAZON</span>：Amazon Pay V2
   * - <span class="mp-oas-code">AU_APP</span>：au PAY(ネット支払い)アプリ方式
   * - <span class="mp-oas-code">MERPAY</span>：メルペイ
   *
   */
  walletType: OnfileWalletType;
  walletAuthorizationOptions: WalletAuthorizationOptions;
  amazonPay?: AmazonPay;
};
