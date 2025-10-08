import { Page, Locator, expect } from '@playwright/test';
import { PATH } from '../../../src/constants/paths';
import { PosRunMode } from '@/types/next-auth';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly loginHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('メールアドレス');
    this.passwordInput = page.getByLabel('パスワード');
    this.loginButton = page.getByRole('button', { name: '次へ' });
    this.loginHeading = page.getByRole('heading', { name: 'ログイン' });
  }

  async goto() {
    await this.page.goto(PATH.LOGIN);
    await expect(this.loginHeading).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.page.waitForTimeout(5000);
    await this.loginButton.click();
  }

  async selectLoginMode(
    mode: PosRunMode,
    storeName?: string,
    registerName?: string,
  ) {
    if (mode === PosRunMode.sales) {
      await this.page
        .locator('div')
        .filter({ hasText: /^ストアモード$/ })
        .click();
      await this.page.getByRole('button', { name: 'ログイン' }).click();
      //さらに店舗の選択がある
      await this.page.getByRole('combobox').first().click();
      await this.page.getByRole('option', { name: storeName }).click();
      await this.page.getByRole('combobox').nth(1).click();
      await this.page.getByRole('option', { name: registerName }).click();
      await this.page
        .getByRole('button', { name: 'MycalinksPOSを起動' })
        .click();
    } else if (mode === PosRunMode.admin) {
      await this.page
        .locator('div')
        .filter({ hasText: /^管理モード$/ })
        .click();
      await this.page.getByRole('button', { name: 'ログイン' }).click();
    }
  }
}
