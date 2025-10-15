/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CardResult } from './CardResult';
import type { NextAction } from './NextAction';
import type { OnfileCardResult } from './OnfileCardResult';
/**
 * クレカ払い カード登録(/credit/storeCard)のレスポンスパラメーター
 */
export type CreditStoreCardReponse = {
  /**
   * レスポンスを受け取った後の加盟店様側の処理
   * カード登録成功時は<span class="mp-oas-code">NO_ACTION</span>です。
   * - <span class="mp-oas-code">NO_ACTION</span>：後続処理なし
   *
   */
  nextAction?: NextAction;
  onfileCardResult?: OnfileCardResult;
  cardResult?: CardResult;
};
