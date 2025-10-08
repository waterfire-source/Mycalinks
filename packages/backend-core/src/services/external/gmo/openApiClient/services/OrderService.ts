/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderCancelRequest } from '../models/OrderCancelRequest';
import type { OrderCancelResponseCash } from '../models/OrderCancelResponseCash';
import type { OrderCancelResponseCredit } from '../models/OrderCancelResponseCredit';
import type { OrderCancelResponseWallet } from '../models/OrderCancelResponseWallet';
import type { OrderCaptureRequest } from '../models/OrderCaptureRequest';
import type { OrderCaptureResponseCredit } from '../models/OrderCaptureResponseCredit';
import type { OrderCaptureResponseWallet } from '../models/OrderCaptureResponseWallet';
import type { OrderInquiryRequest } from '../models/OrderInquiryRequest';
import type { OrderInquiryResponse } from '../models/OrderInquiryResponse';
import type { OrderUpdateRequest } from '../models/OrderUpdateRequest';
import type { OrderUpdateResponseCredit } from '../models/OrderUpdateResponseCredit';
import type { OrderUpdateResponseWallet } from '../models/OrderUpdateResponseWallet';
import type { CancelablePromise } from '../core/CancelablePromise';
import { getGeneralSetting, OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrderService {
  /**
   * 確定
   * 決済確定のためのAPIです。
   *
   * @param requestBody
   * @param idempotencyKey 冪等キー
   * リクエスト毎にユニークな最大36桁の任意の文字列。
   * 詳細は[冪等処理](#tag/idempotence)を参照ください。
   *
   * @returns any 取引の確定が成功した場合のレスポンス
   *
   * @throws ApiError
   */
  public static orderCapture(
    requestBody: OrderCaptureRequest,
    idempotencyKey?: string,
  ): CancelablePromise<
    OrderCaptureResponseCredit | OrderCaptureResponseWallet
  > {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/order/capture',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りや対象取引の状態などの理由により確定リクエストを進められない場合のレスポンス
                エラーの原因と該当のパラメーター名は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        402: `外部事業者にて拒否された場合のレスポンス
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
   * 金額変更
   * すでに支払い済みの取引の金額を変更します。
   * 決済手段と支払い状態により実行できる処理が異なります。
   * クレジットカードの場合は、当サービス内部で取消と再オーソリ(信用照会)の処理を実施します。
   * お客様の信用状態によっては、再オーソリ(信用照会)が失敗する場合があり、その場合は取消は無効となり金額変更APIを呼び出す前の状態に戻ります。
   * クレジットカードは同じ金額を設定して呼び出すことで、仮売上状態の延長が可能です。
   *
   * |||仮売上<br>の減額|仮売上<br>の増額|実売上<br>の減額|実売上<br>の増額|即時売上<br>の減額|即時売上<br>の増額|
   * |:-------|:------------|:-:|:-:|:-:|:-:|:-:|:-:|
   * |クレカ払い|クレカ     | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 |
   * |         |Google Pay | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 |
   * |         |Apple Pay  | △<sup>*1</sup> | △<sup>*1</sup> | △<sup>*1</sup> | △<sup>*1</sup> | △<sup>*1</sup> | △<sup>*1</sup> |
   * |Pay払い  |PayPay     | × | × | 〇 | × | 〇 | × |
   * |         |d払い      | × | × | 〇 | △<sup>*2</sup> | 〇 | △<sup>*2</sup> |
   * |         |楽天ペイ(オンライン決済)V2 | 〇 | 〇 | 〇 | 〇 | 〇 | 〇 |
   * |         |Amazon Pay V2 | 〇 | 〇 | 〇 | × | 〇 | × |
   * |         |au PAY(ネット支払い)アプリ方式  | 〇 | 〇 | 〇 | × | 〇 | × |
   * |         |Alipay    | - | - | - | - | 〇 | × |
   * |         |メルペイ    | × | × | 〇 | × | 〇 | × |
   * |現金払い  |コンビニ   | - | - | - | - | - | - |
   * |         |Pay-easy   | - | - | - | - | - | - |
   * |         |銀行振込    | - | - | - | - | - | - |
   *
   * *1：Visaブランドのカードは増額・減額ができません。
   * *2：減額した取引に限り、元取引金額までの決済金額の増額ができます。
   *
   * @param requestBody
   * @param idempotencyKey 冪等キー
   * リクエスト毎にユニークな最大36桁の任意の文字列。
   * 詳細は[冪等処理](#tag/idempotence)を参照ください。
   *
   * @returns any 支払い金額の変更が成功した場合のレスポンス
   *
   * @throws ApiError
   */
  public static orderUpdate(
    requestBody: OrderUpdateRequest,
    idempotencyKey?: string,
    mode: 'contract' | 'ec' = 'ec',
  ): CancelablePromise<OrderUpdateResponseCredit | OrderUpdateResponseWallet> {
    return __request(getGeneralSetting(mode), {
      method: 'POST',
      url: '/order/update',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りや対象取引の状態などの理由により金額変更リクエストを進められない場合のレスポンス
                エラーの原因と該当のパラメーター名は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        402: `外部事業者にて拒否された場合のレスポンス
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
   * キャンセル
   * 支払いを取り消すためのAPIです。
   *
   * @param requestBody
   * @param idempotencyKey 冪等キー
   * リクエスト毎にユニークな最大36桁の任意の文字列。
   * 詳細は[冪等処理](#tag/idempotence)を参照ください。
   *
   * @returns any 支払いのキャンセルが成功した場合のレスポンス
   *
   * @throws ApiError
   */
  public static orderCancel(
    requestBody: OrderCancelRequest,
    idempotencyKey?: string,
    mode: 'contract' | 'ec' = 'ec',
  ): CancelablePromise<
    | OrderCancelResponseCredit
    | OrderCancelResponseWallet
    | OrderCancelResponseCash
  > {
    return __request(getGeneralSetting(mode), {
      method: 'POST',
      url: '/order/cancel',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りや対象取引の状態などの理由によりキャンセルリクエストを進められない場合のレスポンス
                エラーの原因と該当のパラメーター名は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        402: `外部事業者に拒否された場合のレスポンス
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
   * 照会
   * 取引を照会するためのAPIです。
   * accessIdとorderIdのどちらかは必ず設定してください。
   * accessIdとorderIdの両方を設定した場合は両方に一致する取引情報が返ります。
   *
   * @param requestBody
   * @returns OrderInquiryResponse 取引情報が正常に返る場合のレスポンス
   *
   * @throws ApiError
   */
  public static orderInquiry(
    requestBody: OrderInquiryRequest,
    mode: 'contract' | 'ec' = 'ec',
  ): CancelablePromise<OrderInquiryResponse> {
    return __request(getGeneralSetting(mode), {
      method: 'POST',
      url: '/order/inquiry',
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
