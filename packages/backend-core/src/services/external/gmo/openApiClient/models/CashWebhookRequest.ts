/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessId } from './AccessId';
/**
 * 現金払いの支払い完了通知リクエストパラメーター
 */
export type CashWebhookRequest = {
  /**
   * 取引ID
   * 取引リクエスト時に返る取引IDです。
   *
   */
  accessId: AccessId;
  /**
   * Webhookイベントタイプ
   * - <span class="mp-oas-code">CASH_PAID</span>：現金払い支払い完了
   *
   */
  event: CashWebhookRequest.event;
  /**
   * Webhook任意パラメーター
   * chargeリクエスト時に加盟店様が設定した任意の値です。
   * CSRF対策のために利用してください。
   *
   */
  csrfToken?: string;
};
export namespace CashWebhookRequest {
  /**
   * Webhookイベントタイプ
   * - <span class="mp-oas-code">CASH_PAID</span>：現金払い支払い完了
   *
   */
  export enum event {
    CASH_PAID = 'CASH_PAID',
  }
}
