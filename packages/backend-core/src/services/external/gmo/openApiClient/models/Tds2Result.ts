/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 3Dセキュア結果情報
 */
export type Tds2Result = {
  /**
   * ECI値
   *
   */
  eci?: string;
  /**
   * 認証チャレンジ必須
   * 3Dセキュア認証をチャレンジ必須化で処理をしたかを表します。
   *
   */
  requiresChallenge?: boolean;
  /**
   * 認証結果
   * - <span class="mp-oas-code">Y</span>：認証／口座確認に成功
   * - <span class="mp-oas-code">A</span>：処理の試行が実施された
   * - <span class="mp-oas-code">C</span>：認証チャレンジが必要
   * - <span class="mp-oas-code">N</span>：未認証／口座未確認 取引拒否
   * - <span class="mp-oas-code">U</span>：認証／口座確認を実行できなかった
   * - <span class="mp-oas-code">R</span>：認証／口座確認が拒否された
   *
   */
  tds2TransResult?: Tds2Result.tds2TransResult;
  /**
   * 認証結果理由<br>01:カード認証に失敗した<br>02:不明なデバイス<br>03:サポートされていないデバイス<br>04:認証頻度の上限を超えた<br>05:有効期限切れのカード<br>06:無効なカード番号<br>07:無効な取引<br>08:カードのレコードが存在しない<br>09:セキュリティ障害<br>10:盗難カード<br>11:不正の疑い<br>12:カード会員に取引が許可されていない<br>13:カード会員がサービスに登録されていない<br>14:取引がACSでタイムアウトした<br>15:信頼度が低い<br>16:信頼度が中程度<br>17:信頼度が高い<br>18:信頼度が非常に高い<br>19:ACSの最大チャレンジを超える<br>20:非決済取引はサポートされていません<br>21:3RIトランザクションはサポートされていません
   */
  tds2TransResultReason?: string;
};
export namespace Tds2Result {
  /**
   * 認証結果
   * - <span class="mp-oas-code">Y</span>：認証／口座確認に成功
   * - <span class="mp-oas-code">A</span>：処理の試行が実施された
   * - <span class="mp-oas-code">C</span>：認証チャレンジが必要
   * - <span class="mp-oas-code">N</span>：未認証／口座未確認 取引拒否
   * - <span class="mp-oas-code">U</span>：認証／口座確認を実行できなかった
   * - <span class="mp-oas-code">R</span>：認証／口座確認が拒否された
   *
   */
  export enum tds2TransResult {
    Y = 'Y',
    A = 'A',
    C = 'C',
    N = 'N',
    U = 'U',
    R = 'R',
  }
}
