import { Page, Locator, expect } from '@playwright/test';
import { PATH } from '../../../../src/constants/paths';
import { PurchaseCartTable } from './PurchaseCartTable';
import { PurchasePaymentDetailsCard } from './PurchasePaymentDetailsCard';
import { PurchasePaymentModal } from './PurchasePaymentModal';
import { TransactionCompletionModal } from './TransactionCompletionModal';
import { ProductSearchModal } from 'tests/e2e/pages/purchase/ProductSearchModal';
import { CustomerInfoTable } from 'tests/e2e/pages/common/CustomerInfoTable';

/**
 * Page object for the purchase page
 */
export class PurchasePage {
  readonly page: Page;
  readonly scanStartButton: Locator;
  readonly scanEndButton: Locator;
  readonly productSearchButton: Locator;
  readonly customerInfoTable: CustomerInfoTable;
  readonly productSearchModal: ProductSearchModal;
  readonly purchaseDetailsCard: PurchasePaymentDetailsCard;
  readonly paymentModal: PurchasePaymentModal;
  readonly transactionCompletionModal: TransactionCompletionModal;
  readonly cartTable: PurchaseCartTable;

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
    this.purchaseDetailsCard = new PurchasePaymentDetailsCard(page);

    // Initialize payment modal
    this.paymentModal = new PurchasePaymentModal(page);

    // Initialize transaction completion modal
    this.transactionCompletionModal = new TransactionCompletionModal(page);
    this.cartTable = new PurchaseCartTable(page);
  }

  /**
   * Navigate to the purchase page
   */
  async goto() {
    await this.page.goto(PATH.PURCHASE);
    await expect(this.page).toHaveURL(/.*\/auth\/purchase.*/);
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
