/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TokenizedCard } from './TokenizedCard';
/**
 * クレカ払い カードの詳細情報返却(/credit/getCardDetails)のリクエストパラメーター(トークン版)
 */
export type CreditGetCardDetailsTokenInformation = {
  /**
   * トークン化されたカード情報
   * **Apple PayトークンおよびGoogle Payトークンは利用できません。**
   *
   */
  tokenizedCard: TokenizedCard;
};
