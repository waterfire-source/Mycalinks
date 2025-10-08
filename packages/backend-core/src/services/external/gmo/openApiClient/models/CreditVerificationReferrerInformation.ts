/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreditVerificationOptions } from './CreditVerificationOptions';
import type { OnfileCard } from './OnfileCard';
import type { OnfileCardOptions } from './OnfileCardOptions';
/**
 * クレカ払い 有効性確認(/credit/verifyCard)のリクエストパラメーター(登録済み版)
 */
export type CreditVerificationReferrerInformation = {
  /**
   * 登録されているカード情報
   * **有効性確認(/credit/verifyCard)においては、登録済みのApple Pay情報は利用できません。**
   *
   */
  onfileCard?: OnfileCard;
  creditVerificationOptions?: CreditVerificationOptions;
  onfileCardOptions?: OnfileCardOptions;
};
