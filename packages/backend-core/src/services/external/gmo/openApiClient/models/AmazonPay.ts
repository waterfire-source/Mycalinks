/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Amazon Pay V2専用パラメーター
 */
export type AmazonPay = {
  /**
   * チェックアウトセッションID
   * APBタイプ<span class="mp-oas-code">apbType</span>を設定しない場合は必須です。
   *
   */
  checkoutSessionId?: string;
  /**
   * 注文の説明
   * 注文の説明です。
   * Amazonからお客様へのメールに表示されます。
   *
   */
  noteToBuyer?: string;
  /**
   * APBタイプ
   * [APB(AdditionalPaymentButton)機能](https://www.amazonpay-faq.jp/faq/QA-66)を利用する場合のみ設定してください。
   * - <span class="mp-oas-code">PayOnly</span>: デジタル商品など住所情報を使用しない場合
   * - <span class="mp-oas-code">PayAndShip</span>: 物販など住所情報を使用する場合
   * <span class="mp-oas-code">PayAndShip</span>の場合、以下パラメーターは必須です。
   * 住所の宛名<span class="mp-oas-code">order.shippingAddress.name</span>
   * 住所の町域・丁目番地<span class="mp-oas-code">order.shippingAddress.line1</span>
   * 住所の市区町村<span class="mp-oas-code">order.shippingAddress.city</span>
   * 住所の都道府県番号<span class="mp-oas-code">order.shippingAddress.state</span>
   * 住所の郵便番号<span class="mp-oas-code">order.shippingAddress.postCode</span>
   * 住所の国番号<span class="mp-oas-code">order.shippingAddress.country</span>
   * 電話番号<span class="mp-oas-code">payer.phones.number</span>(1件目が使用されます)
   *
   */
  apbType?: string;
};
