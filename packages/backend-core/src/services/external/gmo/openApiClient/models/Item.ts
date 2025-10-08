/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 商品情報
 *
 */
export type Item = {
  /**
   * 商品の名称
   * 設定できる最大長はUTF-8で192byteです。
   *
   */
  name: string;
  /**
   * 商品の説明
   * 設定できる最大長はUTF-8で180byteです。
   * #### 決済手段ごとの制限事項
   * - メルペイ（利用承諾のみ）: <span style="color: #d41f1c;font-family:Courier,monospace;font-size: 0.9em">required</span>
   *
   */
  description?: string;
  /**
   * 商品の購入数
   */
  quantity: number;
  /**
   * 商品のタイプ
   * - <span class="mp-oas-code">DIGITAL</span>：デジコン
   * - <span class="mp-oas-code">PHYSICAL</span>：物販
   * - <span class="mp-oas-code">SERVICE</span>：役務
   *
   */
  type: Item.type;
  /**
   * 商品の単価
   * <span class="mp-oas-code">order.amount</span>以下の値を設定してください。
   * #### 決済手段ごとの制限事項
   * - クレジットカード(ReD Shield利用時): <span class="mp-oas-code"><= 12 characters</span>
   * - メルペイ: <span class="mp-oas-code"><= 7 characters</span>
   *
   */
  price: string;
  /**
   * 商品の[Merchant category code(MCC)](https://en.wikipedia.org/wiki/Merchant_category_code)
   * MCCは[ISO 18245](https://www.iso.org/standard/33365.html)で定められた加盟店様の業種カテゴリです。
   * 一般的には加盟店様の業種カテゴリと商品のカテゴリは同じですが、この商品により適したものがあれば個別に設定できます。
   * #### 決済手段ごとの制限事項
   * - メルペイ: <span style="color: #d41f1c;font-family:Courier,monospace;font-size: 0.9em">required</span>
   *
   */
  category?: string;
  /**
   * 商品の識別番号
   * 加盟店様が商品ごとに一意に採番した番号です。
   * 半角のみ設定可能です。
   * #### 決済手段ごとの制限事項
   * - クレジットカード(ReD Shield利用時): <span class="mp-oas-code"><= 18 characters</span>
   *
   */
  productId?: string;
  /**
   * 商品の識別コード
   * [JANコード](https://www.gs1jp.org/code/jan/about_jan.html)や[UPCコード](https://www.gs1jp.org/code/upc/)を設定します。
   * 半角のみ設定可能です。
   *
   */
  productCode?: string;
};
export namespace Item {
  /**
   * 商品のタイプ
   * - <span class="mp-oas-code">DIGITAL</span>：デジコン
   * - <span class="mp-oas-code">PHYSICAL</span>：物販
   * - <span class="mp-oas-code">SERVICE</span>：役務
   *
   */
  export enum type {
    DIGITAL = 'DIGITAL',
    PHYSICAL = 'PHYSICAL',
    SERVICE = 'SERVICE',
  }
}
