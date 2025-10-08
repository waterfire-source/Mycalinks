/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 3Dセキュアオプション情報
 */
export type Tds2Options = {
  /**
   * 未対応時の認証スキップ
   * 仕向先カード会社が3Dセキュア認証に未対応の場合、エラーにするか、認証をスキップしてオーソリ(信用照会)するかを選択します。
   * - <span class="mp-oas-code">false</span>: リクエストはエラーになります。
   * - <span class="mp-oas-code">true</span>: 3Dセキュア認証をスキップしてオーソリ(信用照会)します。この取引が不正利用によりチャージバックとなった場合、加盟店様が支払いの責任を負う可能性があります。
   *
   */
  skipNotEnrolledCard?: boolean;
  /**
   * 認証結果Attempt時の挙動
   * 3Dセキュア認証の結果、カード会社からECI 06(Mastercard以外)または01(Mastercard)が返る場合の処理を選択します。
   * ECI06/01は、カード発行会社が3Dセキュアに対応していない場合やサーバー障害などの場合に、認証プロセス自体はできていませんが認証成功と扱うことを意味します。
   * 通常、この取引が不正利用によりチャージバックとなった場合、支払いの責任はカード発行会社となり加盟店様には請求されません。
   * それでもECI06/01の支払いを受け付けたくない場合は、<span class="mp-oas-code">NOT_ALLOW</span>を設定してください。
   * <span class="mp-oas-code">FOLLOW</span>を設定した場合、3Dセキュア必須化の契約に従います。
   * <span class="mp-oas-code">NOT_ALLOW</span>を設定すると3Dセキュア認証を利用しない取引はエラーになるため、<span class="mp-oas-code">useTds2</span>を<span class="mp-oas-code">false</span>にする場合、<span class="mp-oas-code">NOT_ALLOW</span>を設定しないでください。
   * ショップ契約の「3Dセキュア必須化」の詳細については、[クレジットカード決済 概要（マルペイDocs）](https://docs.mul-pay.jp/payment/credit/overview)<sup>※</sup>の注意事項を参照ください。
   * <small>※マルペイDocsの利用方法は[こちら](https://mp-faq.gmo-pg.com/s/article/F00579)</small>
   * - <span class="mp-oas-code">FOLLOW</span>：ショップ契約の「3Dセキュア必須化」の内容に従う
   * - <span class="mp-oas-code">ALLOW</span>：認証成功と扱う
   * - <span class="mp-oas-code">NOT_ALLOW</span>：認証失敗と扱う
   *
   */
  allowAttempt?: Tds2Options.allowAttempt;
  /**
   * 認証チャレンジ必須
   * リスク判定の結果によらず3Dセキュア認証チャレンジを要求する場合に<span class="mp-oas-code">true</span>を設定します。
   * ただし、カード発行会社が対応していない場合があります。
   *
   */
  requiresChallenge?: boolean;
  /**
   * 自動オーソリ有無
   * 3Dセキュア認証後に自動でオーソリ(信用照会)をせずに、加盟店様から明示的に3Dセキュア後APIを呼び出してオーソリを実施したい場合には<span class="mp-oas-code">false</span>を設定します。
   * 「自動オーソリあり」の場合、オーソリが実行されてもお客様がブラウザを閉じる、通信エラーが発生するなどして処理が中断し、貴社にコールバックがされず状態不整合になる可能性があります。
   * 「自動オーソリなし」は、オーソリのリクエストを加盟店様にて制御できるため上記のリスクを低減できます。
   *
   */
  autoAuthorization?: boolean;
};
export namespace Tds2Options {
  /**
   * 認証結果Attempt時の挙動
   * 3Dセキュア認証の結果、カード会社からECI 06(Mastercard以外)または01(Mastercard)が返る場合の処理を選択します。
   * ECI06/01は、カード発行会社が3Dセキュアに対応していない場合やサーバー障害などの場合に、認証プロセス自体はできていませんが認証成功と扱うことを意味します。
   * 通常、この取引が不正利用によりチャージバックとなった場合、支払いの責任はカード発行会社となり加盟店様には請求されません。
   * それでもECI06/01の支払いを受け付けたくない場合は、<span class="mp-oas-code">NOT_ALLOW</span>を設定してください。
   * <span class="mp-oas-code">FOLLOW</span>を設定した場合、3Dセキュア必須化の契約に従います。
   * <span class="mp-oas-code">NOT_ALLOW</span>を設定すると3Dセキュア認証を利用しない取引はエラーになるため、<span class="mp-oas-code">useTds2</span>を<span class="mp-oas-code">false</span>にする場合、<span class="mp-oas-code">NOT_ALLOW</span>を設定しないでください。
   * ショップ契約の「3Dセキュア必須化」の詳細については、[クレジットカード決済 概要（マルペイDocs）](https://docs.mul-pay.jp/payment/credit/overview)<sup>※</sup>の注意事項を参照ください。
   * <small>※マルペイDocsの利用方法は[こちら](https://mp-faq.gmo-pg.com/s/article/F00579)</small>
   * - <span class="mp-oas-code">FOLLOW</span>：ショップ契約の「3Dセキュア必須化」の内容に従う
   * - <span class="mp-oas-code">ALLOW</span>：認証成功と扱う
   * - <span class="mp-oas-code">NOT_ALLOW</span>：認証失敗と扱う
   *
   */
  export enum allowAttempt {
    FOLLOW = 'FOLLOW',
    ALLOW = 'ALLOW',
    NOT_ALLOW = 'NOT_ALLOW',
  }
}
