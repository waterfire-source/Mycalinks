/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * エラー情報<br>最後に行った操作においてエラーが発生している場合のみ設定されます。<br>詳細は[エラーの情報](#tag/errors)を参照ください。
 */
export type ErrorInformation = {
  /**
   * エラー内容のサマリー
   */
  title?: string;
  /**
   * エラーの詳細説明
   */
  detail?: string;
};
