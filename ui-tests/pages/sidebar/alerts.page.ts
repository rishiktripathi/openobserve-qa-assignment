import { Locator, Page, test } from '@playwright/test';
import { BasePage } from '../base/base.page';
import { AlertDestinationsPage } from '../settings/alert-destinations.page';

type RealTimeAlertConfig = {
  alertName: string;
  streamType: string;
  streamName: string;
  conditionColumn: string;
  conditionOperator: string;
  conditionValue: string;
  cooldownMinutes: string;
  destinationName: string;
  templateName: string;
  description?: string;
  rowTemplate?: string;
};

export class AlertsPage extends BasePage {
  readonly pageTitle: Locator;
  readonly newAlertButton: Locator;

  readonly emptyStateCreateDestinationButton: Locator;
  readonly noDestinationMessage: Locator;

  readonly alertNameInput: Locator;
  readonly folderDropdown: Locator;
  readonly streamTypeDropdown: Locator;
  readonly streamNameDropdown: Locator;

  readonly scheduledAlertRadio: Locator;
  readonly realTimeAlertRadio: Locator;

  readonly continueButton: Locator;
  readonly backButton: Locator;
  readonly saveButton: Locator;

  readonly conditionTab: Locator;
  readonly conditionColumnInput: Locator;
  readonly conditionOperatorSelect: Locator;
  readonly conditionValueInput: Locator;

  readonly cooldownInput: Locator;
  readonly destinationCombobox: Locator;
  readonly templateOverrideCombobox: Locator;
  readonly addNewDestinationButton: Locator;

  readonly descriptionTextArea: Locator;
  readonly rowTemplateTextArea: Locator;

