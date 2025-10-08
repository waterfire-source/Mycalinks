import { Page, Locator } from '@playwright/test';

/**
 * Page object for the cart table in the purchase page
 */
export class PurchaseCartTable {
  readonly page: Page;
  readonly tableContainer: Locator;
  readonly tableRows: Locator;
  readonly productImage: Locator;
  readonly productName: Locator;
  readonly productCondition: Locator;
  readonly unitPriceInput: Locator;
  readonly discountButton: Locator;
  readonly discountAmount: Locator;
  readonly quantityInput: Locator;
  readonly quantityDecreaseButton: Locator;
  readonly quantityIncreaseButton: Locator;
  readonly totalAmount: Locator;
  readonly deleteButton: Locator;
  readonly splitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Table container - using data-testid for reliable selection
    this.tableContainer = page
      .locator('table')
      .filter({ hasText: '商品画像' })
      .first();

    if (!this.tableContainer) {
      // Fallback to text-based selection
      this.tableContainer = page
        .locator('table')
        .filter({ hasText: '商品画像' })
        .first();
    }

    // Table rows - each row has a unique key
    this.tableRows = this.tableContainer.locator('tbody > tr');

    // Row-level locators will be created dynamically based on the row index
    // These are template locators that will be used with nth() to get specific rows
    this.productImage = this.tableRows.locator('td').nth(0).locator('img');
    this.productName = this.tableRows
      .locator('td')
      .nth(1)
      .locator('Typography')
      .first();
    this.productCondition = this.tableRows
      .locator('td')
      .nth(1)
      .locator('Typography')
      .nth(1);
    this.unitPriceInput = this.tableRows
      .locator('td')
      .nth(2)
      .locator('input')
      .first();
    this.discountButton = this.tableRows.locator('td').nth(2).getByText('割増');
    this.discountAmount = this.tableRows
      .locator('td')
      .nth(3)
      .locator('Box')
      .first();
    this.quantityInput = this.tableRows.locator('td').nth(4).locator('input');
    this.quantityDecreaseButton = this.tableRows
      .locator('td')
      .nth(4)
      .locator('button')
      .first();
    this.quantityIncreaseButton = this.tableRows
      .locator('td')
      .nth(4)
      .locator('button')
      .nth(1);
    this.totalAmount = this.tableRows.locator('td').nth(5);
    this.deleteButton = this.tableRows.locator('td').nth(6).locator('button');
    this.splitButton = this.tableRows.locator('td').nth(4).getByText('分割');
  }

  /**
   * Get a specific row from the cart table
   * @param rowIndex - The index of the row to get
   * @returns An object containing all the locators for the specified row
   */
  getRow(rowIndex: number) {
    return {
      productImage: this.productImage.nth(rowIndex),
      productName: this.productName.nth(rowIndex),
      productCondition: this.productCondition.nth(rowIndex),
      unitPriceInput: this.unitPriceInput.nth(rowIndex),
      discountButton: this.discountButton.nth(rowIndex),
      discountAmount: this.discountAmount.nth(rowIndex),
      quantityInput: this.quantityInput.nth(rowIndex),
      quantityDecreaseButton: this.quantityDecreaseButton.nth(rowIndex),
      quantityIncreaseButton: this.quantityIncreaseButton.nth(rowIndex),
      totalAmount: this.totalAmount.nth(rowIndex),
      deleteButton: this.deleteButton.nth(rowIndex),
      splitButton: this.splitButton.nth(rowIndex),
    };
  }

  /**
   * Get the number of rows in the cart table
   * @returns The number of rows in the cart table
   */
  async getRowCount(): Promise<number> {
    return await this.tableRows.count();
  }

  /**
   * Update the unit price for a specific row
   * @param rowIndex - The index of the row to update
   * @param price - The new price to set
   */
  async updateUnitPrice(rowIndex: number, price: number): Promise<void> {
    const row = this.getRow(rowIndex);
    await row.unitPriceInput.fill(price.toString());
  }

  /**
   * Update the quantity for a specific row using the input field
   * @param rowIndex - The index of the row to update
   * @param quantity - The new quantity to set
   */
  async updateQuantity(rowIndex: number, quantity: number): Promise<void> {
    const row = this.getRow(rowIndex);
    await row.quantityInput.fill(quantity.toString());
    await row.quantityInput.press('Enter');
  }

  /**
   * Increase the quantity for a specific row using the + button
   * @param rowIndex - The index of the row to update
   */
  async increaseQuantity(rowIndex: number): Promise<void> {
    const row = this.getRow(rowIndex);
    await row.quantityIncreaseButton.click();
  }

  /**
   * Decrease the quantity for a specific row using the - button
   * @param rowIndex - The index of the row to update
   */
  async decreaseQuantity(rowIndex: number): Promise<void> {
    const row = this.getRow(rowIndex);
    await row.quantityDecreaseButton.click();
  }

  /**
   * Delete a specific row from the cart
   * @param rowIndex - The index of the row to delete
   */
  async deleteRow(rowIndex: number): Promise<void> {
    const row = this.getRow(rowIndex);
    await row.deleteButton.click();
  }

  /**
   * Split a specific row into two separate rows
   * @param rowIndex - The index of the row to split
   */
  async splitRow(rowIndex: number): Promise<void> {
    const row = this.getRow(rowIndex);
    await row.splitButton.click();
  }

  /**
   * Open the discount modal for a specific row
   * @param rowIndex - The index of the row to apply discount to
   */
  async openDiscountModal(rowIndex: number): Promise<void> {
    const row = this.getRow(rowIndex);
    await row.discountButton.click();
  }

  /**
   * Get the total amount for a specific row
   * @param rowIndex - The index of the row to get total from
   * @returns The total amount as a number
   */
  async getRowTotal(rowIndex: number): Promise<number> {
    const row = this.getRow(rowIndex);
    const totalText = await row.totalAmount.textContent();
    return parseInt(totalText?.replace(/[^0-9]/g, '') || '0', 10);
  }

  /**
   * Get the discount amount for a specific row
   * @param rowIndex - The index of the row to get discount from
   * @returns The discount amount as a number
   */
  async getRowDiscount(rowIndex: number): Promise<number> {
    const row = this.getRow(rowIndex);
    const discountText = await row.discountAmount.textContent();
    return parseInt(discountText?.replace(/[^0-9]/g, '') || '0', 10);
  }
}
