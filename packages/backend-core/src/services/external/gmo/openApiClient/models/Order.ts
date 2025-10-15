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
 * 決済手段ごとの設定要否や各パラメーターの用途は、詳細は[共通パラメーター対応表](#tag/common-parameters)を参照ください。
 *
 */
export type Order = {
  /**
   * この取引に対する任意のオーダーID
   * 加盟店様にてユニークな値を発行してください。
   *
   */
  orderId: OrderId;
  /**
   * 税送料込の取引金額
   * 決済手段により設定可能な値が異なります。
   *
   */
  amount: string;
  /**
   * 通貨コード
   * ISO 4217のアルファベット3文字を設定します。
   * 例えば日本円の場合<span class="mp-oas-code">JPY</span>です。
   * 省略時は<span class="mp-oas-code">JPY</span>です。
   * <span style="color: #d41f1c"> ※現時点では<span class="mp-oas-code">JPY</span>のみ利用可能です。</span>
   *
   */
  currency?: string;
  clientFields?: ClientFields;
  /**
   * 商品情報の一覧
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
