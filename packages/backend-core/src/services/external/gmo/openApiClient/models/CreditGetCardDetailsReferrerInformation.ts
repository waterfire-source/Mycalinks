/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OnfileCardWithoutCardholderName } from './OnfileCardWithoutCardholderName';
/**
 * クレカ払い カードの詳細情報返却(/credit/getCardDetails)のリクエストパラメーター(登録済み版)
 */
export type CreditGetCardDetailsReferrerInformation = {
  /**
   * 登録されているカード情報
   * **登録済みのApple Pay情報は利用できません。**
   *
   */
  onfileCard?: OnfileCardWithoutCardholderName;
};
