/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MemberId } from './MemberId';
import type { OnfileCardInformation } from './OnfileCardInformation';
/**
 * /member/deleteItem response body
 */
export type MemberDeleteItemResponseCard = {
  memberId?: MemberId;
  /**
   * 削除されたカードの情報
   * <span class="mp-oas-code">index</span>や<span class="mp-oas-code">isDefault</span>は削除する前の情報です。
   * 最新の状態は[取引照会API(/order/inquiry)](#tag/order/operation/orderInquiry)で確認してください。
   *
   */
  deletedCard?: OnfileCardInformation;
};