  constructor(page: Page) {
    super(page);

    this.pageTitle = page.locator('[data-test="alert-list-title"]');
    this.newAlertButton = page.getByRole('button', { name: 'New alert' });

    this.emptyStateCreateDestinationButton = page.getByRole('button', { name: /create destination/i, });
    this.noDestinationMessage = page.getByText(/it looks like you haven't created any destinations yet/i);

    this.alertNameInput = page.locator('[data-test="add-alert-name-input"]');
    this.folderDropdown = page.locator('[data-test="alerts-index-dropdown-stream_type"]');
    this.streamTypeDropdown = page.locator('[data-test="add-alert-stream-type-select-dropdown"]');
    this.streamNameDropdown = page.locator('[data-test="add-alert-stream-name-select-dropdown"]');

    this.scheduledAlertRadio = page.locator('[data-test="add-alert-scheduled-alert-radio"]');
    this.realTimeAlertRadio = page.locator('[data-test="add-alert-realtime-alert-radio"]');

    this.continueButton = page.getByRole('button', { name: /^continue$/i });
    this.backButton = page.getByRole('button', { name: /^back$/i });
    this.saveButton = page.getByRole('button', { name: /^save$/i });

    this.conditionTab = page.getByRole('button', { name: 'Condition' }).first();
    this.conditionColumnInput = page.locator('[data-test="alert-conditions-select-column"] input');
    this.conditionOperatorSelect = page.locator('[data-test="alert-conditions-operator-select"]');
    this.conditionValueInput = page.locator('[data-test="alert-conditions-value-input"] input');

    this.cooldownInput = page.locator('input[type="number"]').first();
    this.destinationCombobox = page.locator('.destinations-select-field input[role="combobox"]');
    this.templateOverrideCombobox = page.locator('.template-select-field input[role="combobox"]');
    this.addNewDestinationButton = page.locator('[data-test="create-destination-btn"]');

    this.descriptionTextArea = page.locator('textarea[placeholder="Type something"]');
    this.rowTemplateTextArea = page.locator('[data-test="add-alert-row-input-textarea"]');
  }

  async waitForPage(): Promise<void> {
    await test.step('Wait for Alerts page to load', async () => {
      await this.newAlertButton.or(this.emptyStateCreateDestinationButton).waitFor({
        state: 'visible',
      });
    });
  }

  async isCreateDestinationVisible(): Promise<boolean> {
    return await test.step('Check whether Create Destination CTA is visible', async () => {
      const count = await this.emptyStateCreateDestinationButton.count();
      if (count === 0) {
        return false;
      }
      return await this.emptyStateCreateDestinationButton.first().isVisible();
    });
  }

  async clickCreateDestinationFromEmptyState(): Promise<AlertDestinationsPage> {
    await test.step('Click Create Destination from Alerts empty state', async () => {
      await this.emptyStateCreateDestinationButton.click();
    });

    return new AlertDestinationsPage(this.page);
  }

  async clickNewAlert(): Promise<void> {
    await test.step('Click New Alert button', async () => {
      await this.newAlertButton.click();
    });
  }

  async fillAlertName(name: string): Promise<void> {
    await test.step(`Fill alert name: ${name}`, async () => {
      await this.alertNameInput.fill(name);
    });
  }

  async selectStreamType(streamType: string): Promise<void> {
    await test.step(`Select stream type: ${streamType}`, async () => {
      await this.streamTypeDropdown.click();
      await this.page.getByRole('option', { name: new RegExp(streamType, 'i') }).click();
    });
  }

  async selectStreamName(streamName: string): Promise<void> {
    await test.step(`Select stream name: ${streamName}`, async () => {
      await this.streamNameDropdown.click();
      await this.streamNameDropdown.fill(streamName);
      await this.page.getByRole('option', { name: new RegExp(streamName, 'i') }).click();
    });
  }

  async selectRealTimeAlert(): Promise<void> {
    await test.step('Select Real-Time Alert only', async () => {
      await this.realTimeAlertRadio.click();
    });
  }

  async continueToNextStep(stepName: string): Promise<void> {
    await test.step(stepName, async () => {
      await this.continueButton.click();
    });
  }

  async clickCondition(): Promise<void> {
    await test.step("Click Condition", async () => {
      await this.conditionTab.click();
    });
  }

  async setSimpleCondition(column: string, operator: string, value: string): Promise<void> {
    await test.step(`Set condition: ${column} ${operator} ${value}`, async () => {
      await this.conditionColumnInput.fill(column);
      await this.page.getByRole('option', { name: new RegExp(column, 'i') }).click();

      await this.conditionOperatorSelect.click();
      await this.page.getByRole('option', { name: new RegExp(`^\\${operator}$`) }).click();

      await this.conditionValueInput.fill(value);
    });
  }

  async setCooldown(minutes: string): Promise<void> {
    await test.step(`Set cooldown period to ${minutes} minutes`, async () => {
      await this.cooldownInput.fill(minutes);
    });
  }

  async selectDestination(destinationName: string): Promise<void> {
    await test.step(`Select destination: ${destinationName}`, async () => {
      await this.destinationCombobox.click();
      await this.destinationCombobox.fill(destinationName);
      await this.page.waitForTimeout(500);
      await this.destinationCombobox.press('ArrowDown');
      await this.destinationCombobox.press('Enter');
    });
  }

  async selectTemplateOverride(templateName: string): Promise<void> {
    await test.step(`Select template override: ${templateName}`, async () => {
      await this.templateOverrideCombobox.click();
      await this.templateOverrideCombobox.fill(templateName);
      await this.page.getByRole('option', { name: new RegExp(templateName, 'i') }).click();
    });
  }

  async fillDescription(description: string): Promise<void> {
    await test.step('Fill alert description', async () => {
      await this.descriptionTextArea.fill(description);
    });
  }

  async fillRowTemplate(rowTemplate: string): Promise<void> {
    await test.step('Fill alert row template', async () => {
      await this.rowTemplateTextArea.fill(rowTemplate);
    });
  }

  async saveAlert(): Promise<void> {
    await test.step('Save alert', async () => {
      await this.saveButton.click();
    });
  }

  async createRealTimeAlert(config: RealTimeAlertConfig): Promise<void> {
    await test.step(`Create real-time alert: ${config.alertName}`, async () => {
      await this.clickNewAlert();

      await this.fillAlertName(config.alertName);
      await this.selectStreamType(config.streamType);
      await this.selectStreamName(config.streamName);
      await this.selectRealTimeAlert();

      await this.continueToNextStep('Continue to Conditions step');

      await this.conditionTab.click();
      await this.setSimpleCondition(config.conditionColumn, config.conditionOperator, config.conditionValue);

      await this.continueToNextStep('Continue to Alert Settings step');

      await this.setCooldown(config.cooldownMinutes);
      await this.selectDestination(config.destinationName);
      await this.selectTemplateOverride(config.templateName);

      await this.continueToNextStep('Continue to Advanced step');

      if (config.description) {
        await this.fillDescription(config.description);
      }

      if (config.rowTemplate) {
        await this.fillRowTemplate(config.rowTemplate);
      }

      await this.saveAlert();
    });
  }

  getAlertRowByName(alertName: string): Locator {
    return this.page.locator('tbody tr', {
      has: this.page.locator(`[data-test="alert-list-${alertName}-update-alert"]`),
    });
  }

  async isAlertVisible(alertName: string): Promise<boolean> {
    return await test.step(`Check whether alert is visible in list: ${alertName}`, async () => {
      const row = this.getAlertRowByName(alertName);
      return (await row.count()) > 0 && (await row.first().isVisible());
    });
  }

  getPauseButton(alertName: string): Locator {
    return this.page.locator(
      `[data-test="alert-list-${alertName}-pause-start-alert"]`
    );
  }

  getEditButton(alertName: string): Locator {
    return this.page.locator(
      `[data-test="alert-list-${alertName}-update-alert"]`
    );
  }

  getCloneButton(alertName: string): Locator {
    return this.page.locator(
      `[data-test="alert-list-${alertName}-clone-alert"]`
    );
  }

  async waitForAlertInList(alertName: string): Promise<void> {
    await test.step(`Wait for created alert to appear in list: ${alertName}`, async () => {
      await this.getAlertRowByName(alertName).first().waitFor({ state: 'visible' });
    });
  }
}