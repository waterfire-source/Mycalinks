/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 加盟店(ショップ)情報
 * 決済手段ごとの設定要否や各パラメーターの用途は、詳細は[共通パラメーター対応表](#tag/common-parameters)を参照ください。
 *
 */
export type Merchant = {
  /**
   * 表示用の加盟店様名
   * 設定できる最大長はUTF-8で45byteです。
   *
   */
  name: string;
  /**
   * 表示用の加盟店様名(全角カナのみ)
   * 設定できる最大長はUTF-8で60byteです。
   *
   */
  nameKana: string;
  /**
   * 表示用の加盟店様名(英名)
   *
   */
  nameAlphabet: string;
  /**
   * 表示用の加盟店様名(略称)
   * 設定できる最大長はUTF-8で45byteです。
   *
   */
  nameShort: string;
  /**
   * 加盟店様の問い合わせ先名称
   * 設定できる最大長はUTF-8で63byteです。
   *
   */
  contactName: string;
  /**
   * 加盟店様の問い合わせ先メールアドレス
   * [RFC 5322](https://www.rfc-editor.org/rfc/rfc5322)の仕様に沿った形式のみ許可されます。
   * #### 決済手段ごとの制限事項
   * - d払い: <span class="mp-oas-code">contactEmail</span>,<span class="mp-oas-code">contactUrl</span>,<span class="mp-oas-code">contactPhone</span>の合計が96byte以下
   * ※<span class="mp-oas-code">/</span>(半角スラッシュ)は4byteとしてカウント
   *
   */
  contactEmail?: string;
  /**
   * 加盟店様の問い合わせ先ページURL
   * #### 決済手段ごとの制限事項
   * - d払い: <span class="mp-oas-code">contactEmail</span>,<span class="mp-oas-code">contactUrl</span>,<span class="mp-oas-code">contactPhone</span>の合計が96byte以下
   * ※<span class="mp-oas-code">/</span>(半角スラッシュ)は4byteとしてカウント
   *
   */
  contactUrl?: string;
  /**
   * 加盟店様の問い合わせ先電話番号
   * #### 決済手段ごとの制限事項
   * - d払い: <span class="mp-oas-code">contactEmail</span>,<span class="mp-oas-code">contactUrl</span>,<span class="mp-oas-code">contactPhone</span>の合計が96byte以下
   * ※<span class="mp-oas-code">/</span>(半角スラッシュ)は4byteとしてカウント
   *
   */
  contactPhone: string;
  /**
   * 加盟店様の問い合わせ窓口の営業時間(HH:MM-HH:MM形式)
   *
   */
  contactOpeningHours: string;
  /**
   * コールバックURL
   * リダイレクトが発生するリクエスト時は必ず設定してください。
   * リダイレクト後に加盟店様のサーバーに処理の遷移を戻すためのURLです。
   * 詳細は[リダイレクトとコールバック](#tag/callback)を参照ください。
   *
   */
  callbackUrl?: string;
  /**
   * Webhook URL
   * 現金払いの支払いなど、処理が非同期で行われた場合に、その結果を通知するための加盟店様側のURLです。
   * httpsから始まるURLを設定してください。
   * ※テスト環境ではhttpの指定が可能です。
   * 詳細は[Webhook](#tag/webhook)を参照ください。
   *
   */
  webhookUrl?: string;
  /**
   * CSRFトークン
   * コールバックやWebhookの呼び出し時につける任意のパラメーターです。
   * CSRF対策のために利用してください。
   * 詳細は[リダイレクトとコールバック](#tag/callback)を参照ください。
   *
   */
  csrfToken?: string;
};
