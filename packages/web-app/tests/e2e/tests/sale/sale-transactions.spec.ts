import { test, expect } from '../auth.fixture';
import { Page } from '@playwright/test';
import { SalePage } from '../../pages/sale/SalePage';
import { TransactionPaymentMethod } from '@prisma/client';
import { ProductInfo, PaymentInfo } from './transaction.types';
import {
  saleTestCases,
  multiProductSaleTestCases,
} from './transaction-test-data';

/**
 * Complete a transaction with the given product and payment information
 * @param authenticatedPage - The authenticated page instance
 * @param productInfo - Information about the product to add to the cart
 * @param paymentInfo - Information about the payment method and amount
 */
async function completeTransaction(
  authenticatedPage: Page,
  productInfo: ProductInfo,
  paymentInfo: PaymentInfo,
): Promise<void> {
  const salePage = new SalePage(authenticatedPage);
  await salePage.goto();

  // Add a product to the cart
  await salePage.searchAndAddProduct(
    productInfo.searchTerm,
    productInfo.productCode,
    productInfo.conditionName,
    productInfo.quantity || 1,
    productInfo.price,
  );
  const cartCell = authenticatedPage.getByRole('cell').first();
  await expect(cartCell).toBeVisible({ timeout: 10000 });

  // Proceed to payment
  await salePage.paymentDetailsCard.proceedToPayment();

  // Complete payment
  await salePage.paymentModal.completePayment(
    paymentInfo.method,
    paymentInfo.receivedAmount,
  );

  const completionText = authenticatedPage.getByText('お会計完了');
  await expect(completionText).toBeVisible({ timeout: 200000 });

  // Verify transaction completion modal is visible
  const completionModal = salePage.transactionCompletionModal;
  await expect(completionModal.modalContainer).toBeVisible({ timeout: 100000 });

  // Verify amounts are displayed correctly
  const totalAmount = await completionModal.getTotalAmount();
  expect(totalAmount).toBeGreaterThanOrEqual(0);

  if (
    paymentInfo.method === TransactionPaymentMethod.cash &&
    paymentInfo.receivedAmount
  ) {
    const receivedAmount = await completionModal.getReceivedAmount();
    expect(receivedAmount).toBe(paymentInfo.receivedAmount);

    const changeAmount = await completionModal.getChangeAmount();
    expect(changeAmount).toBe(paymentInfo.receivedAmount - totalAmount);
  }

  // Finish transaction
  await completionModal.finishTransaction();
}

/**
 * Complete a transaction with multiple products
 * @param authenticatedPage - The authenticated page instance
 * @param products - Array of product information to add to the cart
 * @param paymentInfo - Information about the payment method and amount
 */
async function completeMultiProductTransaction(
  authenticatedPage: Page,
  products: ProductInfo[],
  paymentInfo: PaymentInfo,
): Promise<void> {
  const salePage = new SalePage(authenticatedPage);
  await salePage.goto();

  // Add each product to the cart
  for (const product of products) {
    await salePage.searchAndAddProduct(
      product.searchTerm,
      product.productCode,
      product.conditionName,
      product.quantity || 1,
      product.price,
    );
  }
  const cartCell = authenticatedPage.getByRole('cell').first();
  await expect(cartCell).toBeVisible({ timeout: 10000 });

  // Proceed to payment
  await salePage.paymentDetailsCard.proceedToPayment();

  // Complete payment
  await salePage.paymentModal.completePayment(
    paymentInfo.method,
    paymentInfo.receivedAmount,
  );

  const completionText = authenticatedPage.getByText('お会計完了');
  await expect(completionText).toBeVisible({ timeout: 200000 });

  // Verify transaction completion modal is visible
  const completionModal = salePage.transactionCompletionModal;
  await expect(completionModal.modalContainer).toBeVisible({ timeout: 100000 });

  // Verify amounts are displayed correctly
  const totalAmount = await completionModal.getTotalAmount();
  expect(totalAmount).toBeGreaterThanOrEqual(0);

  if (
    paymentInfo.method === TransactionPaymentMethod.cash &&
    paymentInfo.receivedAmount
  ) {
    const receivedAmount = await completionModal.getReceivedAmount();
    expect(receivedAmount).toBe(paymentInfo.receivedAmount);

    const changeAmount = await completionModal.getChangeAmount();
    expect(changeAmount).toBe(paymentInfo.receivedAmount - totalAmount);
  }

  // Finish transaction
  await completionModal.finishTransaction();
}

test.describe.parallel('Sales transaction tests', () => {
  // Single product transaction tests
  for (const testCase of saleTestCases) {
    test(`Single product: ${testCase.description}`, async ({
      authenticatedPage,
    }) => {
      await completeTransaction(
        authenticatedPage,
        testCase.productInfo,
        testCase.paymentInfo,
      );
    });
  }

  // Multi-product transaction tests
  for (const testCase of multiProductSaleTestCases) {
    test(`Multiple products: ${testCase.description}`, async ({
      authenticatedPage,
    }) => {
      await completeMultiProductTransaction(
        authenticatedPage,
        testCase.products,
        testCase.paymentInfo,
      );
    });
  }
});
