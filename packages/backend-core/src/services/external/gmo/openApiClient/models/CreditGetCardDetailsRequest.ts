/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdditionalOptions } from './AdditionalOptions';
import type { CardInformation } from './CardInformation';
/**
 * クレカ払い カードの詳細情報返却(/credit/getCardDetails)のリクエストパラメーター
 */
export type CreditGetCardDetailsRequest = {
  cardInformation: CardInformation;
  additionalOptions?: AdditionalOptions;
};
