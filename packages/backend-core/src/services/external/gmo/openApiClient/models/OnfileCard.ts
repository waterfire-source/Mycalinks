/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MemberId } from './MemberId';
import type { OnfileCardId } from './OnfileCardId';
import type { OnfileCardIndex } from './OnfileCardIndex';
import type { OnfileCardType } from './OnfileCardType';
/**
 * 登録されているカード情報
 */
export type OnfileCard = {
  /**
   * 会員のID
   *
   */
  memberId: MemberId;
  type: OnfileCardType;
  /**
   * 登録されているカードのうち、今回利用するカードのID(物理連番)
   * <span class="mp-oas-code">cardId</span>と<span class="mp-oas-code">index</span>の両方を省略した場合はデフォルトカードが使われます。
   *
   */
  cardId?: OnfileCardId;
  /**
   * 登録されているカードのうち、今回利用するカードのインデックス(論理連番)
   * <span class="mp-oas-code">cardId</span>が設定されている場合は<span class="mp-oas-code">cardId</span>が優先されます。
   * <span class="mp-oas-code">cardId</span>と<span class="mp-oas-code">index</span>の両方を省略した場合はデフォルトカードが使われます。
   *
   */
  index?: OnfileCardIndex;
  /**
   * カード名義人
   * <span class="mp-oas-code">type</span>が<span class="mp-oas-code">APPLE_PAY</span>の場合は設定しても無視されます。
   * - 省略した場合：登録済みのカード情報に保存されているカード名義人を使用します。
   * - 指定した場合：設定したカード名義人を、既存のカード情報に保存されているカード名義人よりも優先して使用します。随時支払いまたは有効性確認が完了後、既存のカード情報のカード名義人も、この新しく設定したカード名義人で更新します。
   *
   */
  cardholderName?: string;
};
