/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreditChargeOptions } from './CreditChargeOptions';
import type { TokenizedCard } from './TokenizedCard';
/**
 * クレカ払い情報(トークン化)
 */
export type CreditTokenInformation = {
  tokenizedCard: TokenizedCard;
  creditChargeOptions: CreditChargeOptions;
};
