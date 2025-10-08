/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CashChargeRequest } from '../models/CashChargeRequest';
import type { CashChargeResponse } from '../models/CashChargeResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { getGeneralSetting, OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CashService {
  /**
   * 支払い番号発行
   * コンビニ決済や銀行振込などの現金払いでのお支払い時に利用するAPIです。
   * 支払いの結果は、非同期で加盟店様がリクエスト時に設定した[Webhook URLにHTTPメソッド<span class="mp-oas-code">POST</span>で通知](#tag/events/operation/cashWebhook)します。
   *
   * @param requestBody どの現金払いを利用するかは<span class="mp-oas-code">cashInformation.cashType</span>で設定します。
   *
   * @param idempotencyKey 冪等キー
   * リクエスト毎にユニークな最大36桁の任意の文字列。
   * 詳細は[冪等処理](#tag/idempotence)を参照ください。
   *
   * @returns CashChargeResponse 現金での支払い手続きに必要な情報が払い出された場合のレスポンス
   *
   * @throws ApiError
   */
  public static cashCharge(
    requestBody: CashChargeRequest,
    idempotencyKey?: string,
    mode: 'contract' | 'ec' = 'ec',
  ): CancelablePromise<CashChargeResponse> {
    return __request(getGeneralSetting(mode), {
      method: 'POST',
      url: '/cash/charge',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りなどの理由により番号払い出しリクエストを進められない場合のレスポンス
                エラーの原因と該当のパラメーター名は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        402: `決済事業者への番号払い出し手続き処理にて何らかのエラーが返る場合のレスポンス
                詳細な理由は<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        409: `二重リクエストによるエラーが発生した場合のレスポンス
                `,
        500: `当サービスのシステムで予期せぬエラーが発生した場合のレスポンス
                `,
        502: `カード会社等の外部事業者からシステムエラーが返る場合のレスポンス
                `,
      },
    });
  }
}
