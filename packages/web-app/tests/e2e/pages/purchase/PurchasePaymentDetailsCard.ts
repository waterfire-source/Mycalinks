import { Page, Locator } from '@playwright/test';

/**
 * Page object for the purchase details card in the purchase page
 */
export class PurchasePaymentDetailsCard {
  readonly page: Page;
  readonly cardContainer: Locator;
  readonly subtotalAmount: Locator;
  readonly discountAmount: Locator;
  readonly totalAmount: Locator;
  readonly taxAmount: Locator;
  readonly discountButton: Locator;
  readonly estimateButton: Locator;
  readonly paymentButton: Locator;
  readonly holdButton: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Card container - using data-testid when available
    this.cardContainer = page.locator('[data-testid="purchase-details-card"]');
    if (!this.cardContainer) {
      // Fallback to text-based selection
      this.cardContainer = page
        .locator('div')
        .filter({ hasText: '査定内容' })
        .first();
    }

    // Amount fields
    this.subtotalAmount = this.cardContainer
      .locator('div')
      .filter({ hasText: '小計' })
      .locator('Typography')
      .last();
    this.discountAmount = this.cardContainer
      .locator('div')
      .filter({ hasText: '全体割増' })
      .locator('Typography')
      .last();
    this.totalAmount = this.cardContainer
      .locator('div')
      .filter({ hasText: '合計' })
      .locator('Typography')
      .last();
    this.taxAmount = this.cardContainer
      .locator('div')
      .filter({ hasText: '消費税' })
      .locator('Typography')
      .first();

    // Buttons
    this.discountButton = this.cardContainer.getByRole('button', {
      name: '割増',
    });
    this.estimateButton = this.cardContainer.getByRole('button', {
      name: '見積もり',
    });
    this.paymentButton = this.cardContainer.getByRole('button', {
      name: '清算',
    });
    this.holdButton = this.cardContainer.getByRole('button', {
      name: '一時保留',
    });
    this.confirmButton = page.locator(
      '[data-testid="purchase-confirm-button"]',
    );
    if (!this.confirmButton) {
      this.confirmButton = this.cardContainer.getByRole('button', {
        name: '査定確定',
      });
    }
  }

  /**
   * Get the subtotal amount
   * @returns The subtotal amount as a number
   */
  async getSubtotalAmount(): Promise<number> {
    const text = await this.subtotalAmount.textContent();
    return this.extractAmountFromText(text);
  }

  /**
   * Get the discount amount
   * @returns The discount amount as a number
   */
  async getDiscountAmount(): Promise<number> {
    const text = await this.discountAmount.textContent();
    return this.extractAmountFromText(text);
  }

  /**
   * Get the total amount
   * @returns The total amount as a number
   */
  async getTotalAmount(): Promise<number> {
    const text = await this.totalAmount.textContent();
    return this.extractAmountFromText(text);
  }

  /**
   * Get the tax amount
   * @returns The tax amount as a number
   */
  async getTaxAmount(): Promise<number> {
    const text = await this.taxAmount.textContent();
    const match = text?.match(/消費税([\d,]+)円/);
    return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
  }

  /**
   * Open the discount modal
   */
  async openDiscountModal(): Promise<void> {
    await this.discountButton.click();
  }

  /**
   * Click the estimate button
   */
  async clickEstimateButton(): Promise<void> {
    await this.estimateButton.click();
  }

  /**
   * Click the payment button
   */
  async clickPaymentButton(): Promise<void> {
    await this.paymentButton.click();
  }

  /**
   * Click the hold button
   */
  async clickHoldButton(): Promise<void> {
    await this.holdButton.click();
  }

  /**
   * Click the confirm button
   */
  async clickConfirmButton(): Promise<void> {
    await this.confirmButton.click();
  }

  /**
   * Proceed to payment by clicking the payment button
   * This is an alias for clickPaymentButton to maintain API compatibility
   */
  async proceedToPayment(): Promise<void> {
    await this.clickPaymentButton();
  }

  /**
   * Helper method to extract amount from text like "1,000円"
   * @param text The text containing the amount
   * @returns The amount as a number
   */
  private extractAmountFromText(text: string | null): number {
    if (!text) return 0;
    const match = text?.match(/([\d,]+)円/);
    if (match && match[1]) {
      return parseInt(match[1].replace(/,/g, ''), 10);
    }
    return 0;
  }
}
