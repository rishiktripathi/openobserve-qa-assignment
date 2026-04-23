import { Locator, Page, test } from '@playwright/test';
import { BasePage } from '../base/base.page';
import { AlertsPage } from '../sidebar/alerts.page';
import { SettingsPage } from '../settings/settings.page';
import {StreamsPage} from '../sidebar/streams.page';
import { DashboardPage } from '../sidebar/dashboard.page';

export class HomePage extends BasePage {
    readonly mainNavigation: Locator;
  readonly alertsNavLink: Locator;
  readonly settingsIcon: Locator;
  readonly streamsNavLink: Locator;
  readonly dashboardsNavLink: Locator;

  constructor(page: Page) {
    super(page);
    this.mainNavigation = page.locator('[aria-label="Main navigation"]');
    this.alertsNavLink = this.mainNavigation.locator('[aria-label="Alerts"]');
    this.streamsNavLink = this.mainNavigation.locator('[aria-label="Streams"]');
    this.dashboardsNavLink = this.mainNavigation.locator('[aria-label="Dashboards - Current page"]');
    this.settingsIcon = page.locator('button[data-test="menu-link-settings-item"]');
  }

  async goToAlerts(): Promise<AlertsPage> {
    await test.step('Navigate to Alerts page from Home', async () => {
      await this.alertsNavLink.click();
    });

    return new AlertsPage(this.page);
  }
  
  async goToStreams(): Promise<StreamsPage> {
    await test.step('Navigate to Streams page', async () => {
        await this.streamsNavLink.click();
    });
    return new StreamsPage(this.page);
  }

  async goToDashboards(): Promise<DashboardPage> {
    await test.step('Navigate to Dashboards page', async () => {
      await this.dashboardsNavLink.click();
    });

    return new DashboardPage(this.page);
  }

  async goToSettings(): Promise<SettingsPage> {
    await test.step('Navigate to Settings page from Home', async () => {
      await this.settingsIcon.click();
    });

    return new SettingsPage(this.page);
  }
}