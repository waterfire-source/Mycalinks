/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 電話情報
 */
export type Phone = {
  /**
   * 電話のタイプ
   * 携帯、家、職場、その他から選択します。
   * - <span class="mp-oas-code">MOBILE</span>：携帯電話
   * - <span class="mp-oas-code">HOME</span>：固定電話
   * - <span class="mp-oas-code">WORK</span>：勤務先
   * - <span class="mp-oas-code">OTHER</span>：その他
   *
   * #### 決済手段ごとの制限事項
   * - クレジットカード（3Dセキュア認証利用時のみ）: <span style="color: #d41f1c;font-family:Courier,monospace;font-size: 0.9em">required</span>、<span class="mp-oas-code">OTHER</span>以外
   *
   */
  type?: Phone.type;
  /**
   * 電話の国コード
   * ITU-E.164の1～3桁の数字を設定します。
   * ISO3166-1ではないのでご注意ください。
   * プラス記号(+)はつけないでください。
   * 例として日本の場合は「81」です。
   * #### 決済手段ごとの制限事項
   * - クレジットカード（3Dセキュア認証利用時のみ）: <span style="color: #d41f1c;font-family:Courier,monospace;font-size: 0.9em">required</span>
   *
   */
  countryCode?: string;
  /**
   * 電話番号
   * ハイフンの有無は問いません。
   * #### 決済手段ごとの制限事項
   * - クレジットカード（3Dセキュア認証利用時のみ）: <span style="color: #d41f1c;font-family:Courier,monospace;font-size: 0.9em">required</span>
   * - コンビニ: <span style="color: #d41f1c;font-family:Courier,monospace;font-size: 0.9em">required</span>
   * - Pay-easy: <span style="color: #d41f1c;font-family:Courier,monospace;font-size: 0.9em">required</span>
   *
   */
  number?: string;
};
export namespace Phone {
  /**
   * 電話のタイプ
   * 携帯、家、職場、その他から選択します。
   * - <span class="mp-oas-code">MOBILE</span>：携帯電話
   * - <span class="mp-oas-code">HOME</span>：固定電話
   * - <span class="mp-oas-code">WORK</span>：勤務先
   * - <span class="mp-oas-code">OTHER</span>：その他
   *
   * #### 決済手段ごとの制限事項
   * - クレジットカード（3Dセキュア認証利用時のみ）: <span style="color: #d41f1c;font-family:Courier,monospace;font-size: 0.9em">required</span>、<span class="mp-oas-code">OTHER</span>以外
   *
   */
  export enum type {
    MOBILE = 'MOBILE',
    HOME = 'HOME',
    WORK = 'WORK',
    OTHER = 'OTHER',
  }
}
