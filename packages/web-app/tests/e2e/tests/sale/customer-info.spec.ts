import { test, expect } from '../auth.fixture';
import { SalePage } from '../../pages/sale';
import { testCustomers } from './customer-data';

/**
 * Customer information tests
 * These tests verify the functionality of the customer information table
 */
test.describe('Customer information tests', () => {
  test('should display correct customer information when entering member code', async ({
    authenticatedPage,
  }) => {
    const salePage = new SalePage(authenticatedPage);
    await salePage.goto();

    // Enter member code
    await salePage.customerInfoTable.enterMemberCode(
      testCustomers.customer1.memberCode,
    );

    // 修正: タイムアウトを使わず、リセットボタンが表示されるまで待つ
    await expect(salePage.customerInfoTable.resetButton).toBeVisible({
      timeout: 10000,
    });

    // Verify displayed information
    expect(await salePage.customerInfoTable.getMemberId()).toBe(
      testCustomers.customer1.memberId,
    );
    expect(await salePage.customerInfoTable.getMemberName()).toBe(
      testCustomers.customer1.memberName,
    );
    expect(await salePage.customerInfoTable.getMemberFurigana()).toBe(
      testCustomers.customer1.memberFurigana,
    );

    // For points, we need to handle the format difference (0 vs 0pt)
    const pointsText = await salePage.customerInfoTable.getMemberPoints();
    expect(pointsText.toString()).toBe('0');
  });
});
