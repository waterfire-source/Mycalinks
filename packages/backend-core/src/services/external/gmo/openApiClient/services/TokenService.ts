/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TokenRequest } from '../models/TokenRequest';
import type { TokenResponse } from '../models/TokenResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TokenService {
  /**
   * アクセストークン発行
   * アクセストークン方式の認証に利用するアクセストークンを発行するために呼び出すAPIです。
   * 認証の詳細は[APIの認証](#tag/authentication)を参照ください。
   *
   * @param formData
   * @returns TokenResponse アクセストークン発行が成功した場合のレスポンス
   *
   * @throws ApiError
   */
  public static token(
    formData: TokenRequest,
  ): CancelablePromise<TokenResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/token',
      formData: formData,
      mediaType: 'application/x-www-form-urlencoded',
      errors: {
        400: `パラメーターの誤りや該当取引のステータスが受付可能な状態でない等の理由により有効性確認リクエストを進められない場合のレスポンス
                エラーの原因は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        500: `当サービスのシステムで予期せぬエラーが発生した場合のレスポンス
                `,
      },
    });
  }
}
