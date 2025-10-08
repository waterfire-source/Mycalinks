/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ItemCode } from './ItemCode';
/**
 * クレカ払いオプション情報
 */
export type CreditChargeOptions = {
  /**
   * 支払い要求のタイプ
   * - <span class="mp-oas-code">AUTH</span>：仮売上
   * - <span class="mp-oas-code">CAPTURE</span>：即時売上
   *
   */
  authorizationMode: CreditChargeOptions.authorizationMode;
  /**
   * 3Dセキュア認証の利用有無
   * - <span class="mp-oas-code">true</span>: 3Dセキュア認証を利用します。
   * - <span class="mp-oas-code">false</span>: 3Dセキュア認証を利用しません。この取引が不正利用によりチャージバックとなった場合、加盟店様が支払いの責任を負う可能性があります。
   * Apple Payは利用できません。
   *
   */
  useTds2?: boolean;
  /**
   * 不正検知の利用有無
   * Apple Payは利用できません。
   *
   */
  useFraudDetection?: boolean;
  itemCode?: ItemCode;
  /**
   * 支払方法
   * Apple Payは一括払い固定になります。
   * - <span class="mp-oas-code">ONE_TIME</span>：一括
   * - <span class="mp-oas-code">INSTALLMENT</span>：分割
   * - <span class="mp-oas-code">BONUS_ONE_TIME</span>：ボーナス一括
   * - <span class="mp-oas-code">REVOLVING</span>：リボ
   *
   */
  paymentMethod?: CreditChargeOptions.paymentMethod;
  /**
   * 分割回数
   * 支払方法が分割の場合に設定します。
   * 設定可能な分割回数は契約により異なります。
   *
   */
  installments?: string;
};
export namespace CreditChargeOptions {
  /**
   * 支払い要求のタイプ
   * - <span class="mp-oas-code">AUTH</span>：仮売上
   * - <span class="mp-oas-code">CAPTURE</span>：即時売上
   *
   */
  export enum authorizationMode {
    AUTH = 'AUTH',
    CAPTURE = 'CAPTURE',
  }
  /**
   * 支払方法
   * Apple Payは一括払い固定になります。
   * - <span class="mp-oas-code">ONE_TIME</span>：一括
   * - <span class="mp-oas-code">INSTALLMENT</span>：分割
   * - <span class="mp-oas-code">BONUS_ONE_TIME</span>：ボーナス一括
   * - <span class="mp-oas-code">REVOLVING</span>：リボ
   *
   */
  export enum paymentMethod {
    ONE_TIME = 'ONE_TIME',
    INSTALLMENT = 'INSTALLMENT',
    BONUS_ONE_TIME = 'BONUS_ONE_TIME',
    REVOLVING = 'REVOLVING',
  }
}
