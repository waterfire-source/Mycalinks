/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MemberId } from './MemberId';
import type { MemberName } from './MemberName';
import type { OnfileCards } from './OnfileCards';
import type { OnfileWallets } from './OnfileWallets';
/**
 * /member/inquiry response body
 */
export type MemberInquiryResponse = {
  memberId?: MemberId;
  memberName?: MemberName;
  onfileCards?: OnfileCards;
  onfileWallets?: OnfileWallets;
};
