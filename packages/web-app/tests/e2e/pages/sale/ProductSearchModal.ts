import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object for the product search modal in the sales page
 */
export class ProductSearchModal {
  readonly page: Page;
  readonly modalContainer: Locator;
  readonly closeButton: Locator;

  // Search controls section
  readonly genreSection: Locator;
  readonly categorySection: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly showOutOfStockButton: Locator;
  readonly showInStockOnlyButton: Locator;

  // Search results section
  readonly searchResultsContainer: Locator;
  readonly progressCircle: Locator;

  // Product detail section
  readonly productDetailSection: Locator;
  readonly conditionOptionsContainer: Locator;
  readonly priceInput: Locator;
  readonly quantityInput: Locator;
  readonly addButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Modal container - using data-testid for reliable selection
    this.modalContainer = page.locator('[data-testid="product-search-modal"]');
    this.closeButton = page.locator(
      '[data-testid="product-search-modal-close"]',
    );

    // Search controls section
    this.genreSection = this.modalContainer
      .locator('div')
      .filter({ hasText: 'ジャンル' })
      .first();
    this.categorySection = this.modalContainer
      .locator('div')
      .filter({ hasText: 'カテゴリ' })
      .first();
    this.searchInput = this.modalContainer.locator(
      '[data-testid="search-input"]',
    );
    this.searchButton = this.modalContainer.locator(
      '[data-testid="search-button"]',
    );

    // Stock filter buttons
    this.showOutOfStockButton = this.modalContainer.locator(
      '[data-testid="show-out-of-stock-button"]',
    );
    this.showInStockOnlyButton = this.modalContainer.locator(
      '[data-testid="show-in-stock-only-button"]',
    );

    // Search results section
    this.searchResultsContainer = this.modalContainer.locator(
      '[data-testid="search-results-container"]',
    );
    // プログレスサークル（ローディングインジケーター）のlocatorを追加
    this.progressCircle = this.searchResultsContainer.locator(
      '[data-testid="progress-circle"]',
      { hasText: '' },
    );

