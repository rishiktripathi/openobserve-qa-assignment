import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login/login.page';
import { HomePage } from '../pages/home/home.page';
import { PipelinePage } from '../pages/sidebar/pipeline.page';
import { StreamsPage } from '../pages/sidebar/streams.page';
import { LogsPage } from '../pages/sidebar/logs.page';
import { OpenObserveApiHelper } from '../utils/api-helper';
import { PASSWORD, USERNAME } from '../utils/constants';
import { uniqueName } from '../utils/name-generator';

test.describe('Module 4 - Pipeline flow', () => {
  let sourceStreamName: string;
  let destinationStreamName: string;
  let pipelineName: string;

  let loginPage: LoginPage;
  let homePage: HomePage;
  let pipelinePage: PipelinePage;
  let streamsPage: StreamsPage;
  let logsPage: LogsPage;
  let apiHelper: OpenObserveApiHelper;

  test.beforeEach(async ({ page, request }) => {
    sourceStreamName = uniqueName('qa_pipeline_src');
    destinationStreamName = uniqueName('qa_pipeline_dest');
    pipelineName = uniqueName('qa_pipeline');

    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
    pipelinePage = new PipelinePage(page);
    streamsPage = new StreamsPage(page);
    logsPage = new LogsPage(page);
    apiHelper = new OpenObserveApiHelper(request);

    await loginPage.goto();
    await loginPage.login(USERNAME, PASSWORD);

    // Create source stream
    await apiHelper.ingestLogs(sourceStreamName, [
      {
        message: 'seed source stream',
        level: 'info',
        user_id: 'u_seed_src',
      },
    ]);

    // Create destination stream
    await apiHelper.ingestLogs(destinationStreamName, [
      {
        message: 'seed destination stream',
        level: 'info',
        user_id: 'u_seed_dest',
      },
    ]);
  });

  test('User should create pipeline and route source data to destination stream', async () => {
    pipelinePage = await homePage.goToPipelines();
    await pipelinePage.waitForListPage();

    await pipelinePage.clickNewPipeline();
    await pipelinePage.waitForBuilderPage();

    await pipelinePage.createRealtimePipeline({
      pipelineName,
      sourceStreamName,
      destinationStreamName,
    });

    await pipelinePage.waitForListPage();
    await pipelinePage.waitForPipelineInList(pipelineName);

    const pipelinePayload = [
      {
        message: 'pipeline validation message',
        level: 'error',
        user_id: 'u_pipeline_001',
        module: 'pipeline_test',
      },
    ];

    await apiHelper.ingestLogs(sourceStreamName, pipelinePayload);

    // give pipeline a moment to process
    await expect.poll(
      async () => {
        const response = await apiHelper.searchLogs(destinationStreamName);
        return response.hits?.some((item: any) => item.message === 'pipeline validation message');
      },
      {
        timeout: 15000,
        intervals: [1000, 2000, 3000],
      }
    ).toBeTruthy();

    streamsPage = await homePage.goToStreams();
    await streamsPage.waitForPage();
    await streamsPage.searchStream(destinationStreamName);

    expect(await streamsPage.isStreamVisible(destinationStreamName)).toBe(true);

    logsPage = await streamsPage.clickExploreForStream(destinationStreamName);
    await logsPage.waitForPage();
    await logsPage.waitForLogRow();

    const sourceText = await logsPage.getFirstSourceText();
    expect(sourceText).toContain('pipeline validation message');
    expect(sourceText).toContain('u_pipeline_001');
    expect(sourceText).toContain('pipeline_test');
  });
});