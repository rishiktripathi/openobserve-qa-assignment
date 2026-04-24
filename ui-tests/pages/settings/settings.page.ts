import { Locator, Page, test } from '@playwright/test';
import { BasePage } from '../base/base.page';
import { TemplatesPage } from '../settings/templates.page';
import { AlertDestinationsPage } from '../settings/alert-destinations.page';

export class SettingsPage extends BasePage {
  readonly templatesMenuItem: Locator;
  readonly alertDestinationsMenuItem: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);

    this.pageTitle = page.locator('.general-page-title');
    this.templatesMenuItem = page.getByText('Templates', { exact: true });
    this.alertDestinationsMenuItem = page.getByText('Alert Destinations', { exact: true });
  }

  async waitForPage(): Promise<void> {
    await test.step('Wait for Settings page to load', async () => {
      await this.pageTitle.waitFor({ state: 'visible' });
    });
  }

  async goToTemplates(): Promise<TemplatesPage> {
    await test.step('Open Templates page from Settings', async () => {
      await this.templatesMenuItem.click();
    });
    return new TemplatesPage(this.page);
  }

  async goToAlertDestinations(): Promise<AlertDestinationsPage> {
    await test.step('Open Alert Destinations page from Settings', async () => {
      await this.alertDestinationsMenuItem.click();
    });

    return new AlertDestinationsPage(this.page);
  }
}