import { TransactionPaymentMethod } from '@prisma/client';
import { ProductInfo, PaymentInfo } from './transaction.types';

/**
 * Interface for a single product test case
 */
export interface SingleProductTestCase {
  productInfo: ProductInfo;
  paymentInfo: PaymentInfo;
  description: string;
}

/**
 * Interface for a multi-product test case
 */
export interface MultiProductTestCase {
  products: ProductInfo[];
  paymentInfo: PaymentInfo;
  description: string;
}

/**
 * Sale test cases
 */
export const saleTestCases: SingleProductTestCase[] = [
  {
    productInfo: {
      searchTerm: '竜騎士ガイア',
      productCode: '13',
      conditionName: '新品',
      quantity: 1,
    },
    paymentInfo: {
      method: TransactionPaymentMethod.cash,
      receivedAmount: 5000,
    },
    description: '現金支払いによる単一商品の販売テスト',
  },
  // {
  //   productInfo: {
  //     searchTerm: '城之内 克也',
  //     productCode: '3',
  //     conditionName: '新品',
  //     quantity: 1,
  //   },
  //   paymentInfo: {
  //     method: TransactionPaymentMethod.square,
  //   },
  //   description: 'カード支払いによる単一商品の販売テスト',
  // },
];

/**
 * Multi-product sale test cases
 */
export const multiProductSaleTestCases: MultiProductTestCase[] = [
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
      receivedAmount: 10000,
    },
    description: '現金支払いによる複数商品の販売テスト',
  },
  // {
  //   products: [
  //     {
  //       searchTerm: '竜騎士ガイア',
  //       productCode: '13',
  //       conditionName: '新品',
  //       quantity: 1,
  //       price: 3000,
  //     },
  //     {
  //       searchTerm: '城之内 克也',
  //       productCode: '3',
  //       conditionName: '新品',
  //       quantity: 1,
  //       price: 3000,
  //     },
  //   ],
  //   paymentInfo: {
  //     method: TransactionPaymentMethod.paypay,
  //   },
  //   description: 'PayPay支払いによる複数商品の販売テスト',
  // },
];
