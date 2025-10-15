/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MemberCreateRequest } from '../models/MemberCreateRequest';
import type { MemberCreateResponse } from '../models/MemberCreateResponse';
import type { MemberDeleteItemRequestCard } from '../models/MemberDeleteItemRequestCard';
import type { MemberDeleteItemRequestWallet } from '../models/MemberDeleteItemRequestWallet';
import type { MemberDeleteItemResponseCard } from '../models/MemberDeleteItemResponseCard';
import type { MemberDeleteItemResponseWallet } from '../models/MemberDeleteItemResponseWallet';
import type { MemberDeleteRequest } from '../models/MemberDeleteRequest';
import type { MemberDeleteResponse } from '../models/MemberDeleteResponse';
import type { MemberInquiryRequest } from '../models/MemberInquiryRequest';
import type { MemberInquiryResponse } from '../models/MemberInquiryResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { getGeneralSetting, OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MemberService {
  /**
   * ID登録
   * 会員を登録するためのAPIです。
   *
   * @param requestBody
   * @param idempotencyKey 冪等キー
   * リクエスト毎にユニークな最大36桁の任意の文字列。
   * 詳細は[冪等処理](#tag/idempotence)を参照ください。
   *
   * @returns MemberCreateResponse 会員の登録が成功した場合のレスポンス
   *
   * @throws ApiError
   */
  public static memberCreate(
    requestBody: MemberCreateRequest,
    idempotencyKey?: string,
    mode: 'contract' | 'ec' = 'ec',
  ): CancelablePromise<MemberCreateResponse> {
    return __request(getGeneralSetting(mode), {
      method: 'POST',
      url: '/member/create',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りなどの理由により登録処理ができない場合のレスポンス
                エラーの原因と該当のパラメーター名は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        500: `当サービスのシステムで予期せぬエラーが発生した場合のレスポンス
                `,
      },
    });
  }
  /**
   * 照会
   * 会員情報を照会するためのAPIです。
   *
   * @param requestBody
   * @returns MemberInquiryResponse 会員情報が正常に返る場合のレスポンス
   *
   * @throws ApiError
   */
  public static memberInquiry(
    requestBody: MemberInquiryRequest,
  ): CancelablePromise<MemberInquiryResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/member/inquiry',
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
  /**
   * 全削除
   * 会員情報を削除するためのAPIです。
   * Pay払いの認証情報も含まれます。
   * 一度削除した会員ID、認証情報は二度と利用できないため、ご注意ください。
   *
   * @param requestBody
   * @param idempotencyKey 冪等キー
   * リクエスト毎にユニークな最大36桁の任意の文字列。
   * 詳細は[冪等処理](#tag/idempotence)を参照ください。
   *
   * @returns MemberDeleteResponse 会員の全情報削除のリクエストを受け付けた場合のレスポンス
   * Pay払いの認証情報は非同期処理で削除します。
   *
   * @throws ApiError
   */
  public static memberDelete(
    requestBody: MemberDeleteRequest,
    idempotencyKey?: string,
  ): CancelablePromise<MemberDeleteResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/member/delete',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りなどの理由により削除処理ができない場合のレスポンス
                エラーの原因と該当のパラメーター名は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        500: `当サービスのシステムで予期せぬエラーが発生した場合のレスポンス
                `,
      },
    });
  }
  /**
   * 認証情報削除
   * 会員に登録されている情報を削除するためのAPIです。
   * 楽天ペイ(オンライン決済)V2ではご利用いただけません。
   *
   * @param requestBody
   * @param idempotencyKey 冪等キー
   * リクエスト毎にユニークな最大36桁の任意の文字列。
   * 詳細は[冪等処理](#tag/idempotence)を参照ください。
   *
   * @returns any 認証情報の削除が成功した場合のレスポンス
   *
   * @throws ApiError
   */
  public static memberDeleteItem(
    requestBody: MemberDeleteItemRequestCard | MemberDeleteItemRequestWallet,
    idempotencyKey?: string,
  ): CancelablePromise<
    MemberDeleteItemResponseCard | MemberDeleteItemResponseWallet
  > {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/member/deleteItem',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りなどの理由により削除処理ができない場合のレスポンス
                エラーの原因と該当のパラメーター名は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        402: `外部事業者にて拒否された場合のレスポンス
                詳細な理由は<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        500: `当サービスのシステムで予期せぬエラーが発生した場合のレスポンス
                `,
        502: `カード会社等の外部事業者からシステムエラーが返る場合のレスポンス
                `,
      },
    });
  }
}
