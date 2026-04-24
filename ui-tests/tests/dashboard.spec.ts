import { test } from '@playwright/test';
import { LoginPage } from '../pages/login/login.page';
import { HomePage } from '../pages/home/home.page';
import { DashboardPage } from '../pages/sidebar/dashboard.page';
import { OpenObserveApiHelper } from '../utils/api-helper';
import { PASSWORD, USERNAME } from '../utils/constants';
import { uniqueName } from '../utils/name-generator';

test.describe('Module 3 - Dashboard flow', () => {
  let streamName: string;
  let dashboardName: string;
  let panelName: string;

  let loginPage: LoginPage;
  let homePage: HomePage;
  let dashboardPage: DashboardPage;
  let apiHelper: OpenObserveApiHelper;

  test.beforeEach(async ({ page, request }) => {
    streamName = uniqueName('qa_logs');
    dashboardName = uniqueName('qa_dashboard');
    panelName = uniqueName('qa_panel');

    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
    dashboardPage = new DashboardPage(page);
    apiHelper = new OpenObserveApiHelper(request);

    await loginPage.goto();
    await loginPage.login(USERNAME, PASSWORD);

    // Seed stream before dashboard creation so stream is available in panel builder
    await apiHelper.ingestLogs(streamName, [
      {
        level: 'info',
        user_id: 'u001',
        message: 'User logged in',
      },
      {
        level: 'info',
        user_id: 'u002',
        message: 'Order placed',
      },
      {
        level: 'error',
        code: 500,
        message: 'Payment failed',
      },
    ]);
  });

  test('User should create dashboard and validate panel data from ingested stream', async () => {
    dashboardPage = await homePage.goToDashboards();
    await dashboardPage.waitForListPage();

    await dashboardPage.clickNewDashboard();
    await dashboardPage.createDashboard(dashboardName, 'Dashboard created through Playwright automation');

    await dashboardPage.waitForDashboardDetailsPage(dashboardName);
    await dashboardPage.clickAddPanel();
    await dashboardPage.waitForAddPanelPage();

    await dashboardPage.createTablePanel({ panelName, streamType: 'logs', streamName, xField: 'level', yField: 'user_id', });
    await dashboardPage.waitForPanelOnDashboard(panelName);

    await dashboardPage.validateTablePanelData([
      { key: 'info', value: '2.00' },
      { key: 'error', value: '0.00' },
    ]);
  });
});