import { test, expect } from '../auth.fixture';
import { Page } from '@playwright/test';
import { PurchasePage } from '../../pages/purchase/PurchasePage';
import { TransactionPaymentMethod } from '@prisma/client';
import { ProductInfo, PaymentInfo } from '../sale/transaction.types';
import {
  purchaseTestCases,
  multiProductPurchaseTestCases,
} from './transaction-test-data';

/**
 * Complete a purchase transaction with the given product and payment information
 * @param authenticatedPage - The authenticated page instance
 * @param productInfo - Information about the product to add to the cart
 * @param paymentInfo - Information about the payment method and amount
 */
async function completePurchaseTransaction(
  authenticatedPage: Page,
  productInfo: ProductInfo,
  paymentInfo: PaymentInfo,
): Promise<void> {
  const purchasePage = new PurchasePage(authenticatedPage);
  await purchasePage.goto();

  // Add a product to the cart
  await purchasePage.searchAndAddProduct(
    productInfo.searchTerm,
    productInfo.productCode,
    productInfo.conditionName,
    productInfo.quantity || 1,
    productInfo.price,
  );
  const cartCell = authenticatedPage.getByRole('cell').first();
  await expect(cartCell).toBeVisible({ timeout: 1000 });

  // Proceed to payment
  await purchasePage.purchaseDetailsCard.proceedToPayment();

  // Complete payment
  await purchasePage.paymentModal.completePayment(
    paymentInfo.method,
    paymentInfo.receivedAmount,
  );

  const completionText = authenticatedPage.getByText('お会計完了');
  await expect(completionText).toBeVisible({ timeout: 200000 });

  const completionModal = purchasePage.transactionCompletionModal;
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
 * Complete a purchase transaction with multiple products
 * @param authenticatedPage - The authenticated page instance
 * @param products - Array of product information to add to the cart
 * @param paymentInfo - Information about the payment method and amount
 */
async function completeMultiProductPurchaseTransaction(
  authenticatedPage: Page,
  products: ProductInfo[],
  paymentInfo: PaymentInfo,
): Promise<void> {
  const purchasePage = new PurchasePage(authenticatedPage);
  await purchasePage.goto();

  // Add each product to the cart
  for (const product of products) {
    await purchasePage.searchAndAddProduct(
      product.searchTerm,
      product.productCode,
      product.conditionName,
      product.quantity || 1,
      product.price,
    );
  }

  // Proceed to payment
  await purchasePage.purchaseDetailsCard.proceedToPayment();

  // Complete payment
  await purchasePage.paymentModal.completePayment(
    paymentInfo.method,
    paymentInfo.receivedAmount,
  );

  const completionModal = purchasePage.transactionCompletionModal;
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

test.describe.parallel('Purchase transaction tests', () => {
  // Single product transaction tests
  for (const testCase of purchaseTestCases) {
    test(`Single product: ${testCase.description}`, async ({
      authenticatedPage,
    }) => {
      await completePurchaseTransaction(
        authenticatedPage,
        testCase.productInfo,
        testCase.paymentInfo,
      );
    });
  }

  // Multi-product transaction tests
  for (const testCase of multiProductPurchaseTestCases) {
    test(`Multiple products: ${testCase.description}`, async ({
      authenticatedPage,
    }) => {
      await completeMultiProductPurchaseTransaction(
        authenticatedPage,
        testCase.products,
        testCase.paymentInfo,
      );
    });
  }
});
