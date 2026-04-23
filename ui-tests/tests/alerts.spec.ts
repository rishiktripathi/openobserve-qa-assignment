import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login/login.page';
import { HomePage } from '../pages/home/home.page';
import { SettingsPage } from '../pages/settings/settings.page';
import { TemplatesPage } from '../pages/settings/templates.page';
import { AlertDestinationsPage } from '../pages/settings/alert-destinations.page';
import { AlertsPage } from '../pages/sidebar/alerts.page';
import { StreamsPage } from '../pages/sidebar/streams.page';
import { LogsPage } from '../pages/sidebar/logs.page';
import { OpenObserveApiHelper } from '../utils/api-helper';
import { PASSWORD, USERNAME } from '../utils/constants';
import { uniqueName } from '../utils/name-generator';

test.describe('Module 2 - Real-time alert flow', () => {
  let sourceStreamName: string;
  let destinationStreamName: string;
  let templateName: string;
  let destinationName: string;
  let alertName: string;
  let destinationUrl: string;

  let loginPage: LoginPage;
  let homePage: HomePage;
  let settingsPage: SettingsPage;
  let templatesPage: TemplatesPage;
  let alertDestinationsPage: AlertDestinationsPage;
  let alertsPage: AlertsPage;
  let streamsPage: StreamsPage;
  let logsPage: LogsPage;
  let apiHelper: OpenObserveApiHelper;

  test.beforeEach(async ({ page, request }) => {
    sourceStreamName = uniqueName('qa_logs');
    destinationStreamName = uniqueName('qa_alert_destination');
    templateName = uniqueName('qa_template');
    destinationName = uniqueName('qa_dest');
    alertName = uniqueName('qa_alert');
    destinationUrl = `http://localhost:5080/api/default/${destinationStreamName}/_json`;

    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
    settingsPage = new SettingsPage(page);
    templatesPage = new TemplatesPage(page);
    alertDestinationsPage = new AlertDestinationsPage(page);
    alertsPage = new AlertsPage(page);
    streamsPage = new StreamsPage(page);
    logsPage = new LogsPage(page);
    apiHelper = new OpenObserveApiHelper(request);

    await loginPage.goto();
    await loginPage.login(USERNAME, PASSWORD);

    // seed source stream so it appears in UI dropdowns
    await apiHelper.ingestLogs(sourceStreamName, [
      {
        level: 'info',
        message: 'seed log for stream creation',
        source: 'automation-seed',
      },
    ]);
  });

  test('should create real-time alert and validate payload in destination stream', async () => {
    const templateBody = `[{"alert_name": "{alert_name}","alert_type": "{alert_type}","org_name": "{org_name}","stream_name": "{stream_name}","timestamp": "{timestamp}"}]`;

    // create template
    settingsPage = await homePage.goToSettings();
    await settingsPage.waitForPage();

    templatesPage = await settingsPage.goToTemplates();
    await templatesPage.waitForPage();
    await templatesPage.clickAddTemplate();
    await templatesPage.createTemplate(templateName, templateBody);

    // create destination
    alertDestinationsPage = await settingsPage.goToAlertDestinations();
    await alertDestinationsPage.waitForPage();
    await alertDestinationsPage.clickNewDestination();
    await alertDestinationsPage.createDestination(destinationName,templateName,destinationUrl);

    // create alert
    alertsPage = await homePage.goToAlerts();
    await alertsPage.waitForPage();

    await alertsPage.createRealTimeAlert({
      alertName,
      streamType: 'logs',
      streamName: sourceStreamName,
      conditionColumn: 'level',
      conditionOperator: '=',
      conditionValue: 'error',
      cooldownMinutes: '0',
      destinationName,
      templateName,
      description: 'Real-time alert validation for destination stream',
      rowTemplate: 'Alert fired for {stream_name} at {timestamp}',
    });

    await alertsPage.waitForAlertInList(alertName);

    // ingest matching log to trigger alert
    await apiHelper.ingestLogs(sourceStreamName, [
      {
        level: 'error',
        message: 'payment failed',
        code: 500,
      },
    ]);

    // wait briefly for real-time alert processing
    await test.step('Wait for alert payload to be generated in destination stream', async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    });

    // verify destination stream exists in Streams
    streamsPage = await homePage.goToStreams();
    await streamsPage.waitForPage();
    await streamsPage.searchStream(destinationStreamName);

    await expect(await streamsPage.isStreamVisible(destinationStreamName)).toBe(true);

    // explore destination stream
    logsPage = await streamsPage.clickExploreForStream(destinationStreamName);
    await logsPage.waitForPage();
    await logsPage.waitForLogRow();

    // validate payload structure and data
    await logsPage.validateAlertPayload({
      alertName,
      alertType: 'realtime',
      orgName: 'default',
      streamName: sourceStreamName,
    });
  });
});