/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { VerificationInquiryRequest } from '../models/VerificationInquiryRequest';
import type { VerificationInquiryResponse } from '../models/VerificationInquiryResponse';
import type { VerificationStartRequest } from '../models/VerificationStartRequest';
import type { VerificationStartResponse } from '../models/VerificationStartResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VerifyService {
  /**
   * 認証開始
   * 認証開始時に呼び出すAPIです。
   * <br>
   *
   * @param requestBody どの認証方法を利用するかは<span class="mp-oas-code">verificationInformation.type</span>で設定します。
   *
   * @param idempotencyKey 冪等キー
   * リクエスト毎にユニークな最大36桁の任意の文字列。
   * 詳細は[冪等処理](#tag/idempotence)を参照ください。
   *
   * @returns VerificationStartResponse 認証開始が成功した場合のレスポンス
   *
   * @throws ApiError
   */
  public static verificationStart(
    requestBody: VerificationStartRequest,
    idempotencyKey?: string,
  ): CancelablePromise<VerificationStartResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/verification/start',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りなどの理由により認証リクエストを進められない場合のレスポンス
                エラーの原因と該当のパラメーター名は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        409: `二重リクエストによるエラーが発生した場合のレスポンス
                `,
        500: `当サービスのシステムで予期せぬエラーが発生した場合のレスポンス
                `,
      },
    });
  }
  /**
   * 照会
   * 認証情報を照会するためのAPIです。
   * accessIdとverificationIdのどちらかは必ず設定してください。
   * accessIdとverificationIdの両方を設定した場合は両方に一致する取引情報が返ります。
   *
   * @param requestBody
   * @returns VerificationInquiryResponse 認証情報が正常に返る場合のレスポンス
   *
   * @throws ApiError
   */
  public static verificationInquiry(
    requestBody: VerificationInquiryRequest,
  ): CancelablePromise<VerificationInquiryResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/verification/inquiry',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りなどの理由により照会処理ができない場合のレスポンス
                エラーの原因と該当のパラメーター名は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        500: `当サービスのシステムで予期せぬエラーが発生した場合のレスポンス
                `,
      },
    });
  }
}
