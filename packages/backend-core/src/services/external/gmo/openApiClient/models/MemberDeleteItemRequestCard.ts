/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdditionalOptions } from './AdditionalOptions';
import type { MemberId } from './MemberId';
import type { OnfileCardId } from './OnfileCardId';
import type { OnfileCardType } from './OnfileCardType';
import type { OnfileType } from './OnfileType';
/**
 * /member/delete request body
 */
export type MemberDeleteItemRequestCard = {
  /**
   * 会員ID
   * 削除するカード情報が登録されている会員のIDです。
   *
   */
  memberId: MemberId;
  /**
   * 認証情報タイプ
   * 削除する認証情報タイプとしてクレジットカード<span class="mp-oas-code">CARD</span>を設定してください。
   *
   */
  onfileType: OnfileType;
  /**
   * 削除するカードのタイプ
   * - <span class="mp-oas-code">CREDIT_CARD</span>：クレジットカード
   * - <span class="mp-oas-code">APPLE_PAY</span>：Apple Pay
   *
   */
  onfileCardType: OnfileCardType;
  /**
   * カードのID
   * 削除するカードのID(物理連番)です。
   *
   */
  cardId: OnfileCardId;
  additionalOptions?: AdditionalOptions;
};
