/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderReference } from './OrderReference';
import type { StatusCredit } from './StatusCredit';
export type OrderReferenceCredit = OrderReference & {
  status?: StatusCredit;
  /**
   * 支払いタイプ
   * - <span class="mp-oas-code">CREDIT</span>: クレカ払い
   *
   */
  chargeType?: OrderReferenceCredit.chargeType;
};
export namespace OrderReferenceCredit {
  /**
   * 支払いタイプ
   * - <span class="mp-oas-code">CREDIT</span>: クレカ払い
   *
   */
  export enum chargeType {
    CREDIT = 'CREDIT',
  }
}
