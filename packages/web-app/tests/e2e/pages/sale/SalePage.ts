import { Page, Locator, expect } from '@playwright/test';
import { PATH } from '../../../../src/constants/paths';
import { ProductSearchModal } from './ProductSearchModal';
import { SalePaymentDetailsCard } from './SalePaymentDetailsCard';
import { SalePaymentModal } from './SalePaymentModal';
import { TransactionCompletionModal } from './TransactionCompletionModal';
import { SaleCartTable } from './SaleCartTable';
import { CustomerInfoTable } from 'tests/e2e/pages/common/CustomerInfoTable';

/**
 * Page object for the sales page
 */
export class SalePage {
  readonly page: Page;
  readonly scanStartButton: Locator;
  readonly scanEndButton: Locator;
  readonly productSearchButton: Locator;
  readonly customerInfoTable: CustomerInfoTable;
  readonly productSearchModal: ProductSearchModal;
  readonly paymentDetailsCard: SalePaymentDetailsCard;
  readonly paymentModal: SalePaymentModal;
  readonly transactionCompletionModal: TransactionCompletionModal;
  readonly cartTable: SaleCartTable;

  constructor(page: Page) {
    this.page = page;

    // Scan buttons
    this.scanStartButton = page.getByRole('button', { name: 'スキャン開始' });
    this.scanEndButton = page.getByRole('button', { name: 'スキャン終了' });

    // Product search button
    this.productSearchButton = page.getByRole('button', { name: '商品検索' });

    // Initialize customer info table
    this.customerInfoTable = new CustomerInfoTable(page);

    // Initialize product search modal
    this.productSearchModal = new ProductSearchModal(page);

    // Initialize payment details card
    this.paymentDetailsCard = new SalePaymentDetailsCard(page);

    // Initialize payment modal
    this.paymentModal = new SalePaymentModal(page);

    // Initialize transaction completion modal
    this.transactionCompletionModal = new TransactionCompletionModal(page);
    this.cartTable = new SaleCartTable(page);
  }

  /**
   * Navigate to the sales page
   */
  async goto() {
    await this.page.goto(PATH.SALE.root);
    await expect(this.page).toHaveURL(/.*\/auth\/sale.*/);
  }

  /**
   * Start scanning products
   */
  async startScan() {
    const isScanning = await this.scanEndButton.isVisible();
    if (!isScanning) {
      await this.scanStartButton.click();
    }
  }

  /**
   * End scanning products
   */
  async endScan() {
    const isScanning = await this.scanEndButton.isVisible();
    if (isScanning) {
      await this.scanEndButton.click();
    }
  }

  /**
   * Open product search modal
   */
  async openProductSearch() {
    await this.productSearchButton.click();
    await expect(this.productSearchModal.modalContainer).toBeVisible();
  }

  /**
   * Search for a product and add it to cart
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
    await this.openProductSearch();
    await this.productSearchModal.searchAndAddProduct(
      searchTerm,
      productCode,
      conditionName,
      quantity,
      price,
    );
    await this.productSearchModal.close();
  }
}
