/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 不正検知オプション情報
 */
export type FraudDetectionOptions = {
  /**
   * 審査タイプ
   */
  screeningType: FraudDetectionOptions.screeningType;
  /**
   * オーソリ中断閾値
   * 当パラメーターを設定した場合はオーソリ(信用照会)前に不正審査を実施し、審査結果が設定した閾値以上である場合はオーソリ(信用照会)を中断します。
   * 例) <span class="mp-oas-code">CHALLENGE</span>を設定した場合、審査結果が<span class="mp-oas-code">CHALLENGE</span>または<span class="mp-oas-code">DENY</span>の際はオーソリを中断します。
   *
   */
  stopAuthorizationThreshold?: string;
  /**
   * 非同期モード
   * <span class="mp-oas-code">true</span>を設定した場合は不正審査を非同期で実行します。
   * この際レスポンスに審査結果は含まれませんので、任意のタイミングで[取引照会API(/order/inquiry)](#tag/order/operation/orderInquiry)を実行し取得してください。
   *
   */
  asyncMode?: boolean;
};
export namespace FraudDetectionOptions {
  /**
   * 審査タイプ
   */
  export enum screeningType {
    RED_SHIELD = 'RED_SHIELD',
  }
}
