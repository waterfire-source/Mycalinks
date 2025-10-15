import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { PosRunMode } from '@/types/next-auth';

// Load environment variables from .env.test
dotenv.config({
  path: path.resolve(__dirname, '../../../../../envs/.env.test'),
});

// Ensure environment variables are set
if (
  !process.env.E2E_TEST_EMAIL ||
  !process.env.E2E_TEST_PASSWORD ||
  !process.env.E2E_TEST_POS_RUN_MODE
) {
  throw new Error(
    'E2E_TEST_EMAIL and E2E_TEST_PASSWORD and E2E_TEST_POS_RUN_MODE must be set in .env.test file',
  );
}

const TEST_EMAIL = process.env.E2E_TEST_EMAIL;
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD;
const posRunMode = process.env.E2E_TEST_POS_RUN_MODE as PosRunMode;
if (!Object.values(PosRunMode).includes(posRunMode)) {
  throw new Error(
    `TEST_POS_RUN_MODE must be one of ${Object.values(PosRunMode).join(', ')}`,
  );
}

if (
  posRunMode === PosRunMode.sales &&
  (!process.env.E2E_TEST_STORE_NAME ||
    !process.env.E2E_TEST_REGISTER_NAME ||
    !process.env.E2E_TEST_STAFF_CODE)
) {
  throw new Error(
    'E2E_TEST_STORE_NAME and E2E_TEST_REGISTER_NAME and E2E_TEST_STAFF_CODE must be set in .env.test file if TEST_POS_RUN_MODE is sales',
  );
}
const STORE_NAME = process.env.E2E_TEST_STORE_NAME;
const REGISTER_NAME = process.env.E2E_TEST_REGISTER_NAME;
const STAFF_CODE = process.env.E2E_TEST_STAFF_CODE;

type AuthFixtures = {
  authenticatedPage: Page;
  loginPage: LoginPage;
};

export const test = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // 認証済みページ用のフィクスチャ
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    // 正しいログインURLへ遷移
    await loginPage.goto();
    // ログイン処理（clickとナビゲーション待機を同時に実行）
    await loginPage.login(TEST_EMAIL, TEST_PASSWORD);
    if (!page.url().includes('/auth')) {
      // ログインモード選択モーダルの処理
      await loginPage.selectLoginMode(posRunMode, STORE_NAME, REGISTER_NAME);
    }
    // URLが /auth に遷移したことを確認
    await page.waitForURL(/.*\/auth(?:\/.*)?/);
    if (posRunMode === PosRunMode.sales) {
      // ストアモードの場合、ここで従業員バーコードスキャン画面になっている
      await page
        .getByRole('button', { name: '従業員バーコードをスキャン' })
        .click();
      await page.keyboard.type(STAFF_CODE!);
      await page.keyboard.press('Enter');
    }
    await page.waitForSelector('h1:has-text("ダッシュボード")', {
      timeout: 10000,
    });

    await use(page);
  },
});

export { expect } from '@playwright/test';
