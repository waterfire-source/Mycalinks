/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdditionalOptions } from './AdditionalOptions';
import type { MemberId } from './MemberId';
/**
 * /member/delete request body
 */
export type MemberDeleteRequest = {
  /**
   * 会員ID
   * 削除する会員のIDです。
   *
   */
  memberId: MemberId;
  additionalOptions?: AdditionalOptions;
};
