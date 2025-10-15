/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Phone } from './Phone';
/**
 * 購入者情報
 * 決済手段ごとの設定要否や各パラメーターの用途は、詳細は[共通パラメーター対応表](#tag/common-parameters)を参照ください。
 *
 */
export type Payer = {
  /**
   * 購入者の氏名(フルネーム)
   * 設定できる最大長はUTF-8で60byteです。
   *
   */
  name: string;
  /**
   * 購入者の氏名(全角カナのみ)
   * 設定できる最大長はUTF-8で60byteです。
   * #### 決済手段ごとの制限事項
   * - コンビニ: <span style="color: #d41f1c;font-family:Courier,monospace;font-size: 0.9em">required</span>
   * - Pay-easy: <span style="color: #d41f1c;font-family:Courier,monospace;font-size: 0.9em">required</span>
   *
   */
  nameKana?: string;
  /**
   * 購入者の氏名(英名)
   *
   */
  nameAlphabet?: string;
  /**
   * 購入者の性別
   *
   */
  gender?: Payer.gender;
  /**
   * 購入者の誕生日
   * YYYYMMDD形式
   *
   */
  dateOfBirth?: string;
  /**
   * 購入者のメールアドレス
   * [RFC 5322](https://www.rfc-editor.org/rfc/rfc5322)の仕様に沿った形式のみ許可されます。
   *
   */
  email?: string;
  /**
   * 取引内容がWebチケットなどの電子デリバリーの場合、配信先のメールアドレスを設定します。
   * [RFC 5322](https://www.rfc-editor.org/rfc/rfc5322)の仕様に沿った形式のみ許可されます。
   *
   */
  deliveryEmail?: string;
  /**
   * 購入者の電話情報一覧
   */
  phones?: Array<Phone>;
  /**
   * 加盟店様サイト上における購入者のアカウントIDなど、一意に識別するためのID
   */
  accountId?: string;
  /**
   * 購入者の発信元IPアドレス
   */
  ip?: string;
  /**
   * 購入者のデバイス情報をWeb、アプリから選択
   * - <span class="mp-oas-code">PC_WEB</span>：PC(Web)
   * - <span class="mp-oas-code">PC_APP</span>：PC(アプリ)
   * - <span class="mp-oas-code">MOBILE_WEB</span>：モバイル(Web)
   * - <span class="mp-oas-code">MOBILE_APP</span>：モバイル(アプリ)
   *
   */
  deviceType?: Payer.deviceType;
  /**
   * 購入者のデバイスのOS
   * - <span class="mp-oas-code">IOS</span>：iOS
   * - <span class="mp-oas-code">ANDROID</span>：Android
   * #### 決済手段ごとの制限事項
   * - Alipay: <span class="mp-oas-code">transitionType</span>が<span class="mp-oas-code">APP_LINK</span>の場合は必須
   *
   */
  osType?: Payer.osType;
  /**
   * 購入者のブラウザのUserAgent
   * 半角英数字記号が設定可能です。
   *
   */
  httpUserAgent?: string;
};
export namespace Payer {
  /**
   * 購入者の性別
   *
   */
  export enum gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
  }
  /**
   * 購入者のデバイス情報をWeb、アプリから選択
   * - <span class="mp-oas-code">PC_WEB</span>：PC(Web)
   * - <span class="mp-oas-code">PC_APP</span>：PC(アプリ)
   * - <span class="mp-oas-code">MOBILE_WEB</span>：モバイル(Web)
   * - <span class="mp-oas-code">MOBILE_APP</span>：モバイル(アプリ)
   *
   */
  export enum deviceType {
    PC_WEB = 'PC_WEB',
    PC_APP = 'PC_APP',
    MOBILE_WEB = 'MOBILE_WEB',
    MOBILE_APP = 'MOBILE_APP',
  }
  /**
   * 購入者のデバイスのOS
   * - <span class="mp-oas-code">IOS</span>：iOS
   * - <span class="mp-oas-code">ANDROID</span>：Android
   * #### 決済手段ごとの制限事項
   * - Alipay: <span class="mp-oas-code">transitionType</span>が<span class="mp-oas-code">APP_LINK</span>の場合は必須
   *
   */
  export enum osType {
    IOS = 'IOS',
    ANDROID = 'ANDROID',
  }
}
