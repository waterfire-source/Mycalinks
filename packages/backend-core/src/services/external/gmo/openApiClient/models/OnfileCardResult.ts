/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MemberId } from './MemberId';
import type { MemberName } from './MemberName';
import type { OnfileCardId } from './OnfileCardId';
import type { OnfileCardType } from './OnfileCardType';
/**
 * カードの登録結果
 */
export type OnfileCardResult = {
  memberId?: MemberId;
  memberName?: MemberName;
  type?: OnfileCardType;
  cardId?: OnfileCardId;
  /**
   * デフォルトカード判定
   * デフォルトカードの場合<span class="mp-oas-code">true</span>、そうでない場合<span class="mp-oas-code">false</span>です。
   *
   */
  isDefault?: boolean;
};
