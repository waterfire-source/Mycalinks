/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Pay払いの支払いオプション
 */
export type WalletChargeOptions = {
  /**
   * 支払い要求のタイプ
   * - <span class="mp-oas-code">AUTH</span>：仮売上
   * - <span class="mp-oas-code">CAPTURE</span>：即時売上
   *
   */
  authorizationMode: WalletChargeOptions.authorizationMode;
  /**
   * Pay払いの決済事業者へのリダイレクト方式
   * Pay払いの決済事業者画面へ遷移する方法を指定します。
   * 現時点ではAlipayのみ利用可能です。
   * 詳細は[マルペイDocs](https://docs.mul-pay.jp/alipay/overview)を参照ください。
   * Alipay以外の決済手段では指定しないでください。
   * 省略時はデフォルトで<span class="mp-oas-code">WEB_LINK</span>が設定されます。
   * - <span class="mp-oas-code">APP_LINK</span>：Pay払いの決済事業者のモバイルアプリリンク
   * - <span class="mp-oas-code">WEB_LINK</span>：Pay払いの決済事業者にリダイレクトする外部ブラウザのリンク
   *
   */
  transitionType?: WalletChargeOptions.transitionType;
};
export namespace WalletChargeOptions {
  /**
   * 支払い要求のタイプ
   * - <span class="mp-oas-code">AUTH</span>：仮売上
   * - <span class="mp-oas-code">CAPTURE</span>：即時売上
   *
   */
  export enum authorizationMode {
    AUTH = 'AUTH',
    CAPTURE = 'CAPTURE',
  }
  /**
   * Pay払いの決済事業者へのリダイレクト方式
   * Pay払いの決済事業者画面へ遷移する方法を指定します。
   * 現時点ではAlipayのみ利用可能です。
   * 詳細は[マルペイDocs](https://docs.mul-pay.jp/alipay/overview)を参照ください。
   * Alipay以外の決済手段では指定しないでください。
   * 省略時はデフォルトで<span class="mp-oas-code">WEB_LINK</span>が設定されます。
   * - <span class="mp-oas-code">APP_LINK</span>：Pay払いの決済事業者のモバイルアプリリンク
   * - <span class="mp-oas-code">WEB_LINK</span>：Pay払いの決済事業者にリダイレクトする外部ブラウザのリンク
   *
   */
  export enum transitionType {
    APP_LINK = 'APP_LINK',
    WEB_LINK = 'WEB_LINK',
  }
}
