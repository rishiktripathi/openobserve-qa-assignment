import { test, expect } from '@playwright/test';
import type {Locator, Page} from "@playwright/test";
import { BasePage } from '../base/base.page';

export class PipelinePage extends BasePage {
  readonly pageTitle: Locator;
  readonly newPipelineButton: Locator;
  readonly pipelineNameInput: Locator;
  readonly saveButton: Locator;
  readonly confirmButton: Locator;

  readonly canvas: Locator;
  readonly sourceNode: Locator;
  readonly outputNodes: Locator;
  readonly sourceOutputHandle: Locator;
  readonly destinationInputHandle: Locator;
  readonly outputDeleteButton: Locator;
  readonly sourceStreamPaletteNode: Locator;
  readonly destinationStreamPaletteNode: Locator;

  readonly associateStreamTitle: Locator;
  readonly streamTypeDropdown: Locator;
  readonly streamNameDropdown: Locator;
  readonly inputNodeSaveButton: Locator;
  readonly associateSaveButton: Locator;
  readonly associateDeleteButton: Locator;

  constructor(page: Page) {
    super(page);

    this.pageTitle = page.getByRole('heading', { name: 'Pipelines' });
    this.newPipelineButton = page.getByRole('button', { name: 'New pipeline' });
    this.pipelineNameInput = page.getByPlaceholder('Enter Pipeline Name');
    this.saveButton = page.getByRole('button', { name: 'Save' }).last();
    this.confirmButton = page.locator('[data-test="confirm-button"]');
    this.canvas = page.locator('.vue-flow__pane').first();
    this.sourceNode = page.locator('[data-test="pipeline-node-input-stream-node"]');
    this.outputNodes = page.locator('[data-test="pipeline-node-output-stream-node"]');
    this.sourceOutputHandle = page.locator('[data-test="pipeline-node-input-output-handle"]');
    this.destinationInputHandle = page.locator('[data-test="pipeline-node-output-input-handle"]');
    this.outputDeleteButton = page.locator('[data-test="pipeline-node-output-delete-btn"]');
    this.sourceStreamPaletteNode = page.locator('button.o2vf_node_input', {hasText: 'Stream'});
    this.destinationStreamPaletteNode = page.locator('button.o2vf_node_output', {hasText: 'Stream'});

    this.associateStreamTitle = page.locator('.stream-routing-title');
    this.streamTypeDropdown = page.locator('label').filter({ hasText: /stream type/i }).locator('..').locator('[role="combobox"]').first();
    this.streamNameDropdown = page.locator('label').filter({ hasText: /stream name/i }).locator('..').locator('[role="combobox"]').first();
    this.inputNodeSaveButton = page.locator('input-node-stream-save-btn');
    this.associateSaveButton = page.getByRole('button', { name: /^save$/i }).last();
    this.associateDeleteButton = page.getByRole('button', { name: /delete/i });
  }

  async waitForListPage(): Promise<void> {
    await test.step('Wait for Pipeline list page', async () => {
      await expect(this.newPipelineButton).toBeVisible();
    });
  }

  async clickNewPipeline(): Promise<void> {
    await test.step('Click New Pipeline', async () => {
      await this.newPipelineButton.click();
    });
  }

  async waitForBuilderPage(): Promise<void> {
    await test.step('Wait for Pipeline builder page', async () => {
      await expect(this.pipelineNameInput).toBeVisible();
      await expect(this.saveButton).toBeVisible();
    });
  }

  async fillPipelineName(pipelineName: string): Promise<void> {
    await test.step(`Fill pipeline name: ${pipelineName}`, async () => {
      await this.pipelineNameInput.fill(pipelineName);
    });
  }

  private async waitForStableLocator(locator: Locator): Promise<void> {
  await expect(locator).toBeVisible();

  let previousBox = await locator.boundingBox();

  for (let i = 0; i < 10; i++) {
    await this.page.waitForTimeout(100);
    const currentBox = await locator.boundingBox();

    if (
      previousBox &&
      currentBox &&
      Math.abs(previousBox.x - currentBox.x) < 1 &&
      Math.abs(previousBox.y - currentBox.y) < 1
    ) {
      return;
    }

    previousBox = currentBox;
  }

  throw new Error('Locator position did not stabilize');
}

