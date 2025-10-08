/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 加盟店自由項目
 */
export type ClientFields = {
  /**
   * 加盟店自由項目1
   * この取引に関する任意情報を紐づけます。
   * 決済の情報としては利用されません。
   * またお客様には表示されません。
   * [取引照会API(/order/inquiry)](#tag/order/operation/orderInquiry)、管理画面、取引配信ファイルで値を確認できます。
   * 設定できる最大長はEUC-JPで100byteです。
   * 半角英数字、半角記号(除く<span class="mp-oas-code"> ^ ` { | } ~ & <> " ' </span> ) 、全角文字が設定可能です。
   *
   */
  clientField1?: string;
  /**
   * 加盟店自由項目2
   * 「加盟店自由項目1」の説明を参照ください。
   *
   */
  clientField2?: string;
  /**
   * 加盟店自由項目3
   * 「加盟店自由項目1」の説明を参照ください。
   *
   */
  clientField3?: string;
};
