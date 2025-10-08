import { Page, Locator } from '@playwright/test';

/**
 * Page object for the transaction completion modal that appears after confirming payment
 */
export class TransactionCompletionModal {
  readonly page: Page;
  readonly modalContainer: Locator;

  // Amount information
  readonly totalContainer: Locator;
  readonly totalAmount: Locator;
  readonly receivedContainer: Locator;
  readonly receivedAmount: Locator;
  readonly changeContainer: Locator;
  readonly changeAmount: Locator;

  // Action buttons
  readonly receiptButton: Locator;
  readonly invoiceButton: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Modal container
    this.modalContainer = page.locator(
      '[data-testid="transaction-completion-modal"]',
    );

    // Amount information
    this.totalContainer = this.modalContainer.locator(
      '[data-testid="completion-total-container"]',
    );
    this.totalAmount = this.totalContainer.locator(
      '[data-testid="completion-total-amount"]',
    );
    this.receivedContainer = this.modalContainer.locator(
      '[data-testid="completion-received-container"]',
    );
    this.receivedAmount = this.receivedContainer.locator(
      '[data-testid="completion-received-amount"]',
    );
    this.changeContainer = this.modalContainer.locator(
      '[data-testid="completion-change-container"]',
    );
    this.changeAmount = this.changeContainer.locator(
      '[data-testid="completion-change-amount"]',
    );

    // Action buttons
    this.receiptButton = this.modalContainer.locator(
      '[data-testid="completion-receipt-button"]',
    );
    this.invoiceButton = this.modalContainer.locator(
      '[data-testid="completion-invoice-button"]',
    );
    this.finishButton = this.modalContainer.locator(
      '[data-testid="completion-finish-button"]',
    );
  }

  /**
   * Check if the transaction completion modal is visible
   * @returns True if the modal is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.modalContainer.isVisible();
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
   * Get the received amount as a number
   * @returns The received amount as a number
   */
  async getReceivedAmount(): Promise<number> {
    const receivedText = await this.receivedAmount.textContent();
    return this.extractAmountFromText(receivedText);
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
   * Click the receipt print button
   */
  async printReceipt(): Promise<void> {
    await this.receiptButton.click();
  }

  /**
   * Click the invoice print button
   */
  async printInvoice(): Promise<void> {
    await this.invoiceButton.click();
  }

  /**
   * Click the finish transaction button
   */
  async finishTransaction(): Promise<void> {
    await this.finishButton.click();
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
