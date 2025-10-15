import { TransactionPaymentMethod } from '@prisma/client';

/**
 * Interface for product information used in transaction tests
 */
export interface ProductInfo {
  searchTerm: string;
  productCode: string;
  conditionName: string;
  quantity?: number;
  price?: number;
}

/**
 * Interface for payment information used in transaction tests
 */
export interface PaymentInfo {
  method: TransactionPaymentMethod;
  receivedAmount?: number;
}
