import { Locator, Page, test } from '@playwright/test';
import { BasePage } from '../base/base.page';
import { LogsPage } from '../sidebar/logs.page';

export class StreamsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);

    this.pageTitle = page.locator('[data-test="log-stream-title-text"]');
    this.searchInput = page.getByPlaceholder(/search stream/i);
  }

  async waitForPage(): Promise<void> {
    await test.step('Wait for Streams page to load', async () => {
      await this.pageTitle.waitFor({ state: 'visible' });
    });
  }

  getStreamRow(streamName: string): Locator {
    return this.page.locator('tbody tr', {
      has: this.page.getByText(streamName, { exact: true }),
    });
  }

  async isStreamVisible(streamName: string): Promise<boolean> {
    return await test.step(`Check stream visible: ${streamName}`, async () => {
      const row = this.getStreamRow(streamName);
      return (await row.count()) > 0 && (await row.first().isVisible());
    });
  }

  async searchStream(streamName: string): Promise<void> {
    await test.step(`Search stream: ${streamName}`, async () => {
      await this.searchInput.fill(streamName);
      await this.page.waitForTimeout(1000);
    });
  }

  async clickExploreForStream(streamName: string): Promise<LogsPage> {
    await test.step(`Click Explore for stream: ${streamName}`, async () => {
      const row = this.getStreamRow(streamName);
      await row.getByText('search').click();
    });

    return new LogsPage(this.page);
  }
}