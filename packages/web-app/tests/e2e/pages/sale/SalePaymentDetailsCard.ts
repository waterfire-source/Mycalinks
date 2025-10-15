import { Page, Locator } from '@playwright/test';

/**
 * Page object for the payment details card in the sales page
 */
export class SalePaymentDetailsCard {
  readonly page: Page;
  readonly cardContainer: Locator;
  readonly subtotalContainer: Locator;
  readonly subtotalAmount: Locator;
  readonly discountContainer: Locator;
  readonly discountAmount: Locator;
  readonly totalContainer: Locator;
  readonly totalAmount: Locator;
  readonly taxContainer: Locator;
  readonly taxAmount: Locator;
  readonly proceedToPaymentButton: Locator;
  readonly holdTransactionButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Card container
    this.cardContainer = page.locator('[data-testid="payment-details-card"]');

    // Amount containers and values
    this.subtotalContainer = this.cardContainer.locator(
      '[data-testid="subtotal-container"]',
    );
    this.subtotalAmount = this.subtotalContainer.locator(
      '[data-testid="subtotal-amount"]',
    );
    this.discountContainer = this.cardContainer.locator(
      '[data-testid="discount-container"]',
    );
    this.discountAmount = this.discountContainer.locator(
      '[data-testid="discount-amount"]',
    );
    this.totalContainer = this.cardContainer.locator(
      '[data-testid="total-container"]',
    );
    this.totalAmount = this.totalContainer.locator(
      '[data-testid="total-amount"]',
    );
    this.taxContainer = this.cardContainer.locator(
      '[data-testid="tax-container"]',
    );
    this.taxAmount = this.taxContainer.locator('[data-testid="tax-amount"]');

    // Action buttons
    this.proceedToPaymentButton = this.cardContainer.locator(
      '[data-testid="proceed-to-payment-button"]',
    );
    this.holdTransactionButton = this.cardContainer.locator(
      '[data-testid="hold-transaction-button"]',
    );
  }

  /**
   * Get the subtotal amount as a number
   * @returns The subtotal amount as a number
   */
  async getSubtotalAmount(): Promise<number> {
    const subtotalText = await this.subtotalAmount.textContent();
    return this.extractAmountFromText(subtotalText);
  }

  /**
   * Get the discount amount as a number
   * @returns The discount amount as a number
   */
  async getDiscountAmount(): Promise<number> {
    const discountText = await this.discountAmount.textContent();
    return this.extractAmountFromText(discountText);
  }

  /**
   * Get the total amount as a number
   * @returns The total amount as a number
   */
  async getTotalAmount(): Promise<number> {
    const totalText = await this.totalAmount.textContent();
    return this.extractAmountFromText(totalText);
  }

  /**
   * Get the tax amount as a number
   * @returns The tax amount as a number
   */
  async getTaxAmount(): Promise<number> {
    const taxText = await this.taxAmount.textContent();
    // Extract tax amount from text like "内消費税1,000円"
    const match = taxText?.match(/内消費税([\d,]+)円/);
    if (match && match[1]) {
      return parseInt(match[1].replace(/,/g, ''), 10);
    }
    return 0;
  }

  /**
   * Click the proceed to payment button
   */
  async proceedToPayment(): Promise<void> {
    await this.proceedToPaymentButton.click();
  }

  /**
   * Click the hold transaction button
   */
  async holdTransaction(): Promise<void> {
    await this.holdTransactionButton.click();
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
