/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 不正検知データ情報
 */
export type FraudDetectionData = {
  /**
   * ユーザーID
   */
  userId: string;
  /**
   * 本人確認書類タイプ
   * 本人確認書類IDに設定する書類タイプを設定します。
   * 本人確認書類IDを設定する場合は省略できません。
   * - <span class="mp-oas-code">PASSPORT</span>：パスポート
   * - <span class="mp-oas-code">TAXSTATEMENT</span>：納税証明書
   *
   */
  identityDocType?: FraudDetectionData.identityDocType;
  /**
   * 本人確認書類ID
   * 設定する場合は本人確認書類タイプも設定する必要があります。
   *
   */
  identityDocId?: string;
  /**
   * 配送先会社名
   */
  shippingCorporationName?: string;
  /**
   * 配送先電話番号
   */
  shippingPhone?: string;
  /**
   * 配送先メールアドレス
   */
  shippingEmail?: string;
  /**
   * 配送方法
   * - <span class="mp-oas-code">NEXT_DAY_OVERNIGHT</span>: 翌日発送
   * - <span class="mp-oas-code">TWO_DAY_SERVICE</span>: 2日以内発送
   * - <span class="mp-oas-code">THREE_DAY_SERVICE</span>: 3日以内発送
   * - <span class="mp-oas-code">LOWEST_COST</span>: 最安値の配送方法
   * - <span class="mp-oas-code">CARRIER_DESIGNATED_BY_CUSTOMER</span>:  お客様指定の運送会社
   * - <span class="mp-oas-code">ELECTRONIC_DELIVERY</span>: 電子郵便
   * - <span class="mp-oas-code">GROUND</span>: 陸上輸送
   * - <span class="mp-oas-code">INTERNATIONAL</span>: 国際郵便
   * - <span class="mp-oas-code">MILITARY</span>: 軍事郵便
   * - <span class="mp-oas-code">STORE_PICKUP</span>: 店舗受け取り
   * - <span class="mp-oas-code">SAME_DAY_SERVICE</span>: 即日配送
   * - <span class="mp-oas-code">OTHER</span>: その他
   * - <span class="mp-oas-code">PUDO</span>: PUDOステーション
   * - <span class="mp-oas-code">EXPEDITED</span>: 速達郵便
   *
   */
  shippingMethod?: FraudDetectionData.shippingMethod;
  /**
   * 送料
   * 審査タイプ(screeningType)が<span class="mp-oas-code">RED_SHIELD</span>の場合、12桁以下で設定してください。
   *
   */
  shippingAmount?: string;
  /**
   * トラッキング番号
   */
  shippingTrackingNumber?: string;
  /**
   * 発送時コメント
   */
  shippingComment?: string;
  /**
   * 配送先敬称
   */
  shippingSalutation?: string;
  /**
   * デバイス情報
   */
  deviceInformation?: string;
  /**
   * リピータフラグ
   */
  repeater?: boolean;
  /**
   * ユーザーID登録後経過日数
   */
  userRegistrationElapsedDays?: string;
  /**
   * プロモーションコード
   */
  promotionCode?: string;
  /**
   * ギフトカードメッセージ
   */
  giftCardMessage?: string;
  /**
   * ギフトカードタイプ
   * - <span class="mp-oas-code">ANNIVERSARY</span>: 記念日
   * - <span class="mp-oas-code">APRIL_FOOLS_DAY</span>: エイプリルフール
   * - <span class="mp-oas-code">BABY_SHOWER</span>: ベビーシャワー
   * - <span class="mp-oas-code">BIRTHDAY</span>: 誕生日
   * - <span class="mp-oas-code">BOSSES_DAY</span>: ボスの日
   * - <span class="mp-oas-code">CELEBRATE_FALL</span>: セレブレイト・フォール
   * - <span class="mp-oas-code">CHINESE_NEW_YEAR</span>: 春節
   * - <span class="mp-oas-code">CHRISTMAS</span>: クリスマス
   * - <span class="mp-oas-code">CONGRATULATIONS</span>: お祝い
   * - <span class="mp-oas-code">EASTER</span>: イースター
   * - <span class="mp-oas-code">FATHERS_DAY</span>: 父の日
   * - <span class="mp-oas-code">GRADUATION</span>: 卒業
   * - <span class="mp-oas-code">GRANDPARENTS_DAY</span>: 祖父母の日
   * - <span class="mp-oas-code">HALLOWEEN</span>: ハロウィン
   * - <span class="mp-oas-code">HANUKKAH</span>: ハヌカー
   * - <span class="mp-oas-code">HOLIDAY</span>: 祝日
   * - <span class="mp-oas-code">INDEPENDENCE_DAY</span>: 独立記念日
   * - <span class="mp-oas-code">KWANZAA</span>: クワンザ
   * - <span class="mp-oas-code">MOTHERS_DAY</span>: 母の日
   * - <span class="mp-oas-code">NEW_YEARS_DAY</span>: 元日
   * - <span class="mp-oas-code">OTHER</span>: その他
   * - <span class="mp-oas-code">PASSOVER</span>: 過越
   * - <span class="mp-oas-code">SEASONS_GREETINGS</span>: 季節の挨拶
   * - <span class="mp-oas-code">SECRETARYS_DAY</span>: 秘書の日
   * - <span class="mp-oas-code">ST_PATRICKS_DAY</span>: 聖パトリックの祝日
   * - <span class="mp-oas-code">SWEETEST_DAY</span>: スウィーテスト・デー
   * - <span class="mp-oas-code">THANKSGIVING</span>: 感謝祭
   * - <span class="mp-oas-code">VALENTINES_DAY</span>:バレンタインデー
   * - <span class="mp-oas-code">WEDDING</span>: 結婚式
   *
   */
  giftCardType?: FraudDetectionData.giftCardType;
};
export namespace FraudDetectionData {
  /**
   * 本人確認書類タイプ
   * 本人確認書類IDに設定する書類タイプを設定します。
   * 本人確認書類IDを設定する場合は省略できません。
   * - <span class="mp-oas-code">PASSPORT</span>：パスポート
   * - <span class="mp-oas-code">TAXSTATEMENT</span>：納税証明書
   *
   */
  export enum identityDocType {
    PASSPORT = 'PASSPORT',
    TAXSTATEMENT = 'TAXSTATEMENT',
  }
  /**
   * 配送方法
   * - <span class="mp-oas-code">NEXT_DAY_OVERNIGHT</span>: 翌日発送
   * - <span class="mp-oas-code">TWO_DAY_SERVICE</span>: 2日以内発送
   * - <span class="mp-oas-code">THREE_DAY_SERVICE</span>: 3日以内発送
   * - <span class="mp-oas-code">LOWEST_COST</span>: 最安値の配送方法
   * - <span class="mp-oas-code">CARRIER_DESIGNATED_BY_CUSTOMER</span>:  お客様指定の運送会社
   * - <span class="mp-oas-code">ELECTRONIC_DELIVERY</span>: 電子郵便
   * - <span class="mp-oas-code">GROUND</span>: 陸上輸送
   * - <span class="mp-oas-code">INTERNATIONAL</span>: 国際郵便
   * - <span class="mp-oas-code">MILITARY</span>: 軍事郵便
   * - <span class="mp-oas-code">STORE_PICKUP</span>: 店舗受け取り
   * - <span class="mp-oas-code">SAME_DAY_SERVICE</span>: 即日配送
   * - <span class="mp-oas-code">OTHER</span>: その他
   * - <span class="mp-oas-code">PUDO</span>: PUDOステーション
   * - <span class="mp-oas-code">EXPEDITED</span>: 速達郵便
   *
   */
  export enum shippingMethod {
    NEXT_DAY_OVERNIGHT = 'NEXT_DAY_OVERNIGHT',
    TWO_DAY_SERVICE = 'TWO_DAY_SERVICE',
    THREE_DAY_SERVICE = 'THREE_DAY_SERVICE',
    LOWEST_COST = 'LOWEST_COST',
    CARRIER_DESIGNATED_BY_CUSTOMER = 'CARRIER_DESIGNATED_BY_CUSTOMER',
    ELECTRONIC_DELIVERY = 'ELECTRONIC_DELIVERY',
    GROUND = 'GROUND',
    INTERNATIONAL = 'INTERNATIONAL',
    MILITARY = 'MILITARY',
    STORE_PICKUP = 'STORE_PICKUP',
    SAME_DAY_SERVICE = 'SAME_DAY_SERVICE',
    OTHER = 'OTHER',
    PUDO = 'PUDO',
    EXPEDITED = 'EXPEDITED',
  }
  /**
   * ギフトカードタイプ
   * - <span class="mp-oas-code">ANNIVERSARY</span>: 記念日
   * - <span class="mp-oas-code">APRIL_FOOLS_DAY</span>: エイプリルフール
   * - <span class="mp-oas-code">BABY_SHOWER</span>: ベビーシャワー
   * - <span class="mp-oas-code">BIRTHDAY</span>: 誕生日
   * - <span class="mp-oas-code">BOSSES_DAY</span>: ボスの日
   * - <span class="mp-oas-code">CELEBRATE_FALL</span>: セレブレイト・フォール
   * - <span class="mp-oas-code">CHINESE_NEW_YEAR</span>: 春節
   * - <span class="mp-oas-code">CHRISTMAS</span>: クリスマス
   * - <span class="mp-oas-code">CONGRATULATIONS</span>: お祝い
   * - <span class="mp-oas-code">EASTER</span>: イースター
   * - <span class="mp-oas-code">FATHERS_DAY</span>: 父の日
   * - <span class="mp-oas-code">GRADUATION</span>: 卒業
   * - <span class="mp-oas-code">GRANDPARENTS_DAY</span>: 祖父母の日
   * - <span class="mp-oas-code">HALLOWEEN</span>: ハロウィン
   * - <span class="mp-oas-code">HANUKKAH</span>: ハヌカー
   * - <span class="mp-oas-code">HOLIDAY</span>: 祝日
   * - <span class="mp-oas-code">INDEPENDENCE_DAY</span>: 独立記念日
   * - <span class="mp-oas-code">KWANZAA</span>: クワンザ
   * - <span class="mp-oas-code">MOTHERS_DAY</span>: 母の日
   * - <span class="mp-oas-code">NEW_YEARS_DAY</span>: 元日
   * - <span class="mp-oas-code">OTHER</span>: その他
   * - <span class="mp-oas-code">PASSOVER</span>: 過越
   * - <span class="mp-oas-code">SEASONS_GREETINGS</span>: 季節の挨拶
   * - <span class="mp-oas-code">SECRETARYS_DAY</span>: 秘書の日
   * - <span class="mp-oas-code">ST_PATRICKS_DAY</span>: 聖パトリックの祝日
   * - <span class="mp-oas-code">SWEETEST_DAY</span>: スウィーテスト・デー
   * - <span class="mp-oas-code">THANKSGIVING</span>: 感謝祭
   * - <span class="mp-oas-code">VALENTINES_DAY</span>:バレンタインデー
   * - <span class="mp-oas-code">WEDDING</span>: 結婚式
   *
   */
  export enum giftCardType {
    ANNIVERSARY = 'ANNIVERSARY',
    APRIL_FOOLS_DAY = 'APRIL_FOOLS_DAY',
    BABY_SHOWER = 'BABY_SHOWER',
    BIRTHDAY = 'BIRTHDAY',
    BOSSES_DAY = 'BOSSES_DAY',
    CELEBRATE_FALL = 'CELEBRATE_FALL',
    CHINESE_NEW_YEAR = 'CHINESE_NEW_YEAR',
    CHRISTMAS = 'CHRISTMAS',
    CONGRATULATIONS = 'CONGRATULATIONS',
    EASTER = 'EASTER',
    FATHERS_DAY = 'FATHERS_DAY',
    GRADUATION = 'GRADUATION',
    GRANDPARENTS_DAY = 'GRANDPARENTS_DAY',
    HALLOWEEN = 'HALLOWEEN',
    HANUKKAH = 'HANUKKAH',
    HOLIDAY = 'HOLIDAY',
    INDEPENDENCE_DAY = 'INDEPENDENCE_DAY',
    KWANZAA = 'KWANZAA',
    MOTHERS_DAY = 'MOTHERS_DAY',
    NEW_YEARS_DAY = 'NEW_YEARS_DAY',
    OTHER = 'OTHER',
    PASSOVER = 'PASSOVER',
    SEASONS_GREETINGS = 'SEASONS_GREETINGS',
    SECRETARYS_DAY = 'SECRETARYS_DAY',
    ST_PATRICKS_DAY = 'ST_PATRICKS_DAY',
    SWEETEST_DAY = 'SWEETEST_DAY',
    THANKSGIVING = 'THANKSGIVING',
    VALENTINES_DAY = 'VALENTINES_DAY',
    WEDDING = 'WEDDING',
  }
}
