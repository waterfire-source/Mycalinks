/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * リダイレクト情報
 */
export type RedirectInformation = {
  /**
   * リダイレクト先のURL
   */
  redirectUrl?: string;
  /**
   * リダイレクト時のHTTPメソッド
   * 原則 <span class="mp-oas-code">GET</span> です。詳細は[リダイレクトとコールバック](#tag/callback)を参照ください。
   *
   */
  httpMethod?: RedirectInformation.httpMethod;
  /**
   * リダイレクト処理のタイプ
   * - <span class="mp-oas-code">TDS2</span>：3Dセキュア
   * - <span class="mp-oas-code">WALLET_CHARGE</span>：Pay払い 都度支払い
   * - <span class="mp-oas-code">WALLET_AUTHORIZE</span>：Pay払い 利用承諾
   * - <span class="mp-oas-code">VERIFY</span>：本人確認
   *
   */
  redirectType?: RedirectInformation.redirectType;
  /**
   * リダイレクト時のパラメーター
   * リダイレクト時のHTTPメソッドが <span class="mp-oas-code">POST</span> の場合に、リクエストボディに設定するパラメーター(Map形式)です。
   * <span class="mp-oas-code">GET</span> の場合は、クエリパラメーターとしてリダイレクト先URLに含まれるため、この項目は返りません。
   *
   */
  redirectParameters?: Record<string, any>;
};
export namespace RedirectInformation {
  /**
   * リダイレクト時のHTTPメソッド
   * 原則 <span class="mp-oas-code">GET</span> です。詳細は[リダイレクトとコールバック](#tag/callback)を参照ください。
   *
   */
  export enum httpMethod {
    GET = 'GET',
    POST = 'POST',
  }
  /**
   * リダイレクト処理のタイプ
   * - <span class="mp-oas-code">TDS2</span>：3Dセキュア
   * - <span class="mp-oas-code">WALLET_CHARGE</span>：Pay払い 都度支払い
   * - <span class="mp-oas-code">WALLET_AUTHORIZE</span>：Pay払い 利用承諾
   * - <span class="mp-oas-code">VERIFY</span>：本人確認
   *
   */
  export enum redirectType {
    TDS2 = 'TDS2',
    WALLET_CHARGE = 'WALLET_CHARGE',
    WALLET_AUTHORIZE = 'WALLET_AUTHORIZE',
    VERIFY = 'VERIFY',
  }
}
