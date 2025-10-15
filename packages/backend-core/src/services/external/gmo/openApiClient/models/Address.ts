/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 住所情報
 */
export type Address = {
  /**
   * 住所の宛名
   * 設定できる最大長はUTF-8で60byteです。
   *
   */
  name: string;
  /**
   * 配送先住所1
   * 設定できる最大長はUTF-8で75byteです。
   *
   */
  line1: string;
  /**
   * 配送先住所2
   * 設定できる最大長はUTF-8で75byteです。
   *
   */
  line2?: string;
  /**
   * 配送先住所3
   * 設定できる最大長はUTF-8で75byteです。
   *
   */
  line3?: string;
  /**
   * 住所の市区町村
   * 「渋谷区」「横浜市」などの市区町村名です。
   * 日本語・漢字でなくても構いません。
   * 設定できる最大長はUTF-8で75byteです。
   *
   */
  city: string;
  /**
   * 住所の都道府県番号
   * [都道府県コード表](https://nlftp.mlit.go.jp/ksj/gml/codelist/PrefCd.html)を参照ください。
   * 日本の場合は「001」から「047」からなる先頭ゼロ埋め3桁の形式です。
   *
   */
  state: string;
  /**
   * 住所の郵便番号<br>ハイフンの有無は問いません。
   * #### 決済手段ごとの制限事項
   * - クレジットカード ReD Shield: <span class="mp-oas-code"><= 9 characters</span>
   *
   */
  postCode: string;
  /**
   * 住所の国番号<br>ISO3166-1の数字3桁を設定します。
   * ITU-E.164ではないのでご注意ください。例えば日本の場合「392」です。
   *
   */
  country?: string;
};
