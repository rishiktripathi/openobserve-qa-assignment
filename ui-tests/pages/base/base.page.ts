import { Locator, Page, test, expect } from '@playwright/test';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  async waitForNetworkIdle(stepName = 'Wait for page to stabilize'): Promise<void> {
    await test.step(stepName, async () => {
      await this.page.waitForLoadState('networkidle');
    });
  }

  async click(locator: Locator, stepName: string): Promise<void> {
    await test.step(stepName, async () => {
      await locator.click();
    });
  }

  async fill(locator: Locator, value: string, stepName: string): Promise<void> {
    await test.step(stepName, async () => {
      await locator.fill(value);
    });
  }

  async validateSuccessToast(message: string): Promise<void> {
    await test.step(`Validate success toast: ${message}`, async () => {
      const toast = this.page.locator('.q-notification__message').filter({
        hasText: message,
      });

      await expect(toast).toBeVisible({ timeout: 5000 });
    });
  }
}