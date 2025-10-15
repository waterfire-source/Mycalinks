/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WalletAuthorizationRequest } from '../models/WalletAuthorizationRequest';
import type { WalletAuthorizationResponse } from '../models/WalletAuthorizationResponse';
import type { WalletChargeRequest } from '../models/WalletChargeRequest';
import type { WalletChargeResponse } from '../models/WalletChargeResponse';
import type { WalletFrontendChargeRequest } from '../models/WalletFrontendChargeRequest';
import type { WalletFrontendChargeResponse } from '../models/WalletFrontendChargeResponse';
import type { WalletFrontendVerifyChargeRequest } from '../models/WalletFrontendVerifyChargeRequest';
import type { WalletFrontendVerifyChargeResponse } from '../models/WalletFrontendVerifyChargeResponse';
import type { walletGetCustomerDataRequest } from '../models/walletGetCustomerDataRequest';
import type { WalletGetCustomerDataResponse } from '../models/WalletGetCustomerDataResponse';
import type { WalletOnfileChargeRequest } from '../models/WalletOnfileChargeRequest';
import type { WalletOnfileChargeResponse } from '../models/WalletOnfileChargeResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WalletService {
  /**
   * 都度支払い
   * 都度のお手続きをしてPay払いで支払う場合に呼び出すAPIです。
   *
   * @param requestBody どのPay払いを利用するかは<span class="mp-oas-code">walletInformation.walletType</span>で設定します。
   *
   * @param idempotencyKey 冪等キー
   * リクエスト毎にユニークな最大36桁の任意の文字列。
   * 詳細は[冪等処理](#tag/idempotence)を参照ください。
   *
   * @returns WalletChargeResponse Pay払いの決済事業者が提供するWebサイトやモバイルアプリにリダイレクトして支払い手続きに進む場合のレスポンス
   *
   * @throws ApiError
   */
  public static walletCharge(
    requestBody: WalletChargeRequest,
    idempotencyKey?: string,
  ): CancelablePromise<WalletChargeResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/wallet/charge',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りなどの理由により支払いリクエストを進められない場合のレスポンス
                エラーの原因と該当のパラメーター名は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        402: `Pay払いの決済事業者への支払い開始手続き処理で何らかのエラーが返り、リダイレクトに進めない場合のレスポンス
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
  /**
   * 都度支払い（フロントエンド方式）
   * 決済事業者画面への遷移なく、加盟店様の画面上で都度支払いを行う場合に呼び出すAPIです。
   * 現時点ではPay払いタイプ<span class="mp-oas-code">PAYPAY</span>（[PayPayスマートペイメント](https://developer.paypay.ne.jp/products/docs/smartpayment)）のみ利用可能です。
   *
   * @param requestBody どのPay払いを利用するかは<span class="mp-oas-code">walletFrontendInformation.walletType</span>で設定します。
   *
   * @param idempotencyKey 冪等キー
   * リクエスト毎にユニークな最大36桁の任意の文字列。
   * 詳細は[冪等処理](#tag/idempotence)を参照ください。
   *
   * @returns WalletFrontendChargeResponse 加盟店様画面上でのPay払い手続きに必要な情報を払い出すことに成功した場合のレスポンス
   *
   * @throws ApiError
   */
  public static walletFrontendCharge(
    requestBody: WalletFrontendChargeRequest,
    idempotencyKey?: string,
  ): CancelablePromise<WalletFrontendChargeResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/wallet/front-end/charge',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りなどの理由により支払いリクエストを進められない場合のレスポンス
                エラーの原因と該当のパラメーター名は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        401: `Pay払いの決済事業者にて拒否された場合のレスポンス
                詳細な理由は<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        500: `当サービスのシステムで予期せぬエラーが発生した場合のレスポンス
                `,
        502: `カード会社等の外部事業者からシステムエラーが返る場合のレスポンス
                `,
      },
    });
  }
  /**
   * 支払い後検証（フロントエンド方式）
   * 都度支払い（フロントエンド方式）の取引を検証するためのAPIです。
   * 現時点ではPay払いタイプ<span class="mp-oas-code">PAYPAY</span>（[PayPayスマートペイメント](https://developer.paypay.ne.jp/products/docs/smartpayment)）のみ利用可能です。
   *
   * @param requestBody どのPay払いを利用するかは<span class="mp-oas-code">walletFrontendInformation.walletType</span>で設定します。
   *
   * @param idempotencyKey 冪等キー
   * リクエスト毎にユニークな最大36桁の任意の文字列。
   * 詳細は[冪等処理](#tag/idempotence)を参照ください。
   *
   * @returns WalletFrontendVerifyChargeResponse 支払い後の検証が成功した場合のレスポンス
   *
   * @throws ApiError
   */
  public static walletFrontendVerifyCharge(
    requestBody: WalletFrontendVerifyChargeRequest,
    idempotencyKey?: string,
  ): CancelablePromise<WalletFrontendVerifyChargeResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/wallet/front-end/verifyCharge',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りなどの理由により支払いリクエストを進められない場合のレスポンス
                エラーの原因と該当のパラメーター名は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        402: `Pay払いの決済事業者にて拒否された場合のレスポンス
                詳細な理由は<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        500: `当サービスのシステムで予期せぬエラーが発生した場合のレスポンス
                `,
        502: `カード会社等の外部事業者からシステムエラーが返る場合のレスポンス
                `,
      },
    });
  }
  /**
   * 随時支払い
   * 事前に承認済の認証情報を使ってPay払いで支払う場合に呼び出すAPIです。
   *
   * @param requestBody どのPay払いを利用するかは<span class="mp-oas-code">walletOnfileInformation.onfileWallet</span>で設定します。
   *
   * @param idempotencyKey 冪等キー
   * リクエスト毎にユニークな最大36桁の任意の文字列。
   * 詳細は[冪等処理](#tag/idempotence)を参照ください。
   *
   * @returns WalletOnfileChargeResponse Pay払いの決済事業者にて支払いが成功した場合のレスポンス
   *
   * @throws ApiError
   */
  public static walletOnfileCharge(
    requestBody: WalletOnfileChargeRequest,
    idempotencyKey?: string,
  ): CancelablePromise<WalletOnfileChargeResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/wallet/on-file/charge',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りなどの理由により支払いリクエストを進められない場合のレスポンス
                エラーの原因と該当のパラメーター名は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        402: `Pay払いの決済事業者にて拒否された場合のレスポンス
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
  /**
   * 利用承諾
   * 随時決済のための利用承諾手続き時に呼び出すAPIです。
   *
   * @param requestBody どのPay払いを利用するかは<span class="mp-oas-code">walletInformation.walletType</span>で設定します。
   *
   * @param idempotencyKey 冪等キー
   * リクエスト毎にユニークな最大36桁の任意の文字列。
   * 詳細は[冪等処理](#tag/idempotence)を参照ください。
   *
   * @returns WalletAuthorizationResponse Pay払いの決済事業者が提供するWebサイトやモバイルアプリにリダイレクトして利用承諾手続きに進む場合のレスポンス
   *
   * @throws ApiError
   */
  public static walletAuthorizeAccount(
    requestBody: WalletAuthorizationRequest,
    idempotencyKey?: string,
  ): CancelablePromise<WalletAuthorizationResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/wallet/authorizeAccount',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りなどの理由により利用承諾リクエストを進められない場合のレスポンス
                エラーの原因と該当のパラメーター名は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        402: `Pay払いの決済事業者への利用承諾開始手続き処理にて何らかのエラーが返り、リダイレクトに進めない場合のレスポンス
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
  /**
   * 購入者情報取得
   * 決済事業者で保持している購入者情報を取得するためのAPIです。
   * 現時点ではAmazon Pay V2のみ利用可能です。
   *
   * @param requestBody
   * @returns WalletGetCustomerDataResponse 購入者情報が正常に返る場合のレスポンス
   *
   * @throws ApiError
   */
  public static walletGetCustomerData(
    requestBody: walletGetCustomerDataRequest,
  ): CancelablePromise<WalletGetCustomerDataResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/wallet/getCustomerData',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りや対象取引の状態などの理由により照会処理ができない場合のレスポンス
                エラーの原因と該当のパラメーター名は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        500: `当サービスのシステムで予期せぬエラーが発生した場合のレスポンス
                `,
        502: `カード会社等の外部事業者からシステムエラーが返る場合のレスポンス
                `,
      },
    });
  }
}
