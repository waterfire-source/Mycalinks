import { TransactionPaymentMethod } from '@prisma/client';
import { ProductInfo, PaymentInfo } from '../sale/transaction.types';

/**
 * Interface for a purchase test case
 */
export interface PurchaseTestCase {
  productInfo: ProductInfo;
  paymentInfo: PaymentInfo;
  description: string;
}

/**
 * Interface for a multi-product purchase test case
 */
export interface MultiProductPurchaseTestCase {
  products: ProductInfo[];
  paymentInfo: PaymentInfo;
  description: string;
}

/**
 * Purchase test cases
 */
export const purchaseTestCases: PurchaseTestCase[] = [
  {
    productInfo: {
      searchTerm: '竜騎士ガイア',
      productCode: '13',
      conditionName: '新品',
      quantity: 1,
    },
    paymentInfo: {
      method: TransactionPaymentMethod.cash,
    },
    description: '現金支払いによる単一商品の買取テスト',
  },
  {
    productInfo: {
      searchTerm: '城之内 克也',
      productCode: '3',
      conditionName: '新品',
      quantity: 1,
    },
    paymentInfo: {
      method: TransactionPaymentMethod.bank,
    },
    description: '銀行振込による単一商品の買取テスト',
  },
];

/**
 * Multi-product purchase test cases
 */
export const multiProductPurchaseTestCases: MultiProductPurchaseTestCase[] = [
  {
    products: [
      {
        searchTerm: '竜騎士ガイア',
        productCode: '13',
        conditionName: '新品',
        quantity: 1,
      },
      {
        searchTerm: '城之内 克也',
        productCode: '3',
        conditionName: '新品',
        quantity: 2,
      },
    ],
    paymentInfo: {
      method: TransactionPaymentMethod.cash,
    },
    description: '現金支払いによる複数商品の買取テスト',
  },
  {
    products: [
      {
        searchTerm: '竜騎士ガイア',
        productCode: '13',
        conditionName: '新品',
        quantity: 1,
        price: 2000,
      },
      {
        searchTerm: '城之内 克也',
        productCode: '3',
        conditionName: '新品',
        quantity: 1,
        price: 3000,
      },
    ],
    paymentInfo: {
      method: TransactionPaymentMethod.bank,
      receivedAmount: 10,
    },
    description: '銀行振込による複数商品の買取テスト',
  },
];
