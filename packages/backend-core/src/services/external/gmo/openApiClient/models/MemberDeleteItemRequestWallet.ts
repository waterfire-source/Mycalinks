/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdditionalOptions } from './AdditionalOptions';
import type { MemberId } from './MemberId';
import type { OnfileType } from './OnfileType';
import type { OnfileWalletType } from './OnfileWalletType';
/**
 * /member/delete request body
 */
export type MemberDeleteItemRequestWallet = {
  /**
   * 会員ID
   * 削除する利用承諾情報が登録されている会員のIDです。
   *
   */
  memberId?: MemberId;
  /**
   * 認証情報タイプ
   * 削除する認証情報タイプとしてPay払い利用承諾<span class="mp-oas-code">WALLET</span>を設定してください。
   *
   */
  onfileType: OnfileType;
  /**
   * 利用承諾のタイプ
   * 削除する利用承諾のタイプです。
   *
   */
  onfileWalletType: OnfileWalletType;
  additionalOptions?: AdditionalOptions;
};
