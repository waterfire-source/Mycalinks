/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 認証コード情報
 */
export type SmsPinData = {
  /**
   * 携帯電話番号
   * <span class="mp-oas-code">verificationInformation.type</span>が<span class="mp-oas-code">sms-pin</span>の場合は必須です。
   * 090、080、070から始まる日本の携帯電話番号を指定してください。
   * 海外電話番号へのSMS配信は行えません。
   *
   */
  smsPhoneNumber?: string;
  /**
   * 認証コード桁数
   * 未指定の場合は6桁です。
   * - <span class="mp-oas-code">digits-4</span>：4桁
   * - <span class="mp-oas-code">digits-6</span>：6桁
   *
   */
  pinType?: SmsPinData.pinType;
};
export namespace SmsPinData {
  /**
   * 認証コード桁数
   * 未指定の場合は6桁です。
   * - <span class="mp-oas-code">digits-4</span>：4桁
   * - <span class="mp-oas-code">digits-6</span>：6桁
   *
   */
  export enum pinType {
    DIGITS_4 = 'digits-4',
    DIGITS_6 = 'digits-6',
  }
}
