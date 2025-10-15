/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Problem = {
  /**
   * エラーの説明ページURL
   * 対応するページがある場合のみ返ります。
   *
   */
  type?: string;
  /**
   * エラーの内容サマリー
   * エラーコードとして取り扱えます。
   *
   */
  title?: string;
  /**
   * エラーの詳細説明
   * エラーメッセージとして取り扱えます。
   *
   */
  detail?: string;
  /**
   * エラーが発生したエンドポイント
   * ホスト名は含まれません。
   *
   */
  instance?: string;
};
