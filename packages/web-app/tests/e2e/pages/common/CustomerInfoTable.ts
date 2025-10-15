import { Page, Locator } from '@playwright/test';

/**
 * Page object for the customer information table
 */
export class CustomerInfoTable {
  readonly page: Page;
  readonly tableContainer: Locator;
  readonly memberCodeButton: Locator;
  readonly memberIdCell: Locator;
  readonly memberNameCell: Locator;
  readonly memberFuriganaCell: Locator;
  readonly memberPointsCell: Locator;
  readonly resetButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Table container - using data-testid for reliable selection
    this.tableContainer = page.locator('[data-testid="customer-info-table"]');

    // Member code button (when no customer is selected)
    this.memberCodeButton = this.tableContainer.getByRole('button', {
      name: '会員コードをスキャン',
    });

    // Table cells for customer information (when a customer is selected)
    // Using data-testid attributes for reliable selection
    this.memberIdCell = this.tableContainer.locator(
      '[data-testid="customer-id"]',
    );
    this.memberNameCell = this.tableContainer.locator(
      '[data-testid="customer-name"]',
    );
    this.memberFuriganaCell = this.tableContainer.locator(
      '[data-testid="customer-furigana"]',
    );
    this.memberPointsCell = this.tableContainer.locator(
      '[data-testid="customer-points"]',
    );

    // Reset button
    this.resetButton = this.tableContainer.getByRole('button', {
      name: 'リセット',
    });
  }

  /**
   * Check if a customer is selected
   */
  async hasCustomerSelected(): Promise<boolean> {
    return await this.resetButton.isVisible();
  }

  /**
   * Click the member code button to start customer search
   */
  async clickMemberCodeButton() {
    await this.memberCodeButton.click();
  }

  /**
   * Enter member code
   * @param memberCode - The member code to enter
   */
  async enterMemberCode(memberCode: string) {
    // Click the member code button to start scanning
    await this.clickMemberCodeButton();

    // Type the member code directly (simulating keyboard input)
    await this.page.keyboard.type(memberCode);

    // Press Enter to submit
    await this.page.keyboard.press('Enter');
  }

  /**
   * Get the member ID
   */
  async getMemberId(): Promise<string> {
    if (!(await this.hasCustomerSelected())) {
      return '';
    }
    return (await this.memberIdCell.textContent()) || '';
  }

  /**
   * Get the member name
   */
  async getMemberName(): Promise<string> {
    if (!(await this.hasCustomerSelected())) {
      return '';
    }
    return (await this.memberNameCell.textContent()) || '';
  }

  /**
   * Get the member furigana
   */
  async getMemberFurigana(): Promise<string> {
    if (!(await this.hasCustomerSelected())) {
      return '';
    }
    return (await this.memberFuriganaCell.textContent()) || '';
  }

  /**
   * Get the member points
   */
  async getMemberPoints(): Promise<number> {
    if (!(await this.hasCustomerSelected())) {
      return 0;
    }
    const pointsText = (await this.memberPointsCell.textContent()) || '';
    const pointsMatch = pointsText.match(/(\d+,?)+/);
    if (!pointsMatch) {
      return 0;
    }
    return parseInt(pointsMatch[0].replace(/,/g, ''), 10);
  }

  /**
   * Reset the customer selection
   */
  async resetCustomer() {
    if (await this.hasCustomerSelected()) {
      await this.resetButton.click();
    }
  }
}
