/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { mulpay_2 } from './mulpay_2';
/**
 * 現金払いオプション情報
 */
export type CashOptions = {
  konbiniCode?: mulpay_2;
  /**
   * 支払い期間(日)
   * お客様がお支払いできる期間を日数で設定します。
   * プロトコルタイプ/モジュールタイプにおける<span class="mp-oas-code">PaymentTermDay</span>(支払期限日数)や<span class="mp-oas-code">TradeDays</span>(取引有効日数)パラメーターと同じであり、設定値は変更せずに移行できます。
   * 期間最終日の23時59分59秒までお支払いが可能です。
   * 例) 2024年1月1日12時に支払い期限日<span class="mp-oas-code">10</span>の場合、支払い期限は2024年1月11日23時59分59秒です。
   * 日時形式で設定する場合は、支払い期限日時<span class="mp-oas-code">paymentExpiryDateTime</span>パラメーターをご利用ください。
   * 支払い期間(日)<span class="mp-oas-code">paymentPeriod</span>と支払い期限日時<span class="mp-oas-code">paymentExpiryDateTime</span>の両方を設定すると、支払い期限日時<span class="mp-oas-code">paymentExpiryDateTime</span>が優先されます。
   * <br>
   * 現金払いタイプ <span class="mp-oas-code">cashType</span>、支払先コンビニコード <span class="mp-oas-code">konbiniCode</span>により設定可能な値が異なります。
   *
   * <table>
   * <thead>
   * <tr>
   * <th>現金払いタイプ<br><span class="mp-oas-code">cashType</span></th>
   * <th>支払先<br>コンビニコード<br><span class="mp-oas-code">konbiniCode</span></th>
   * <th style="text-align: center;">最小</th>
   * <th style="text-align: center;">最大</th>
   * <th style="text-align: center;"><span class="mp-oas-code">999</span>設定時</th>
   * <th>省略時</th>
   * </tr>
   * </thead>
   * <tbody>
   * <tr>
   * <td rowspan="5">コンビニ<br><span class="mp-oas-code">KONBINI</span></td>
   * <td>セブン-イレブン<br><span class="mp-oas-code">SEVEN_ELEVEN</span></td>
   * <td style="text-align: center;">0<br>(当日)</td>
   * <td style="text-align: center;">150</td>
   * <td style="text-align: center;">150</td>
   * <td><small>デフォルト値<sup>*1</sup></small></td>
   * </tr>
   * <tr>
   * <td>ローソン<br><span class="mp-oas-code">LAWSON</span></td>
   * <td style="text-align: center;">0<br>(当日)</td>
   * <td style="text-align: center;">180</td>
   * <td style="text-align: center;">180</td>
   * <td><small>デフォルト値<sup>*1</sup></small></td>
   * </tr>
   * <tr>
   * <td>ファミリーマート<br><span class="mp-oas-code">FAMILYMART</span></td>
   * <td style="text-align: center;">0<br>(当日)</td>
   * <td style="text-align: center;">60</td>
   * <td style="text-align: center;">60</td>
   * <td><small>デフォルト値<sup>*1</sup></small></td>
   * </tr>
   * <tr>
   * <td>ミニストップ<br><span class="mp-oas-code">MINISTOP</span></td>
   * <td style="text-align: center;">0<br>(当日)</td>
   * <td style="text-align: center;">180</td>
   * <td style="text-align: center;">180</td>
   * <td><small>デフォルト値<sup>*1</sup></small></td>
   * </tr>
   * <tr>
   * <td>セイコーマート<br><span class="mp-oas-code">SEICOMART</span></td>
   * <td style="text-align: center;">0<br>(当日)</td>
   * <td style="text-align: center;">180</td>
   * <td style="text-align: center;">180</td>
   * <td><small>デフォルト値<sup>*1</sup></small></td>
   * </tr>
   * <tr>
   * <td colspan="2">Pay-easy<br><span class="mp-oas-code">PAYEASY</span></td>
   * <td style="text-align: center;">0<br>(当日)</td>
   * <td style="text-align: center;">60</td>
   * <td style="text-align: center;">エラー</td>
   * <td><small>デフォルト値<sup>*1</sup></small></td>
   * </tr>
   * <tr>
   * <td colspan="2">銀行振込(バーチャル口座)<br><span class="mp-oas-code">BANK_TRANSFER_SMBC</span></td>
   * <td style="text-align: center;">0<br>(当日)</td>
   * <td style="text-align: center;">99</td>
   * <td style="text-align: center;">エラー</td>
   * <td>省略不可</td>
   * </tr>
   * <tr>
   * <td colspan="2">銀行振込(バーチャル口座あおぞら)<br><span class="mp-oas-code">BANK_TRANSFER_GMO_AOZORA</span></td>
   * <td style="text-align: center;">0<br>(当日)</td>
   * <td style="text-align: center;">999</td>
   * <td style="text-align: center;">999</td>
   * <td>支払い期限なし</td>
   * </tr>
   * </tbody>
   * </table>
   *
   * *1：デフォルト値は管理画面から設定します。変更の方法はこちらの[FAQページ](https://mp-faq.gmo-pg.com/s/article/D00103)を参照ください。
   *
   */
  paymentPeriod?: string;
  /**
   * 支払い期限日時
   * お客様が支払いできる期限を日時(YYYYMMDDHHMM)形式で設定します。
   * <br>
   * 現金払いタイプ <span class="mp-oas-code">cashType</span>、支払先コンビニコード <span class="mp-oas-code">konbiniCode</span>により設定可能な値が異なります。
   *
   * <table>
   * <thead>
   * <tr>
   * <th>現金払いタイプ<br> <span class="mp-oas-code">cashType</span> </th>
   * <th>支払先<br>コンビニコード<br><span class="mp-oas-code">konbiniCode</span></th>
   * <th style="text-align: center;">利用</th>
   * <th>最大</th>
   * <th>注意事項</th>
   * </tr>
   * </thead>
   * <tbody>
   * <tr>
   * <td rowspan="5">コンビニ<br><span class="mp-oas-code">KONBINI</span></td>
   * <td>セブン-イレブン<br><span class="mp-oas-code">SEVEN_ELEVEN</span></td>
   * <td style="text-align: center;">×</td>
   * <td style="text-align: center;">-</td>
   * <td>設定するとエラー</td>
   * </tr>
   * <tr>
   * <td>ローソン<br><span class="mp-oas-code">LAWSON</span></td>
   * <td style="text-align: center;">〇</td>
   * <td>181日後の0時0分</td>
   * <td></td>
   * </tr>
   * <tr>
   * <td>ファミリーマート<br><span class="mp-oas-code">FAMILYMART</span></td>
   * <td style="text-align: center;">〇</td>
   * <td>61日後の0時0分</td>
   * <td></td>
   * </tr>
   * <tr>
   * <td>ミニストップ<br><span class="mp-oas-code">MINISTOP</span></td>
   * <td style="text-align: center;">〇</td>
   * <td>181日後の0時0分</td>
   * <td></td>
   * </tr>
   * <tr>
   * <td>セイコーマート<br><span class="mp-oas-code">SEICOMART</span></td>
   * <td style="text-align: center;">〇</td>
   * <td>181日後の0時0分</td>
   * <td>時分に<span class="mp-oas-code">0001</span>は<br>設定不可</td>
   * </tr>
   * <tr>
   * <td colspan="2">Pay-easy<br><span class="mp-oas-code">PAYEASY</span></td>
   * <td style="text-align: center;">〇</td>
   * <td>61日後の0時0分</td>
   * <td></td>
   * </tr>
   * <tr>
   * <td colspan="2">銀行振込(バーチャル口座)<br><span class="mp-oas-code">BANK_TRANSFER_SMBC</span></td>
   * <td style="text-align: center;">×</td>
   * <td style="text-align: center;">-</td>
   * <td>設定するとエラー</td>
   * </tr>
   * <tr>
   * <td colspan="2">銀行振込(バーチャル口座あおぞら)<br><span class="mp-oas-code">BANK_TRANSFER_GMO_AOZORA</span></td>
   * <td style="text-align: center;">×</td>
   * <td style="text-align: center;">-</td>
   * <td>設定するとエラー</td>
   * </tr>
   * </tbody>
   * </table>
   */
  paymentExpiryDateTime?: string;
};
