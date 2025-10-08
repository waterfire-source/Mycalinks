/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdditionalOptions } from './AdditionalOptions';
import type { MemberId } from './MemberId';
import type { MemberName } from './MemberName';
/**
 * /member/create request body
 */
export type MemberCreateRequest = {
  /**
   * 登録する会員のID
   */
  memberId: MemberId;
  /**
   * 新規登録する会員の名称
   *
   */
  memberName?: MemberName;
  additionalOptions?: AdditionalOptions;
};
