import {
  createOrUpdateConsignmentClientApi,
  getConsignmentClientApi,
  deleteConsignmentClientApi,
  getConsignmentProductApi,
  stockConsignmentClientProductApi,
} from 'api-generator';

export const createOrUpdateConsignmentClientDef =
  createOrUpdateConsignmentClientApi;
export const getConsignmentClientDef = getConsignmentClientApi;
export const deleteConsignmentClientDef = deleteConsignmentClientApi;
export const getConsignmentProductDef = getConsignmentProductApi;
export const stockConsignmentClientProductDef =
  stockConsignmentClientProductApi;
