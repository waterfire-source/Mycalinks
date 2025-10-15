/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Card } from './Card';
import type { CreditVerificationOptions } from './CreditVerificationOptions';
import type { OnfileCardOptions } from './OnfileCardOptions';
/**
 * クレカ払い 有効性確認(/credit/verifyCard)のリクエストパラメーター(直接版)
 */
export type CreditVerificationPanInformation = {
  card?: Card;
  creditVerificationOptions?: CreditVerificationOptions;
  onfileCardOptions?: OnfileCardOptions;
};
