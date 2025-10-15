/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FraudDetectionCustomData } from './FraudDetectionCustomData';
import type { FraudDetectionData } from './FraudDetectionData';
import type { FraudDetectionOptions } from './FraudDetectionOptions';
/**
 * 不正検知情報
 */
export type FraudDetectionInformation = {
  fraudDetectionOptions: FraudDetectionOptions;
  fraudDetectionData: FraudDetectionData;
  fraudDetectionCustomData?: FraudDetectionCustomData;
};
