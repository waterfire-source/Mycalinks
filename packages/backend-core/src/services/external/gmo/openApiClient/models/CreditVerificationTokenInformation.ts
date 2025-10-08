/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreditVerificationOptions } from './CreditVerificationOptions';
import type { OnfileCardOptions } from './OnfileCardOptions';
import type { TokenizedCard } from './TokenizedCard';
/**
 * クレカ払い 有効性確認(/credit/verifyCard)のリクエストパラメーター(トークン版)
 */
export type CreditVerificationTokenInformation = {
  /**
   * トークン化されたカード情報
   * **有効性確認(/credit/verifyCard)においては、Apple Payトークンは利用できません。**
   *
   */
  tokenizedCard?: TokenizedCard;
  creditVerificationOptions?: CreditVerificationOptions;
  onfileCardOptions?: OnfileCardOptions;
};
