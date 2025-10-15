/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MemberId } from './MemberId';
import type { MemberName } from './MemberName';
/**
 * Pay払い利用承諾オプション情報
 *
 */
export type WalletAuthorizationOptions = {
  /**
   * 利用承諾を登録する対象の会員ID
   * 該当する会員IDが存在しない場合は登録できませんが、<span class="mp-oas-code">createNewMember</span>パラメーターを<span class="mp-oas-code">true</span>にすることで会員IDを新規登録します。
   *
   */
  memberId: MemberId;
  /**
   * 新規登録する会員の名称
   * 会員を新規登録する場合にのみ設定できます。
   * すでに会員が存在する場合、会員の名称は更新されません。
   *
   */
  memberName?: MemberName;
  /**
   * 会員ID未登録時の新規作成
   * <span class="mp-oas-code">true</span>にすると、指定した会員IDが存在しない場合に新規登録します。
   *
   */
  createNewMember?: boolean;
};
