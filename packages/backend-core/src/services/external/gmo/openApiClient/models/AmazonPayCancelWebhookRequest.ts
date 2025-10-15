/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessId } from './AccessId';
/**
 * Amazon Pay V2のキャンセル結果通知リクエストパラメーター
 */
export type AmazonPayCancelWebhookRequest = {
  /**
   * 取引ID
   * キャンセルリクエスト時に設定した取引IDです。
   *
   */
  accessId: AccessId;
  /**
   * Webhookイベントタイプ
   * - <span class="mp-oas-code">REFUND_SUCCEEDED</span>：キャンセル成功
   * - <span class="mp-oas-code">REFUND_FAILED</span>：キャンセル失敗
   *
   */
  event: AmazonPayCancelWebhookRequest.event;
  /**
   * Webhook任意パラメーター
   * chargeリクエスト時に加盟店様が設定した任意の値です。
   * CSRF対策のために利用してください。
   *
   */
  csrfToken?: string;
};
export namespace AmazonPayCancelWebhookRequest {
  /**
   * Webhookイベントタイプ
   * - <span class="mp-oas-code">REFUND_SUCCEEDED</span>：キャンセル成功
   * - <span class="mp-oas-code">REFUND_FAILED</span>：キャンセル失敗
   *
   */
  export enum event {
    REFUND_SUCCEEDED = 'REFUND_SUCCEEDED',
    REFUND_FAILED = 'REFUND_FAILED',
  }
}
