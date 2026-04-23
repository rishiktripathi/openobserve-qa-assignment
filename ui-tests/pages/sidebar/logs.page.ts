import { Locator, Page, test, expect } from '@playwright/test';
import { BasePage } from '../base/base.page';

export class LogsPage extends BasePage {
  readonly logsTable: Locator;
  readonly logsTableBody: Locator;
  readonly streamDropdown: Locator;

  constructor(page: Page) {
    super(page);

    this.logsTable = page.locator('[data-test="logs-search-result-logs-table"]');
    this.logsTableBody = page.locator('[data-test="logs-search-result-table-body"]');
    this.streamDropdown = page.locator('input, div').filter({ hasText: '' }).first();
  }

  async waitForPage(): Promise<void> {
    await test.step('Wait for Logs page to load', async () => {
      await this.logsTable.waitFor({ state: 'visible' });
    });
  }

  async waitForLogRow(): Promise<void> {
    await test.step('Wait for at least one log row', async () => {
      await expect(this.logsTableBody.locator('tr').first()).toBeVisible();
    });
  }

  async getFirstSourceText(): Promise<string> {
    return await test.step('Get first source cell text', async () => {
      const firstRow = this.logsTableBody.locator('tr').first();
      const sourceCell = firstRow.locator('[data-test^="log-table-column-"][data-test$="-source"]');
      return (await sourceCell.textContent())?.trim() || '';
    });
  }

  extractJsonFromSourceText(sourceText: string): Record<string, any> {
    const cleaned = sourceText.replace(/\s+/g, '');
    return JSON.parse(cleaned);
  }

  async validateAlertPayload(expected: {
    alertName: string;
    alertType: string;
    orgName: string;
    streamName: string;
  }): Promise<void> {
    await test.step('Validate destination stream payload format and values', async () => {
      const sourceText = await this.getFirstSourceText();
      const payload = this.extractJsonFromSourceText(sourceText);

      expect(payload).toHaveProperty('_timestamp');
      expect(payload).toHaveProperty('alert_name', expected.alertName);
      expect(payload).toHaveProperty('alert_type', expected.alertType);
      expect(payload).toHaveProperty('org_name', expected.orgName);
      expect(payload).toHaveProperty('stream_name', expected.streamName);
      expect(payload).toHaveProperty('timestamp');
    });
  }
}