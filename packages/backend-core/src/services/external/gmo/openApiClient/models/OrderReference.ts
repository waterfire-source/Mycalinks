/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessId } from './AccessId';
import type { AccessPass } from './AccessPass';
import type { ClientFields } from './ClientFields';
/**
 * 取引参照情報
 */
export type OrderReference = {
  accessId?: AccessId;
  accessPass?: AccessPass;
  /**
   * リクエスト時に設定したオーダーID
   */
  orderId?: string;
  /**
   * 開始日時<br> [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6)で定義された表記
   * 例) 2023-05-30T12:34:56+09:00
   *
   */
  created?: string;
  /**
   * 最終更新日時
   * [RFC 3339, section 5.6](https://tools.ietf.org/html/rfc3339#section-5.6)で定義された表記
   * 例) 2023-05-30T12:34:56+09:00
   *
   */
  updated?: string;
  /**
   * リクエスト時に設定した税送料込の取引金額
   *
   */
  amount?: string;
  /**
   * リクエスト時に設定した加盟店自由項目
   *
   */
  clientFields?: ClientFields;
};
