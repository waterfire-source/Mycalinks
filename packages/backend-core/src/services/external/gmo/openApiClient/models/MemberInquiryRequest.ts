/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdditionalOptions } from './AdditionalOptions';
import type { MemberId } from './MemberId';
import type { OnfileType } from './OnfileType';
/**
 * /member/inquiry request body
 */
export type MemberInquiryRequest = {
  /**
   * 照会したい会員のID
   *
   */
  memberId: MemberId;
  /**
   * 照会したい登録認証情報のタイプ
   * 設定なしの場合は全てのタイプが返ります。
   *
   */
  onfileType?: OnfileType;
  additionalOptions?: AdditionalOptions;
};
