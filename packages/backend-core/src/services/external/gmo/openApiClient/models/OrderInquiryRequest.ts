/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessId } from './AccessId';
import type { AdditionalOptions } from './AdditionalOptions';
import type { OrderId } from './OrderId';
/**
 * /order/inquiry request body
 */
export type OrderInquiryRequest = {
  /**
   * 取引リクエスト時に返る取引ID
   * オーダーIDを省略する場合、取引IDは必ず設定してください。
   * 取引IDとオーダーIDを設定した場合、組み合わせが一致する取引情報が返ります。
   *
   */
  accessId?: AccessId;
  /**
   * 取引リクエスト時に設定した任意のオーダーID
   * 取引IDを省略する場合、オーダーIDは必ず設定してください。
   * 取引IDとオーダーIDを設定した場合、組み合わせが一致する取引情報が返ります。
   *
   */
  orderId?: OrderId;
  additionalOptions?: AdditionalOptions;
};
