/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessId } from './AccessId';
/**
 * 都度支払い（フロントエンド方式）決済結果通知リクエストパラメーター
 */
export type WalletFrontendWebhook = {
  /**
   * 取引ID
   * 取引リクエスト時に返る取引IDです。
   *
   */
  accessId: AccessId;
  /**
   * Webhookイベントタイプ
   * - <span class="mp-oas-code">WALLET_PAID</span>：Pay払い支払い完了
   *
   */
  event: WalletFrontendWebhook.event;
  /**
   * Webhook任意パラメーター
   * chargeリクエスト時に加盟店様が設定した任意の値です。
   * CSRF対策のために利用してください。
   *
   */
  csrfToken?: string;
};
export namespace WalletFrontendWebhook {
  /**
   * Webhookイベントタイプ
   * - <span class="mp-oas-code">WALLET_PAID</span>：Pay払い支払い完了
   *
   */
  export enum event {
    WALLET_PAID = 'WALLET_PAID',
  }
}
