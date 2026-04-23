import { Locator, Page, test } from '@playwright/test';
import { BasePage } from '../base/base.page';

export class AlertDestinationsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly newDestinationButton: Locator;

  readonly customDestinationCard: Locator;
  readonly webHookTab: Locator;

  readonly destinationNameInput: Locator;
  readonly templateSelect: Locator;
  readonly urlInput: Locator;
  readonly methodSelect: Locator;

  readonly headerKeyInput: Locator;
  readonly headerValueInput: Locator;
  readonly addHeaderButton: Locator;

  readonly skipTlsVerifyToggle: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);

    this.pageTitle = page.locator('[data-test="alert-destinations-list-title"]');
    this.newDestinationButton = page.getByRole('button', { name: 'New destination' });

    this.customDestinationCard = page.locator('[data-test="destination-type-card"][data-type="custom"]');
    this.webHookTab = page.locator('[data-test="tab-http"]');

    this.destinationNameInput = page.locator('[data-test="add-destination-name-input"]');
    this.templateSelect = page.locator('[data-test="add-destination-template-select"]');
    this.urlInput = page.locator('[data-test="add-destination-url-input"]');
    this.methodSelect = page.locator('[data-test="add-destination-method-select"]');

    this.headerKeyInput = page.locator('[data-test="add-destination-header--key-input"]');
    this.headerValueInput = page.locator('[data-test="add-destination-header-Authorization-value-input"]');
    this.addHeaderButton = page.locator('[data-test="add-destination-add-header-btn"]');

    this.skipTlsVerifyToggle = page.locator('[data-test="add-destination-skip-tls-verify-toggle"]');
    this.saveButton = page.locator('[data-test="add-destination-submit-btn"]');
  }

  async waitForPage(): Promise<void> {
    await test.step('Wait for Alert Destinations page to load', async () => {
      await this.pageTitle.waitFor({ state: 'visible' });
    });
  }

  async clickNewDestination(): Promise<void> {
    await test.step('Click New destination button', async () => {
      await this.newDestinationButton.click();
    });
  }

  async selectCustomDestination(): Promise<void> {
    await test.step('Select Custom Destination type', async () => {
      await this.customDestinationCard.click();
    });
  }

  async selectWebHookTab(): Promise<void> {
    await test.step('Select Web Hook tab', async () => {
      await this.webHookTab.click();
    });
  }

  async fillDestinationName(destinationName: string): Promise<void> {
    await test.step(`Fill destination name: ${destinationName}`, async () => {
      await this.destinationNameInput.fill(destinationName);
    });
  }

  async selectTemplate(templateName: string): Promise<void> {
    await test.step(`Select template: ${templateName}`, async () => {
      await this.templateSelect.click();
      await this.page.getByRole('option', { name: new RegExp(templateName, 'i') }).click();
    });
  }

  async fillDestinationUrl(destinationUrl: string): Promise<void> {
    await test.step(`Fill destination URL: ${destinationUrl}`, async () => {
      await this.urlInput.fill(destinationUrl);
    });
  }

  async selectMethod(method: string = 'post'): Promise<void> {
    await test.step(`Select destination method: ${method}`, async () => {
      await this.methodSelect.click();
      await this.page.getByRole('option', { name: new RegExp(method, 'i') }).click();
    });
  }

  async addHeader(key: string, value: string): Promise<void> {
    await test.step(`Add header: ${key}`, async () => {
      await this.headerKeyInput.fill(key);
      await this.headerValueInput.fill(value);
    });
  }

  async clickAddHeaderButton(key: string, value: string): Promise<void> {
    await test.step(`Click Add Header Button`, async () => {
      await this.addHeaderButton.click();
    });
  }

  async clickSave(): Promise<void> {
    await test.step('Click Save button on Destination form', async () => {
      await this.saveButton.click();
    });
  }

  async createDestination(destinationName: string,templateName: string,destinationUrl: string): Promise<void> {
    await test.step(`Create destination: ${destinationName}`, async () => {
      await this.selectCustomDestination();
      await this.selectWebHookTab();
      await this.fillDestinationName(destinationName);
      await this.selectTemplate(templateName);
      await this.fillDestinationUrl(destinationUrl);
      await this.addHeader('Authorization','Basic cm9vdEBleGFtcGxlLmNvbTpDb21wbGV4cGFzcyMxMjM=');
      await this.clickSave();
    });
  }

  async isDestinationVisible(destinationName: string): Promise<boolean> {
    return await test.step(`Check whether destination is visible: ${destinationName}`, async () => {
      return (await this.page.getByText(destinationName, { exact: true }).count()) > 0;
    });
  }
}