/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 不正検知の結果情報
 */
export type FraudDetectionResult = {
  /**
   * 審査タイプ
   */
  screeningType?: FraudDetectionResult.screeningType;
  /**
   * 審査トランザクションID
   */
  screeningTransactionId?: string;
  /**
   * 審査結果コード
   */
  screeningResultCode?: string;
  /**
   * 審査結果(未加工)
   */
  screeningResultRawData?: string;
};
export namespace FraudDetectionResult {
  /**
   * 審査タイプ
   */
  export enum screeningType {
    RED_SHIELD = 'RED_SHIELD',
  }
}
