import { test, expect } from '../auth.fixture';
import { Page } from '@playwright/test';
import { SalePage } from '../../pages/sale';
import { testSearchCases } from './search-test-data';

/**
 * 商品検索テスト用の共通関数
 * @param authenticatedPage - 認証済みのページインスタンス
 * @param searchParams - 検索パラメータ（ジャンル、カテゴリ、検索テキスト）
 * @param expectedProductCode - 検索結果に期待される商品コード
 */
async function testProductSearch(
  authenticatedPage: Page,
  searchParams: {
    genre?: string;
    category?: string;
    searchText?: string;
  },
  expectedProductCode: string,
): Promise<void> {
  // 販売ページに移動
  const salePage = new SalePage(authenticatedPage);
  await salePage.goto();

  // 商品検索モーダルを開く
  await salePage.openProductSearch();

  // ジャンルを選択（指定されている場合）
  if (searchParams.genre) {
    await salePage.productSearchModal.selectGenre(searchParams.genre);
  }

  // カテゴリを選択（指定されている場合）
  if (searchParams.category) {
    await salePage.productSearchModal.selectCategory(searchParams.category);
  }

  // テキスト検索（指定されている場合）
  if (searchParams.searchText) {
    await salePage.productSearchModal.searchByText(searchParams.searchText);
  }

  // 検索結果が読み込まれるのを待つ
  await authenticatedPage.waitForTimeout(500);

  // 期待される商品コードを持つ商品が検索結果に表示されることを確認
  await expect(
    salePage.productSearchModal.getProductCardByCode(expectedProductCode),
  ).toBeVisible();

  // モーダルを閉じる
  await salePage.productSearchModal.close();
}

/**
 * 商品検索テスト
 */
test.describe('商品検索テスト', () => {
  for (const testCase of testSearchCases) {
    test(
      testCase.description,
      async ({ authenticatedPage }: { authenticatedPage: Page }) => {
        await testProductSearch(
          authenticatedPage,
          {
            genre: testCase.genre,
            category: testCase.category,
            searchText: testCase.searchText,
          },
          testCase.expectedProductCode,
        );
      },
    );
  }
});
