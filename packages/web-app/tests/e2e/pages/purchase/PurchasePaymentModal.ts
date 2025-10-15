import { Page, Locator } from '@playwright/test';
import { TransactionPaymentMethod } from '@prisma/client';

/**
 * Page object for the payment modal in the purchase page
 */
export class PurchasePaymentModal {
  readonly page: Page;
  readonly modalContainer: Locator;

  // Payment details section
  readonly subtotalContainer: Locator;
  readonly subtotalAmount: Locator;
  readonly discountContainer: Locator;
  readonly discountAmount: Locator;
  readonly totalContainer: Locator;
  readonly totalAmount: Locator;
  readonly taxContainer: Locator;
  readonly taxAmount: Locator;

  // Payment method section
  readonly paymentMethodContainer: Locator;

  // Payment input section
  readonly receivedAmountInput: Locator;
  readonly changeContainer: Locator;
  readonly changeAmount: Locator;

  // Action buttons
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Modal container
    this.modalContainer = page.locator('[data-testid="payment-modal"]');

    // Payment details section
    this.subtotalContainer = this.modalContainer.locator(
      '[data-testid="payment-subtotal-container"]',
    );
    this.subtotalAmount = this.subtotalContainer.locator(
      '[data-testid="payment-subtotal-amount"]',
    );
    this.discountContainer = this.modalContainer.locator(
      '[data-testid="payment-discount-container"]',
    );
    this.discountAmount = this.discountContainer.locator(
      '[data-testid="payment-discount-amount"]',
    );
    this.totalContainer = this.modalContainer.locator(
      '[data-testid="payment-total-container"]',
    );
    this.totalAmount = this.totalContainer.locator(
      '[data-testid="payment-total-amount"]',
    );
    this.taxContainer = this.modalContainer.locator(
      '[data-testid="payment-tax-container"]',
    );
    this.taxAmount = this.taxContainer.locator(
      '[data-testid="payment-tax-amount"]',
    );

    // Payment method section
    this.paymentMethodContainer = this.modalContainer.locator(
      '[data-testid="payment-method-container"]',
    );

    // Payment input section
    this.receivedAmountInput = this.modalContainer
      .locator('[data-testid="payment-received-input"]')
      .getByRole('spinbutton');
    this.changeContainer = this.modalContainer.locator(
      '[data-testid="payment-change-container"]',
    );
    this.changeAmount = this.changeContainer.locator(
      '[data-testid="payment-change-amount"]',
    );

    // Action buttons
    this.confirmButton = this.modalContainer.locator(
      '[data-testid="payment-confirm-button"]',
    );
    this.cancelButton = this.modalContainer.locator(
      '[data-testid="payment-cancel-button"]',
    );
  }

  /**
   * Get the change amount as a number
   * @returns The change amount as a number
   */
  async getChangeAmount(): Promise<number> {
    const changeText = await this.changeAmount.textContent();
    return this.extractAmountFromText(changeText);
  }

  /**
   * Select a payment method
   * @param method The payment method to select
   */
  async selectPaymentMethod(method: TransactionPaymentMethod): Promise<void> {
    let buttonText: string;

    switch (method) {
      case TransactionPaymentMethod.cash:
        buttonText = '現金';
        break;
      case TransactionPaymentMethod.bank:
        buttonText = '銀行振込';
        break;
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }

    const methodButton = this.paymentMethodContainer.getByRole('button', {
      name: buttonText,
    });
    await methodButton.click();
  }

  /**
   * Set received amount (for cash payments)
   * @param amount - The amount received
   */
  async setReceivedAmount(amount: number): Promise<void> {
    await this.receivedAmountInput.fill(amount.toString());
  }

  /**
   * Click the confirm button to complete the payment
   */
  async confirm(): Promise<void> {
    await this.confirmButton.click();
  }

  /**
   * Click the cancel button to cancel the payment
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * Complete the payment process in one operation
   * @param method The payment method to use
   * @param receivedAmount The amount received from the customer (only for cash payments)
   */
  async completePayment(
    method: TransactionPaymentMethod,
    receivedAmount?: number,
  ): Promise<void> {
    await this.selectPaymentMethod(method);

    if (
      method === TransactionPaymentMethod.cash &&
      receivedAmount !== undefined
    ) {
      await this.setReceivedAmount(receivedAmount);
    }

    await this.confirm();
  }

  /**
   * Helper method to extract amount from text like "1,000円"
   * @param text The text containing the amount
   * @returns The amount as a number
   */
  private extractAmountFromText(text: string | null): number {
    if (!text) return 0;
    const match = text.match(/([\d,]+)円/);
    if (match && match[1]) {
      return parseInt(match[1].replace(/,/g, ''), 10);
    }
    return 0;
  }
}
