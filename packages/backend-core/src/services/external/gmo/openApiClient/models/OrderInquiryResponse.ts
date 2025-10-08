/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderInquiryResponseCash } from './OrderInquiryResponseCash';
import type { OrderInquiryResponseCredit } from './OrderInquiryResponseCredit';
import type { OrderInquiryResponseWallet } from './OrderInquiryResponseWallet';
export type OrderInquiryResponse =
  | OrderInquiryResponseCredit
  | OrderInquiryResponseWallet
  | OrderInquiryResponseCash;
