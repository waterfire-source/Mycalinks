/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 3Dセキュアデータ情報
 */
export type Tds2Data = {
  /**
   * カード会員情報の最終更新日
   * YYYYMMDD形式
   *
   */
  chAccChange?: string;
  /**
   * カード会員の作成日
   * YYYYMMDD形式
   *
   */
  chAccDate?: string;
  /**
   * カード会員のパスワード変更日
   * YYYYMMDD形式
   *
   */
  chAccPwChange?: string;
  /**
   * 過去6ヶ月間にこのカード会員が購入した回数
   *
   */
  nbPurchaseAccount?: number;
  /**
   * カード登録日
   * カード会員にカード情報が登録された日付を設定します。
   * YYYYMMDD形式
   *
   */
  paymentAccAge?: string;
  /**
   * 過去24時間に行われたカード情報追加の試行回数
   *
   */
  provisionAttemptsDay?: number;
  /**
   * 配送先住所の初回使用日
   * 取引で使用される配送先住所が加盟店様で最初に使用された日付を設定します。
   * YYYYMMDD形式
   *
   */
  shipAddressUsage?: string;
  /**
   * カード会員名と配送先名の一致/不一致
   * カード会員の会員名と取引に使用される配送先名の一致/不一致を設定します。
   * - <span class="mp-oas-code">01</span>: カード会員名と配送先名が一致
   * - <span class="mp-oas-code">02</span>: カード会員名と配送先名が不一致
   *
   */
  shipNameInd?: string;
  /**
   * カード会員の不審行為情報
   * カード会員で、不審な行動(過去の不正行為を含む)を加盟店様が発見したかどうかを設定します。
   * - <span class="mp-oas-code">01</span>: 不審な行動は見られなかった
   * - <span class="mp-oas-code">02</span>: 不審な行動が見られた
   *
   */
  suspiciousAccActivity?: string;
  /**
   * 過去24時間の取引回数
   * 過去24時間に行われた、カード会員と加盟店様との取引の回数を設定します。
   *
   */
  txnActivityDay?: number;
  /**
   * 前年の取引回数
   * 前年に行われた、カード会員と加盟店様との取引の回数を設定します。
   *
   */
  txnActivityYear?: number;
  /**
   * ログイン証跡
   * カード会員が特定の方法でログインしたことを裏付けるデータを設定します。
   * 設定できる最大長はUTF-8で2048byteです。
   *
   */
  threeDSReqAuthData?: string;
  /**
   * ログイン方法
   * カード会員の加盟店様システムへのログイン方法を設定します。
   * - <span class="mp-oas-code">01</span>: 認証なし(ゲストとしてログイン)
   * - <span class="mp-oas-code">02</span>: 加盟店様自身の認証情報
   * - <span class="mp-oas-code">03</span>: SSO(シングルサインオン)
   * - <span class="mp-oas-code">04</span>: イシュアーの認証情報
   * - <span class="mp-oas-code">05</span>: サードパーティ認証
   * - <span class="mp-oas-code">06</span>: FIDO認証
   *
   */
  threeDSReqAuthMethod?: string;
  /**
   * ログイン日時
   * カード会員のログイン日時を設定します。
   * YYYYMMDDHHMM形式
   *
   */
  threeDSReqAuthTimestamp?: string;
  /**
   * 商品納品時間枠
   * - <span class="mp-oas-code">01</span>: 電子デリバリー
   * - <span class="mp-oas-code">02</span>: 当日出荷
   * - <span class="mp-oas-code">03</span>: 翌日出荷
   * - <span class="mp-oas-code">04</span>: 2日目以降の出荷
   *
   */
  deliveryTimeframe?: string;
  /**
   * プリペイドカードまたはギフトカードを購入の場合、総購入金額の値を設定します。
   *
   */
  giftCardAmount?: number;
  /**
   * プリペイドカードまたはギフトカードを購入の場合、購入された総数を設定します。
   *
   */
  giftCardCount?: number;
  /**
   * 購入されたプリペイドカードまたはギフトカードの通貨コード
   * プリペイドカードまたはギフトカードを購入の場合、カードの通貨を表す、ISO 4217で定義されている通貨コードを設定します。
   * ※以下のコードは対象外です。
   * 955, 956, 957, 958, 959, 960, 961, 962, 963, 964, 999
   *
   */
  giftCardCurr?: string;
  /**
   * 商品の発売予定日
   * 先行予約購入の場合は、商品の発売予定日を設定します。
   * YYYYMMDD形式
   *
   */
  preOrderDate?: string;
  /**
   * 商品の販売時期情報
   * 先行予約購入か、発売済み商品の購入かを設定します。
   * - <span class="mp-oas-code">01</span>: 発売済み商品
   * - <span class="mp-oas-code">02</span>: 先行予約商品
   *
   */
  preOrderPurchaseInd?: string;
  /**
   * 商品の注文情報
   * カード会員が以前購入した商品を再び注文しているかどうかを設定します。
   * - <span class="mp-oas-code">01</span>: 初回注文
   * - <span class="mp-oas-code">02</span>: 再注文
   *
   */
  reorderItemsInd?: string;
  /**
   * 取引の配送方法
   * - <span class="mp-oas-code">01</span>: カード会員の請求先住所に配送する
   * - <span class="mp-oas-code">02</span>: 加盟店様が保持している別の、確認済み住所に配送する
   * - <span class="mp-oas-code">03</span>: カード会員の請求先住所と異なる住所に配送する
   * - <span class="mp-oas-code">04</span>: 店舗へ配送 / 近所の店舗での受け取り(店舗の住所は配送先住所で設定する)
   * - <span class="mp-oas-code">05</span>: デジタル商品(オンラインサービス、電子ギフトカードおよび償還コードを含む)
   * - <span class="mp-oas-code">06</span>: 配送なし(旅行およびイベントのチケット)
   * - <span class="mp-oas-code">07</span>: その他(ゲーム、配送されないデジタルサービス、電子メディアの購読料など)
   *
   */
  shipInd?: string;
};
