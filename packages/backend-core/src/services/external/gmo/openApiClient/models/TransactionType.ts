/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 取引タイプ
 * この取引がお客様操作によって開始されたか、自動チャージのように加盟店様操作で行われたかを示します。
 * 現時点では設定する値によって当サービス内の処理は変わりません。
 * - <span class="mp-oas-code">CIT</span>: Customer Initiated Transaction(お客様操作起点)
 * - <span class="mp-oas-code">MIT</span>: Merchant Initiated Transaction(加盟店様操作起点)
 * - <span class="mp-oas-code">OTHER</span>: 上記以外
 *
 */
export enum TransactionType {
  CIT = 'CIT',
  MIT = 'MIT',
  OTHER = 'OTHER',
}
