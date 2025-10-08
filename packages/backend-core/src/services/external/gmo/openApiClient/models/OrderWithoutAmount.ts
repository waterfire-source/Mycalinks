/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Address } from './Address';
import type { ClientFields } from './ClientFields';
import type { Item } from './Item';
import type { OrderId } from './OrderId';
import type { TransactionType } from './TransactionType';
/**
 * 取引情報
 */
export type OrderWithoutAmount = {
  /**
   * この取引に対する任意のオーダーID
   * 加盟店様にてユニークな値を発行してください。
   *
   */
  orderId: OrderId;
  clientFields?: ClientFields;
  /**
   * 商品情報の一覧
   * #### 決済手段ごとの制限事項
   * - 楽天ペイ(オンライン決済)V2 利用承諾: <span style="color: #d41f1c;font-family:Courier,monospace;font-size: 0.9em">required</span>
   *
   */
  items?: Array<Item>;
  transactionType: TransactionType;
  /**
   * 配送先住所情報
   */
  shippingAddress?: Address;
  /**
   * 配送先住所と請求先住所が同じ場合は<span class="mp-oas-code">true</span>を設定します。
   * 住所はいずれかのみ設定してください。
   *
   */
  addressMatch?: boolean;
  /**
   * 請求先住所情報
   */
  billingAddress?: Address;
};
