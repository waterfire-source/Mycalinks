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
export type OnfileCardWithoutCardholderName = {
  /**
   * 会員のID
   *
   */
  memberId: MemberId;
  /**
   * 登録されているカードのタイプ
   * - <span class="mp-oas-code">CREDIT_CARD</span>：クレジットカード
   * - <span class="mp-oas-code">APPLE_PAY</span>：Apple Pay
   *
   */
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
};
