/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Card } from './Card';
import type { OnfileCardOptions } from './OnfileCardOptions';
/**
 * クレカ払い カード登録(/credit/storeCard)のリクエストパラメーター(直接版)
 */
export type CreditStoringPanInformation = {
  card: Card;
  onfileCardOptions: OnfileCardOptions;
};
