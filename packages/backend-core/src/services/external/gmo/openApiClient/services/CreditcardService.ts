/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreditChargeRequest } from '../models/CreditChargeRequest';
import type { CreditChargeResponse } from '../models/CreditChargeResponse';
import type { CreditChargeTds2Response } from '../models/CreditChargeTds2Response';
import type { CreditGetCardDetailsRequest } from '../models/CreditGetCardDetailsRequest';
import type { CreditGetCardDetailsResponse } from '../models/CreditGetCardDetailsResponse';
import type { CreditOnfileChargeRequest } from '../models/CreditOnfileChargeRequest';
import type { CreditStoreCardReponse } from '../models/CreditStoreCardReponse';
import type { CreditStoreCardRequest } from '../models/CreditStoreCardRequest';
import type { CreditVerifyCardRequest } from '../models/CreditVerifyCardRequest';
import type { CreditVerifyCardResponse } from '../models/CreditVerifyCardResponse';
import type { CreditVerifyCardTds2Response } from '../models/CreditVerifyCardTds2Response';
import type { Tds2FinalizeChargeRequest } from '../models/Tds2FinalizeChargeRequest';
import type { Tds2FinalizeChargeResponse } from '../models/Tds2FinalizeChargeResponse';
import type { Tds2FinalizeVerificationRequest } from '../models/Tds2FinalizeVerificationRequest';
import type { Tds2FinalizeVerificationResponse } from '../models/Tds2FinalizeVerificationResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { getGeneralSetting, OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CreditcardService {
  /**
   * 都度支払い
   * カード情報を都度設定して支払う場合に呼び出すAPIです。
   * Apple Pay、Google Payでのお支払いもこのAPIを利用します。
   * <span style="color: #d41f1c">※ApplePayでは3Dセキュアおよび不正検知のご利用ができません。</span>
   * <br>
   *
   * @param requestBody カード情報の設定方法は以下のいずれかです。
   * 1. トークン化して設定
   * - MPクレカトークン
   * 当サービス標準のカード情報トークンです。
   * 詳細は[トークン決済v2 開発ガイド](https://static.mul-pay.jp/doc/card-token/)を参照ください。
   *
   * - Apple Payトークン
   * Apple Payに対応した端末で取得したApple PayのPayment tokenをbase64エンコードした値です。
   * 詳細は[BT01_ApplePay開発ガイド](https://docs.mul-pay.jp/brandtoken/doc)<sup>※</sup>を参照ください。
   * <small>※マルペイDocsの利用方法は[こちら](https://mp-faq.gmo-pg.com/s/article/F00579)</small>
   *
   * - Google Payトークン
   * Google Pay APIで取得したPayment tokenをbase64エンコードした値です。
   * 当サービスが提供する<span class="mp-oas-code">MpToken.js</span>を利用してトークンを取得することができます。
   * 詳細は[トークン決済v2 開発ガイド](https://static.mul-pay.jp/doc/card-token/)を参照ください。
   * Google Payに関する詳細は[デベロッパー向けドキュメント](https://developers.google.com/pay/api)を参照ください。
   *
   * 2. 直接設定
   * [PCI DSS](https://ja.wikipedia.org/wiki/PCI_DSS)の認定を得ている加盟店様のみが利用できます。
   * 本番環境で利用するためにはお申し込みが必要です。
   *
   * 3Dセキュア認証利用時には、以下のカード会員の情報を必ず設定してください。
   * 未設定でもエラーにはなりませんが、変更になる可能性があります。
   * - カード会員の名前
   * - トークン化して設定
   * MPクレカトークンの「カード名義人」が利用されます。
   * - 直接設定
   * <span class="mp-oas-code">creditInformation.card.cardholderName</span>が利用されます。
   * - カード会員のメールアドレスまたは電話番号
   * <span class="mp-oas-code">payer</span>に設定した値が利用されます。
   * 詳細は[共通パラメーター対応表 - クレカ払い](#tag/common-parameters/クレカ払い)を参照ください。
   *
   * @param idempotencyKey 冪等キー
   * リクエスト毎にユニークな最大36桁の任意の文字列。
   * 詳細は[冪等処理](#tag/idempotence)を参照ください。
   *
   * @returns CreditChargeResponse - 3Dセキュアを利用せず、支払いが成功した場合
   * - 仕向先カード会社が3Dセキュア認証に未対応のために、認証スキップして支払いが成功した場合
   *
   * @returns CreditChargeTds2Response 3Dセキュアを利用して認証処理に進む場合のレスポンス
   * リクエストパラメーターで自動オーソリが有効になっている場合、3Dセキュア認証後にオーソリをします。
   *
   * @throws ApiError
   */
  public static creditCharge(
    requestBody: CreditChargeRequest,
    idempotencyKey?: string,
  ): CancelablePromise<CreditChargeResponse | CreditChargeTds2Response> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/credit/charge',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りなどの理由により、支払いリクエストを進められない場合のレスポンス
                エラーの原因と該当のパラメーター名は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        402: `オーソリ(信用照会)に進んだ後に、カード会社等の外部事業者から拒否された場合のレスポンス
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
   * 随時支払い
   * 登録されているカード情報を使って支払う場合に呼び出すAPIです。
   * 対応している決済手段はクレジットカード、Apple Payです。
   * ただしVISAブランドのカード番号が登録されたApple Payはご利用になれません。
   * また、VISA以外のブランドについても、将来的に利用できなくなる可能性があります。
   * <span style="color: #d41f1c">※ApplePayでは3Dセキュアおよび不正検知のご利用ができません。</span>
   * Google Payについては、アカウント情報を当サービスに保管できません。
   * 都度支払い時にGoogle Payで使用されたクレジットカード情報を保管することで、通常のクレジットカードとして随時支払いが利用可能です。
   *
   * @param requestBody カードのタイプは<span class="mp-oas-code">creditOnfileInformation.onfileCard.type</span>で設定します。
   * プロトコルタイプとは異なりカード登録連番を物理モードで設定できません。
   *
   * 3Dセキュア認証利用時には、以下のカード会員の情報を必ず設定してください。
   * 未設定でもエラーにはなりませんが、変更になる可能性があります。
   * - カード会員の名前
   * リクエストパラメーター<span class="mp-oas-code">creditOnfileInformation.onfileCard.cardholderName</span>が設定されている場合は、その値が利用されます。
   * 設定されていない場合は、登録されているカード情報の「カード名義人」が利用されます。
   * カードの登録については、[有効性確認(/credit/verifyCard)](#tag/creditcard/operation/creditVerifyCard)、[カード登録(/credit/storeCard)](#tag/creditcard/operation/creditStoreCard)を参照ください。
   * - カード会員のメールアドレスまたは電話番号
   * <span class="mp-oas-code">payer</span>に設定した値が利用されます。
   * 詳細は[共通パラメーター対応表 - クレカ払い](#tag/common-parameters/クレカ払い)を参照ください。
   *
   * @param idempotencyKey 冪等キー
   * リクエスト毎にユニークな最大36桁の任意の文字列。
   * 詳細は[冪等処理](#tag/idempotence)を参照ください。
   *
   * @returns CreditChargeResponse - 3Dセキュアを利用せず、支払いが成功した場合
   * - 仕向先カード会社が3Dセキュア認証に未対応のために、認証スキップして支払いが成功した場合
   *
   * @returns CreditChargeTds2Response 3Dセキュアを利用して認証処理に進む場合のレスポンス
   * リクエストパラメーターで自動オーソリが有効になっている場合、3Dセキュア認証後にオーソリをします。
   *
   * @throws ApiError
   */
  public static creditOnfileCharge(
    requestBody: CreditOnfileChargeRequest,
    idempotencyKey?: string,
    mode: 'contract' | 'ec' = 'ec',
  ): CancelablePromise<CreditChargeResponse | CreditChargeTds2Response> {
    return __request(getGeneralSetting(mode), {
      method: 'POST',
      url: '/credit/on-file/charge',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りなどの理由により支払いリクエストを進められない場合のレスポンス
                エラーの原因と該当のパラメーター名は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        402: `オーソリ(信用照会)に進んだ後に、カード会社等の外部事業者から拒否された場合のレスポンス
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
   * 3Dセキュア後の支払い
   * 3Dセキュアに進んだ後に最終的に支払いをするためのAPIです。
   * Chargeリクエスト時に自動オーソリなしの場合には、コールバック後にこのAPIで支払いを完了してください。
   *
   * @param requestBody 対象の取引のID
   *
   * @param idempotencyKey 冪等キー
   * リクエスト毎にユニークな最大36桁の任意の文字列。
   * 詳細は[冪等処理](#tag/idempotence)を参照ください。
   *
   * @returns Tds2FinalizeChargeResponse 3Dセキュアの認証が成功してオーソリ(信用照会)に進み、支払いが成功した場合のレスポンス
   *
   * @throws ApiError
   */
  public static tds2FinalizeCharge(
    requestBody: Tds2FinalizeChargeRequest,
    idempotencyKey?: string,
  ): CancelablePromise<Tds2FinalizeChargeResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/tds2/finalizeCharge',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りや該当取引のステータスが受付可能な状態でない等の理由により支払いリクエストを進められない場合のレスポンス
                エラーの原因は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        402: `3Dセキュアの結果、認証が成功しなかった場合のレスポンス、もしくは3Dセキュアは成功し、オーソリ(信用照会)に進んだ後に、カード会社等の外部事業者から拒否された場合のレスポンス
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
   * 有効性確認
   * カード情報の有効性確認をするためのAPIです。
   * 加えて有効性の確認が取れたカード情報を会員に紐づけて登録できます。
   * 利用可能な決済手段はクレジットカード、Google Payであり、**Apple Payは利用できません。**
   * Google Payは通常のクレジットカードとして会員に紐づけて登録します。
   *
   * @param requestBody カード情報の設定方法は以下のいずれかです。
   * 1. トークン化して設定
   * - MPクレカトークン
   * 当サービス標準のカード情報トークンです。
   * 詳細は[トークン決済v2 開発ガイド](https://static.mul-pay.jp/doc/card-token/)を参照ください。
   *
   * - Google Payトークン
   * Google Pay APIで取得したPayment tokenをbase64エンコードした値です。
   * 当サービスが提供する<span class="mp-oas-code">MpToken.js</span>を利用してトークンを取得することができます。
   * 詳細は[トークン決済v2 開発ガイド](https://static.mul-pay.jp/doc/card-token/)を参照ください。
   * Google Payに関する詳細は[デベロッパー向けドキュメント](https://developers.google.com/pay/api)を参照ください。
   *
   * 2. 登録済み情報を設定
   * 登録されているカード情報を利用します。
   * 対象の会員IDが必要です。
   *
   * 3. 直接設定
   * [PCI DSS](https://ja.wikipedia.org/wiki/PCI_DSS)の認定を得ている加盟店様のみが利用できます。
   * 本番環境で利用するためにはお申し込みが必要です。
   *
   * 3Dセキュア認証利用時には、以下のカード会員の情報を必ず設定してください。
   * 未設定でもエラーにはなりませんが、変更になる可能性があります。
   * - カード会員の名前
   * - トークン化して設定
   * MPクレカトークンの「カード名義人」が利用されます。
   * - 登録済み情報を設定
   * リクエストパラメーター<span class="mp-oas-code">creditVerificationInformation.onfileCard.cardholderName</span>が設定されている場合は、その値が利用されます。
   * 設定されていない場合は、登録されているカード情報の「カード名義人」が利用されます。
   * - 直接設定
   * <span class="mp-oas-code">creditVerificationInformation.card.cardholderName</span>が利用されます。
   * - カード会員のメールアドレスまたは電話番号
   * <span class="mp-oas-code">payer</span>に設定した値が利用されます。
   * 詳細は[共通パラメーター対応表 - クレカ払い](#tag/common-parameters/クレカ払い)を参照ください。
   *
   * 有効性確認後にカード情報を会員に紐づけて登録した場合、設定した「カード名義人」が登録されます。
   *
   * @param idempotencyKey 冪等キー
   * リクエスト毎にユニークな最大36桁の任意の文字列。
   * 詳細は[冪等処理](#tag/idempotence)を参照ください。
   *
   * @returns CreditVerifyCardResponse - 3Dセキュアを利用せず、有効性確認が成功した場合
   * - 仕向先カード会社が3Dセキュア認証に未対応のために、認証スキップした場合
   *
   * @returns CreditVerifyCardTds2Response 3Dセキュアを利用して認証処理に進む場合のレスポンス
   * リクエストパラメーターで自動オーソリが有効になっている場合、3Dセキュア認証後にオーソリをします。
   *
   * @throws ApiError
   */
  public static creditVerifyCard(
    requestBody: CreditVerifyCardRequest,
    idempotencyKey?: string,
  ): CancelablePromise<
    CreditVerifyCardResponse | CreditVerifyCardTds2Response
  > {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/credit/verifyCard',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りなどの理由により有効性確認リクエストを進められない場合のレスポンス
                エラーの原因は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        402: `オーソリ(信用照会)に進んだ後に、カード会社等の外部事業者から拒否された場合のレスポンス
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
   * 3Dセキュア後の有効性確認
   * 3Dセキュア認証に進んだ後に最終的に有効性確認とカード登録をするためのAPIです。
   * 有効性リクエスト時に自動オーソリなしの場合には、コールバック後にこのAPIで処理を完了してください。
   *
   * @param requestBody 対象の取引のID
   *
   * @param idempotencyKey 冪等キー
   * リクエスト毎にユニークな最大36桁の任意の文字列。
   * 詳細は[冪等処理](#tag/idempotence)を参照ください。
   *
   * @returns Tds2FinalizeVerificationResponse 3Dセキュアの認証が成功してオーソリ(信用照会)に進み、有効性確認が成功した場合のレスポンス
   *
   * @throws ApiError
   */
  public static tds2FinalizeVerification(
    requestBody: Tds2FinalizeVerificationRequest,
    idempotencyKey?: string,
  ): CancelablePromise<Tds2FinalizeVerificationResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/tds2/finalizeVerification',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤りや該当取引のステータスが受付可能な状態でない等の理由により有効性確認リクエストを進められない場合のレスポンス
                エラーの原因は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        402: `3Dセキュアの結果、認証が成功しなかった場合のレスポンス、もしくは3Dセキュアは成功し、オーソリ(信用照会)に進んだ後に、カード会社等の外部事業者から拒否された場合のレスポンス
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
   * カード登録
   * カード情報を会員に紐づけて登録するためのAPIです。
   * [有効性確認(/credit/verifyCard)](#tag/creditcard/operation/creditVerifyCard)とは異なり、**カード情報の有効性確認をしません**。
   * このため、トークンまたは直接設定で登録したカード情報については、随時支払いに失敗する可能性があります。
   * Apple Pay、Google Payでのカード登録もこのAPIを利用します。
   * Apple Payは「成功した取引を設定」する方法のみに対応してます。
   * Google Payは、通常のクレジットカードとして会員に紐づけて登録します。
   * <br>
   * 継続課金サービスや一括決済サービスで登録したカード情報を利用する場合は、以下にご注意ください。
   * トークンまたは直接設定で登録したカード情報は、有効性確認がされていないため、チャージバックやカード会社契約停止のリスクがあります。
   * 必ず[有効性確認(/credit/verifyCard)](#tag/creditcard/operation/creditVerifyCard)を使用してカード情報を登録してください。
   * 成功した取引情報を使って登録したカード情報は問題ありせん。
   *
   * @param requestBody カード情報の設定方法は以下のいずれかです。
   * 1. 成功した取引を設定
   * 成功した支払いや有効性確認時に返る取引ID<span class="mp-oas-code">accessId</span>を設定することで、該当の取引で利用されたカード情報を登録します。
   *
   * 2. トークン化して設定
   * - MPクレカトークン
   * 当サービス標準のカード情報トークンです。
   * 詳細は[トークン決済v2 開発ガイド](https://static.mul-pay.jp/doc/card-token/)を参照ください。
   *
   * - Google Payトークン
   * Google Pay APIで取得したPayment tokenをbase64エンコードした値です。
   * 当サービスが提供する<span class="mp-oas-code">MpToken.js</span>を利用してトークンを取得することができます。
   * 詳細は[トークン決済v2 開発ガイド](https://static.mul-pay.jp/doc/card-token/)を参照ください。
   * Google Payに関する詳細は[デベロッパー向けドキュメント](https://developers.google.com/pay/api)を参照ください。
   *
   * 3. 直接設定
   * [PCI DSS](https://ja.wikipedia.org/wiki/PCI_DSS)の認定を得ている加盟店様のみが利用できます。
   * 本番環境で利用するためにはお申し込みが必要です。
   *
   * 登録したカード情報で3Dセキュア認証をする場合、「カード名義人」を含めて登録する必要があります。
   * - 成功した取引を設定
   * 該当の取引で設定した「カード名義人」が登録されます。
   * - トークン化して設定
   * MPクレカトークンの「カード名義人」が登録されます。
   * - 直接設定
   * <span class="mp-oas-code">creditStoringInformation.card.cardholderName</span>が登録されます。
   *
   * @param idempotencyKey 冪等キー
   * リクエスト毎にユニークな最大36桁の任意の文字列。
   * 詳細は[冪等処理](#tag/idempotence)を参照ください。
   *
   * @returns CreditStoreCardReponse カードの登録が成功した場合のレスポンス
   *
   * @throws ApiError
   */
  public static creditStoreCard(
    requestBody: CreditStoreCardRequest,
    idempotencyKey?: string,
    mode: 'contract' | 'ec' = 'ec',
  ): CancelablePromise<CreditStoreCardReponse> {
    return __request(getGeneralSetting(mode), {
      method: 'POST',
      url: '/credit/storeCard',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤り等の理由によりカード登録リクエストを進められない場合のレスポンス
                エラーの原因は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
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
   * カード詳細情報取得
   * カードの詳細情報を取得するためのAPIです。
   * 「MPクレカトークン」または「会員ID＋カードID」から紐づいたカード情報を取得します。
   *
   * #### 制限事項
   * - 利用可能な決済手段はクレジットカードのみです。
   * - 本番環境で利用するためには、オプション契約が必要です。
   * プロトコルタイプ/モジュールタイプとは異なり、「会員ID＋カードID」を指定する場合でも、本APIを呼び出すショップIDに契約が必要です。
   * - テスト環境で利用する場合、事前に機能の有効化が必要です。
   * 有効化の方法は、こちらの[FAQページ](https://mp-faq.gmo-pg.com/s/article/F00127)を参照ください。
   *
   * @param requestBody カード情報の設定方法は以下のいずれかです。
   * 1. トークン化して設定
   * - MPクレカトークン
   * 当サービス標準のカード情報トークンです。
   * 本APIではトークンを利用しても無効化されず、支払いAPIで同じMPクレカトークンを設定できます。
   * 詳細は[トークン決済v2 開発ガイド](https://static.mul-pay.jp/doc/card-token/)を参照ください。
   *
   * 2. 登録済み情報を設定
   * 登録されているカード情報を利用します。
   * 対象の会員IDが必要です。
   *
   * @returns CreditGetCardDetailsResponse カード詳細情報取得が正常に返る場合のレスポンス
   *
   * @throws ApiError
   */
  public static creditGetCardDetails(
    requestBody: CreditGetCardDetailsRequest,
  ): CancelablePromise<CreditGetCardDetailsResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/credit/getCardDetails',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `パラメーターの誤り等の理由によりカード詳細情報取得リクエストを進められない場合のレスポンス
                エラーの原因は、<span class="mp-oas-code">detail</span>フィールドで確認できます。
                `,
        500: `当サービスのシステムで予期せぬエラーが発生した場合のレスポンス
                `,
        502: `カード会社等の外部事業者からシステムエラーが返る場合のレスポンス
                `,
      },
    });
  }
}
