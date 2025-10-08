/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OnfileCardOptions } from './OnfileCardOptions';
import type { TokenizedCard } from './TokenizedCard';
/**
 * クレカ払い カード登録(/credit/storeCard)のリクエストパラメーター(トークン版)
 */
export type CreditStoringTokenInformation = {
  /**
   * トークン化されたカード情報
   * **カード登録(/credit/storeCard)においては、Apple Payトークンは利用できません。**
   *
   */
  tokenizedCard: TokenizedCard;
  onfileCardOptions: OnfileCardOptions;
};