  async dragNodeToCanvas(node: Locator, xOffset: number, yOffset: number): Promise<void> {
  await test.step('Drag node to pipeline canvas', async () => {
    await expect(node).toBeVisible();
    await expect(this.canvas).toBeVisible();

    const nodeBox = await node.boundingBox();
    const canvasBox = await this.canvas.boundingBox();

    if (!nodeBox || !canvasBox) {
      throw new Error('Node or canvas bounding box not found');
    }

    const startX = nodeBox.x + nodeBox.width / 2;
    const startY = nodeBox.y + nodeBox.height / 2;

    const endX = canvasBox.x + xOffset;
    const endY = canvasBox.y + yOffset;

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, endY, { steps: 30 });
    await this.page.mouse.up();
  });
}

  async dragSourceStreamNode(): Promise<void> {
  await test.step('Drag Source Stream node to canvas', async () => {
    await this.dragNodeToCanvas(this.sourceStreamPaletteNode, 150, 120);
    await expect(this.associateStreamTitle).toBeVisible();
  });
}

  async dragDestinationStreamNode(): Promise<void> {
  await test.step('Drag Destination Stream node to canvas', async () => {
    await this.dragNodeToCanvas(this.destinationStreamPaletteNode, 250, 350);
    await expect(this.associateStreamTitle).toBeVisible();
  });
}

  async selectAssociatedStream(streamType: string, streamName: string): Promise<void> {
    await test.step(`Associate stream type=${streamType}, stream=${streamName}`, async () => {
      await this.streamTypeDropdown.click();
      await this.page.getByRole('option', { name: new RegExp(streamType, 'i') }).click();

      await this.streamNameDropdown.click();
      await this.streamNameDropdown.fill(streamName);
      await this.page.getByRole('option', { name: new RegExp(streamName, 'i') }).click();

      await this.associateSaveButton.click();
      await this.page.waitForLoadState('domcontentloaded');
    });
  }

  async removeDefaultDestinationIfPresent(): Promise<void> {
  await test.step('Remove default destination node if present', async () => {
    const outputNodeCount = await this.outputNodes.count();

    if (outputNodeCount === 0) {
      return;
    }

    const defaultOutputNode = this.outputNodes.first();

    await defaultOutputNode.hover();

    const deleteButton = this.outputDeleteButton.first();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();
    await expect(this.confirmButton).toBeVisible();
    await this.confirmButton.click();

    await expect(defaultOutputNode).toBeHidden();
  });
}

  async connectSourceToDestination(): Promise<void> {
  await test.step('Connect source stream node to destination stream node', async () => {
    const sourceHandle = this.sourceOutputHandle.first();
    const destinationHandle = this.destinationInputHandle.first();

    await this.waitForStableLocator(sourceHandle);
    await this.waitForStableLocator(destinationHandle);

    await expect(sourceHandle).toBeVisible();
    await expect(destinationHandle).toBeVisible();
    const sourceBox = await sourceHandle.boundingBox();
    const destinationBox = await destinationHandle.boundingBox();
    if (!sourceBox || !destinationBox) {
      throw new Error('Source or destination handle bounding box not found');
    }

    await this.page.mouse.move(sourceBox.x + sourceBox.width / 2,sourceBox.y + sourceBox.height / 2, {steps:10});

    await this.page.mouse.down();

    await this.page.mouse.move(destinationBox.x + destinationBox.width / 2,destinationBox.y + destinationBox.height / 2,{ steps: 30 });

    await this.page.mouse.up();

    await expect(this.page.locator('.vue-flow__edge')).toBeVisible();
  });
}

  async savePipeline(): Promise<void> {
    await test.step('Save pipeline', async () => {
      await this.saveButton.click();
    });
  }

  async createRealtimePipeline(config: {pipelineName: string;sourceStreamName: string;destinationStreamName: string;}): Promise<void> {
    await test.step(`Create realtime pipeline: ${config.pipelineName}`, async () => {
      await this.fillPipelineName(config.pipelineName);

      await this.dragSourceStreamNode();
      await this.selectAssociatedStream('logs', config.sourceStreamName);
      await this.removeDefaultDestinationIfPresent();
      await this.dragDestinationStreamNode();
      await this.selectAssociatedStream('logs', config.destinationStreamName);
      //await this.page.pause();
      await this.connectSourceToDestination();
      await this.savePipeline();
    });
  }

  getPipelineRow(pipelineName: string): Locator {
    return this.page.locator('tbody tr', {
      has: this.page.getByText(pipelineName, { exact: true }),
    });
  }

  async waitForPipelineInList(pipelineName: string): Promise<void> {
    await test.step(`Wait for pipeline in list: ${pipelineName}`, async () => {
      await expect(this.getPipelineRow(pipelineName)).toBeVisible();
    });
  }
}