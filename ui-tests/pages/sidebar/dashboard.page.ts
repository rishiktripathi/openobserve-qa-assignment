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
  readonly savePanelButton: Locator;

  readonly streamTypeDropdown: Locator;
  readonly streamDropdown: Locator;
  readonly tableChart: Locator;
  readonly dateTimeDropdown: Locator;

  readonly fieldsSection: Locator;
  readonly removeSelection: Locator;

  constructor(page: Page) {
    super(page);

    this.pageTitle = page.getByRole('heading', { name: 'dashboards' });
    this.newDashboardButton = page.getByRole('button', { name: 'new dashboard' });

    this.dashboardNameInput = page.locator('input[aria-label="Name *"]').first();
    this.dashboardDescriptionInput = page.locator('input[aria-label="Description"]').first();
    this.saveDashboardButton = page.getByRole('button', { name: 'Save' });

    this.addPanelButton = page.getByRole('button', { name: 'Add Panel' });
    this.savePanelButton = page.getByRole('button', { name: 'Save' });
    this.panelNameInput = page.locator('[aria-label="Name of Panel*"]');
    this.applyPanelButton = page.getByRole('button', { name: 'Apply' });

    this.streamTypeDropdown = page.locator('label').filter({ hasText: /stream type/i }).locator('..').locator('[role="combobox"]').first();
    this.streamDropdown = page.locator('[data-test="index-dropdown-stream"]');
    this.tableChart = page.locator('[data-test="selected-chart-table-item"]');
    this.dateTimeDropdown = page.locator('button').filter({ hasText: /past/i }).first();

    this.fieldsSection = page.locator('text=/search for a field/i').locator('..').locator('..');
    this.removeSelection = page.locator('[data-test="dashboard-x-item-x_axis_1-remove"]');
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
        await this.page.reload();
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

  async selectTable(): Promise<void> {
    await test.step(`Select Table chart`, async () => {
      await this.tableChart.click();
      await this.page.waitForLoadState('load');
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

  async removeDefaultSelectedRow(): Promise<void> {
    await test.step(`Remove default selected row`, async () => {
      await this.removeSelection.click();
    });
  }

  private getFieldRow(fieldName: string): Locator {
    return this.page.locator(`[data-test*="field-list-item"][title="${fieldName}"]`); 
}

  async addFieldToX(fieldName: string): Promise<void> {
    await test.step(`Add field to X: ${fieldName}`, async () => {
        const row = this.getFieldRow(fieldName);
        await expect(row).toBeVisible();
        await row.locator('[data-test="dashboard-add-x-data"]:not([disabled])').click();
    });
}

  async addFieldToY(fieldName: string): Promise<void> {
  await test.step(`Add field to Y: ${fieldName}`, async () => {
    const row = this.getFieldRow(fieldName);

    await expect(row).toBeVisible();

    await row.locator('[data-test="dashboard-add-y-data"]:not([disabled])').click();
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

  async savePanel(): Promise<void> {
    await test.step('Save panel', async () => {
      await this.savePanelButton.click();
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
      await this.selectTable();
      await this.selectStreamType(config.streamType);
      await this.selectStream(config.streamName);
      await this.removeDefaultSelectedRow();
      await this.addFieldToX(config.xField);
      await this.addFieldToY(config.yField);
      await this.applyPanel();
      await this.savePanel();
    });
  }

  async waitForPanelOnDashboard(panelName: string): Promise<void> {
    await test.step(`Wait for panel on dashboard: ${panelName}`, async () => {
      await expect(this.page.getByText(panelName, { exact: true })).toBeVisible();
    });
  }

  async validateTablePanelData(expected: Array<{ key: string; value: string }>): Promise<void> {
  await test.step('Validate dashboard table panel data', async () => {
    const tableBody = this.page.locator('.q-table__middle table tbody.q-virtual-scroll__content');
    for (const item of expected) {
      const row = tableBody.locator('tr').filter({
        has: this.page.locator('td').filter({ hasText: item.key }),
      }).first();

      await expect(row, `Missing row for key=${item.key}`).toBeVisible();
      await expect(row.locator('td').nth(0)).toContainText(item.key);
      await expect(row.locator('td').nth(1)).toContainText(item.value);
    }
  });
}
}