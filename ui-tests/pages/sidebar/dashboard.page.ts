import { Locator, Page, test, expect } from '@playwright/test';
import { BasePage } from '../base/base.page';

export class DashboardPage extends BasePage {
  readonly pageTitle: Locator;
  readonly newDashboardButton: Locator;
  readonly dashboardNameInput: Locator;
  readonly dashboardDescriptionInput: Locator;
  readonly saveDashboardButton: Locator;

  readonly addPanelButton: Locator;
  readonly panelNameInput: Locator;
  readonly applyPanelButton: Locator;

  readonly streamTypeDropdown: Locator;
  readonly streamDropdown: Locator;
  readonly dateTimeDropdown: Locator;

  readonly fieldsSection: Locator;

  constructor(page: Page) {
    super(page);

    this.pageTitle = page.getByRole('heading', { name: /dashboards|add panel/i });
    this.newDashboardButton = page.getByRole('button', { name: /new dashboard/i });

    this.dashboardNameInput = page.locator('input[aria-label="Name *"], input').first();
    this.dashboardDescriptionInput = page.locator('input[aria-label="Description"], textarea').first();
    this.saveDashboardButton = page.getByRole('button', { name: /^save$/i });

    this.addPanelButton = page.getByRole('button', { name: /add panel/i });
    this.panelNameInput = page.getByPlaceholder(/name of panel/i);
    this.applyPanelButton = page.getByRole('button', { name: /^apply$/i });

    this.streamTypeDropdown = page.locator('label').filter({ hasText: /stream type/i }).locator('..').locator('[role="combobox"]').first();
    this.streamDropdown = page.locator('label').filter({ hasText: /^stream$/i }).locator('..').locator('[role="combobox"]').first();
    this.dateTimeDropdown = page.locator('button').filter({ hasText: /past/i }).first();

    this.fieldsSection = page.locator('text=/search for a field/i').locator('..').locator('..');
  }

  async waitForListPage(): Promise<void> {
    await test.step('Wait for Dashboard list page', async () => {
      await expect(this.newDashboardButton).toBeVisible();
    });
  }

  async clickNewDashboard(): Promise<void> {
    await test.step('Click New Dashboard', async () => {
      await this.newDashboardButton.click();
    });
  }

  async createDashboard(dashboardName: string, description = ''): Promise<void> {
    await test.step(`Create dashboard: ${dashboardName}`, async () => {
      await this.dashboardNameInput.fill(dashboardName);

      if (description) {
        await this.dashboardDescriptionInput.fill(description);
      }

      await this.saveDashboardButton.click();
    });
  }

  async waitForDashboardDetailsPage(dashboardName: string): Promise<void> {
    await test.step(`Wait for dashboard details page: ${dashboardName}`, async () => {
      await expect(this.page.getByText(dashboardName, { exact: true })).toBeVisible();
      await expect(this.addPanelButton).toBeVisible();
    });
  }

  async clickAddPanel(): Promise<void> {
    await test.step('Click Add Panel', async () => {
      await this.addPanelButton.click();
    });
  }

  async waitForAddPanelPage(): Promise<void> {
    await test.step('Wait for Add Panel page', async () => {
      await expect(this.panelNameInput).toBeVisible();
      await expect(this.applyPanelButton).toBeVisible();
    });
  }

  async fillPanelName(panelName: string): Promise<void> {
    await test.step(`Fill panel name: ${panelName}`, async () => {
      await this.panelNameInput.fill(panelName);
    });
  }

  async selectTimeRange(label: string): Promise<void> {
    await test.step(`Select time range: ${label}`, async () => {
      await this.dateTimeDropdown.click();
      await this.page.getByRole('option', { name: new RegExp(label, 'i') }).click();
    });
  }

  async selectStreamType(streamType: string): Promise<void> {
    await test.step(`Select stream type: ${streamType}`, async () => {
      await this.streamTypeDropdown.click();
      await this.page.getByRole('option', { name: new RegExp(streamType, 'i') }).click();
    });
  }

  async selectStream(streamName: string): Promise<void> {
    await test.step(`Select stream: ${streamName}`, async () => {
      await this.streamDropdown.click();
      await this.page.getByRole('option', { name: new RegExp(streamName, 'i') }).click();
    });
  }

  private getFieldRow(fieldName: string): Locator {
    return this.page.locator('div').filter({ hasText: new RegExp(`^${fieldName}$`) }).locator('..');
  }

  async addFieldToX(fieldName: string): Promise<void> {
    await test.step(`Add field to X: ${fieldName}`, async () => {
      const row = this.getFieldRow(fieldName);
      await row.getByText('+X', { exact: true }).click();
    });
  }

  async addFieldToY(fieldName: string): Promise<void> {
    await test.step(`Add field to Y: ${fieldName}`, async () => {
      const row = this.getFieldRow(fieldName);
      await row.getByText('+Y', { exact: true }).click();
    });
  }

  async addFieldToB(fieldName: string): Promise<void> {
    await test.step(`Add field to Breakdown: ${fieldName}`, async () => {
      const row = this.getFieldRow(fieldName);
      await row.getByText('+B', { exact: true }).click();
    });
  }

  async addFieldToF(fieldName: string): Promise<void> {
    await test.step(`Add field to Filter: ${fieldName}`, async () => {
      const row = this.getFieldRow(fieldName);
      await row.getByText('+F', { exact: true }).click();
    });
  }

  async applyPanel(): Promise<void> {
    await test.step('Apply panel', async () => {
      await this.applyPanelButton.click();
    });
  }

  async createTablePanel(config: {
    panelName: string;
    streamType: string;
    streamName: string;
    xField: string;
    yField: string;
    timeRange?: string;
  }): Promise<void> {
    await test.step(`Create dashboard panel: ${config.panelName}`, async () => {
      await this.fillPanelName(config.panelName);

      if (config.timeRange) {
        await this.selectTimeRange(config.timeRange);
      }

      await this.selectStreamType(config.streamType);
      await this.selectStream(config.streamName);

      await this.addFieldToX(config.xField);
      await this.addFieldToY(config.yField);

      await this.applyPanel();
    });
  }

  async waitForPanelOnDashboard(panelName: string): Promise<void> {
    await test.step(`Wait for panel on dashboard: ${panelName}`, async () => {
      await expect(this.page.getByText(panelName, { exact: true })).toBeVisible();
    });
  }

  async validateTablePanelData(expected: Array<{ key: string; value: string }>): Promise<void> {
    await test.step('Validate dashboard table panel data', async () => {
      for (const row of expected) {
        await expect(this.page.getByText(row.key, { exact: true })).toBeVisible();
        await expect(this.page.getByText(row.value, { exact: true })).toBeVisible();
      }
    });
  }
}