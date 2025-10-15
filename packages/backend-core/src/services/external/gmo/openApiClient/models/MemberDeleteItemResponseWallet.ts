/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MemberId } from './MemberId';
import type { OnfileWalletInformation } from './OnfileWalletInformation';
/**
 * /member/deleteItem response body
 */
export type MemberDeleteItemResponseWallet = {
  memberId?: MemberId;
  /**
   * 削除されたPay払い利用承諾情報
   *
   */
  deletedWallet?: OnfileWalletInformation;
};
