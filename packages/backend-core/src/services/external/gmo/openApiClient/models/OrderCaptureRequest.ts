/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessId } from './AccessId';
import type { AdditionalOptions } from './AdditionalOptions';
/**
 * /order/capture request body
 */
export type OrderCaptureRequest = {
  /**
   * 取引リクエスト時に返る取引ID
   */
  accessId: AccessId;
  additionalOptions?: AdditionalOptions;
};