    // Product detail section
    this.productDetailSection = this.modalContainer.locator(
      '[data-testid="product-detail-section"]',
    );
    this.conditionOptionsContainer = this.productDetailSection.locator(
      '[data-testid="condition-options-container"]',
    );
    this.priceInput = this.productDetailSection.locator(
      '[data-testid="price-input"] input',
    );
    this.quantityInput = this.productDetailSection.locator(
      '[data-testid="quantity-input"] input',
    );
    this.addButton = this.productDetailSection.locator(
      '[data-testid="add-to-cart-button"]',
    );
    this.cancelButton = this.productDetailSection.locator(
      '[data-testid="cancel-button"]',
    );
  }

  /**
   * 検索の読み込みが完了するまで待機する関数
   */
  async waitForSearchComplete(): Promise<void> {
    // プログレスサークルが非表示になるまで待機
    await expect(this.progressCircle).not.toBeVisible({ timeout: 3000 });
  }

  /**
   * Check if the modal is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.modalContainer.isVisible();
  }

  /**
   * Select a genre by name
   * @param genreName - The name of the genre to select
   */
  async selectGenre(genreName: string): Promise<void> {
    // 操作前に検索が完了していることを確認
    await this.waitForSearchComplete();
    const genreButton = this.genreSection.getByRole('button', {
      name: genreName,
    });
    await genreButton.click();
    // ジャンル選択後に再検索が行われる場合、完了を待機
    await this.waitForSearchComplete();
  }

  /**
   * Select a category by name
   * @param categoryName - The name of the category to select
   */
  async selectCategory(categoryName: string): Promise<void> {
    // 操作前に検索が完了していることを確認
    await this.waitForSearchComplete();
    const categoryButton = this.categorySection.getByRole('button', {
      name: categoryName,
    });
    await categoryButton.click();
    // カテゴリ選択後に再検索が行われる場合、完了を待機
    await this.waitForSearchComplete();
  }

  /**
   * Enter search term in the search input field
   * @param searchTerm - The search term to enter
   */
  async enterSearchTerm(searchTerm: string): Promise<void> {
    // 操作前に検索が完了していることを確認
    await this.waitForSearchComplete();
    await this.searchInput.fill(searchTerm);
  }

  /**
   * Click the search button to perform search
   */
  async clickSearchButton(): Promise<void> {
    await this.searchButton.click();
    // 検索ボタンクリック後に検索が完了するまで待機
    await this.waitForSearchComplete();
  }

  /**
   * Search for a product by name or code
   * @param searchTerm - The product name or code to search for
   */
  async searchProduct(searchTerm: string): Promise<void> {
    // 操作前に検索が完了していることを確認
    await this.waitForSearchComplete();

    await this.enterSearchTerm(searchTerm);
    // 操作前に検索が完了していることを確認
    await this.waitForSearchComplete();

    await this.clickSearchButton();
    // 設定変更後に再検索が行われる場合、完了を待機
    await this.waitForSearchComplete();
  }

  /**
   * Toggle display of out-of-stock products
   * @param showOutOfStock - Whether to show out-of-stock products
   */
  async toggleOutOfStockProducts(showOutOfStock: boolean): Promise<void> {
    // 操作前に検索が完了していることを確認
    await this.waitForSearchComplete();

    if (showOutOfStock) {
      if (await this.showOutOfStockButton.isVisible()) {
        await this.showOutOfStockButton.click();
        // 設定変更後に再検索が行われる場合、完了を待機
        await this.waitForSearchComplete();
      }
    } else {
      if (await this.showInStockOnlyButton.isVisible()) {
        await this.showInStockOnlyButton.click();
        // 設定変更後に再検索が行われる場合、完了を待機
        await this.waitForSearchComplete();
      }
    }
  }

  /**
   * Select a product from search results by product code
   * @param productCode - The product code (e.g., "OBF 228/197")
   */
  async selectProductByCode(productCode: string): Promise<void> {
    // 操作前に検索が完了していることを確認
    await this.waitForSearchComplete();

    // Find product card with matching code text
    const productCard = this.searchResultsContainer
      .locator('div')
      .filter({ hasText: productCode })
      .first();

    await expect(productCard).toBeVisible({ timeout: 300000 });

    await productCard.click();
    // Wait for product details to load
    await expect(this.productDetailSection).toBeVisible();
  }

  /**
   * Select a condition option for the product
   * @param conditionName - The condition name to select
   */
  async selectCondition(conditionName: string): Promise<void> {
    const conditionButton = this.conditionOptionsContainer.getByRole('button', {
      name: conditionName,
    });

    await conditionButton.first().click();
  }

  /**
   * Set the price of the selected product
   * @param price - The price to set
   */
  async setPrice(price: number): Promise<void> {
    await this.priceInput.fill(price.toString());
  }

  /**
   * Set the quantity of the selected product
   * @param quantity - The quantity to set
   */
  async setQuantity(quantity: number): Promise<void> {
    await this.quantityInput.fill(quantity.toString());
  }

  /**
   * Add the selected product to cart
   */
  async addToCart(): Promise<void> {
    await this.addButton.click();
  }

  /**
   * Cancel and close the modal
   */
  async cancel(): Promise<void> {
    // 操作前に検索が完了していることを確認
    await this.waitForSearchComplete();

    await this.cancelButton.click();
    // Wait for modal to close
    await expect(this.modalContainer).not.toBeVisible();
  }
  /**
   * Close the product search modal using the close button in the header
   */
  async close(): Promise<void> {
    // 操作前に検索が完了していることを確認
    await this.waitForSearchComplete();

    await this.closeButton.click();
    // Wait for modal to close
    await expect(this.modalContainer).not.toBeVisible();
  }

  /**
   * Get a locator for a product card with a specific code
   * @param productCode - The product code to look for
   * @returns A locator for the product card
   */
  getProductCardByCode(productCode: string): Locator {
    return this.searchResultsContainer
      .locator('div')
      .filter({ hasText: productCode })
      .first();
  }

  /**
   * Get the search results container
   * @returns The search results container locator
   */
  getSearchResultsContainer(): Locator {
    return this.searchResultsContainer;
  }

  /**
   * Search by text and verify results
   * @param searchTerm - The text to search for
   */
  async searchByText(searchTerm: string): Promise<void> {
    await this.searchProduct(searchTerm);
  }

  /**
   * Complete product search and add to cart in one operation
   * @param searchTerm - The product name or code to search for
   * @param productCode - The product code to select from results
   * @param conditionName - The condition to select
   * @param quantity - The quantity to add
   * @param price - Optional custom price
   */
  async searchAndAddProduct(
    searchTerm: string,
    productCode: string,
    conditionName: string,
    quantity: number = 1,
    price?: number,
  ): Promise<void> {
    await this.page.waitForTimeout(5000);
    await this.searchProduct(searchTerm);
    await this.selectProductByCode(productCode);
    await this.selectCondition(conditionName);
    await this.setQuantity(quantity);
    if (price !== undefined) {
      await this.setPrice(price);
    }
    await this.addToCart();
  }
}
