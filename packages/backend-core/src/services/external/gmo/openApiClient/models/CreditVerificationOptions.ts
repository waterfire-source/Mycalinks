/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ItemCode } from './ItemCode';
/**
 * カード有効性確認オプション情報
 */
export type CreditVerificationOptions = {
  /**
   * 3Dセキュア認証の利用有無
   * <span class="mp-oas-code">true</span>、または設定なしの場合は、3Dセキュア認証が行われます。
   *
   */
  useTds2?: boolean;
  itemCode?: ItemCode;
};
