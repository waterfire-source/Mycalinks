import { test, expect } from '../auth.fixture';
import { SalePage } from '../../pages/sale';
import { testSearchCases } from './search-test-data';

/**
 * カートテーブルのテスト
 * 商品の追加、単価変更、数量変更、削除の機能を確認
 */
test.describe('カートテーブル操作テスト', () => {
  test('商品を追加して単価と数量を変更し、削除できること', async ({
    authenticatedPage,
  }) => {
    const salePage = new SalePage(authenticatedPage);
    await salePage.goto();

    // 商品を追加
    const testCase = testSearchCases[0]; // 五等分の花嫁の商品を使用
    await salePage.searchAndAddProduct(
      testCase.searchText || '',
      testCase.expectedProductCode,
      '未登録',
      1,
      1000,
    );

    // カートテーブルに商品が追加されたことを確認
    const cartTable = salePage.cartTable;

    // 単価を変更
    const newPrice = 1500;
    await cartTable.updateUnitPrice(0, newPrice);
    await authenticatedPage.waitForTimeout(500);

    // 数量をボタンで増やす
    await cartTable.increaseQuantity(0);
    await authenticatedPage.waitForTimeout(500);

    // 数量を直接入力
    const newQuantity = 3;
    await cartTable.updateQuantity(0, newQuantity);
    await authenticatedPage.waitForTimeout(500);

    // 総額が正しいことを確認
    const rowTotal = await cartTable.getRowTotal(0);
    expect(rowTotal).toBe(newPrice * newQuantity);

    // 商品を削除
    await cartTable.deleteRow(0);
    await authenticatedPage.waitForTimeout(500);
  });
});
