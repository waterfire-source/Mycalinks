/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 現金払いタイプ
 * 現金払いタイプによってパラメーターの設定要否が異なります。
 * 詳細は[共通パラメーター対応表 - Pay払い](#tag/common-parameters/Pay)を参照ください。
 * - <span class="mp-oas-code">KONBINI</span>：コンビニ
 * - <span class="mp-oas-code">PAYEASY</span>：Pay-easy
 * - <span class="mp-oas-code">BANK_TRANSFER_SMBC</span>：銀行振込(バーチャル口座)
 * - <span class="mp-oas-code">BANK_TRANSFER_GMO_AOZORA</span>：銀行振込(バーチャル口座 あおぞら)
 *
 */
export enum CashType {
  KONBINI = 'KONBINI',
  PAYEASY = 'PAYEASY',
  BANK_TRANSFER_SMBC = 'BANK_TRANSFER_SMBC',
  BANK_TRANSFER_GMO_AOZORA = 'BANK_TRANSFER_GMO_AOZORA',
}
