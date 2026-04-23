import { Locator, Page, test } from '@playwright/test';
import { BasePage } from '../base/base.page';

export class TemplatesPage extends BasePage {
  readonly pageTitle: Locator;
  readonly newTemplateButton: Locator;
  readonly templateNameInput: Locator;
  readonly webHookTab: Locator;
  readonly emailTab: Locator;
  readonly templateBodyEditor: Locator;
  readonly templateEditorInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);

    this.pageTitle = page.locator('[data-test="alert-templates-list-title"]');
    this.newTemplateButton = page.getByRole('button', { name: 'New template' });

    this.templateNameInput = page.locator('[data-test="add-template-name-input"]');
    this.webHookTab = page.locator('[data-test="tab-http"]');
    this.emailTab = page.locator('[data-test="tab-email"]');

    this.templateBodyEditor = page.locator('[data-test="template-body-editor"]');
    this.templateEditorInput = this.templateBodyEditor.locator('.monaco-scrollable-element');

    this.saveButton = page.locator('[data-test="add-template-submit-btn"]');
  }

  async waitForPage(): Promise<void> {
    await test.step('Wait for Templates page to load', async () => {
      await this.pageTitle.waitFor({ state: 'visible' });
    });
  }

  async clickAddTemplate(): Promise<void> {
    await test.step('Click Add Template button', async () => {
      await this.newTemplateButton.click();
    });
  }

  async fillTemplateName(templateName: string): Promise<void> {
    await test.step(`Fill template name: ${templateName}`, async () => {
      await this.templateNameInput.fill(templateName);
    });
  }

  async selectWebHookTab(): Promise<void> {
    await test.step('Select Web Hook template tab', async () => {
      await this.webHookTab.click();
    });
  }

  async fillTemplateBody(templateBody: string): Promise<void> {
    await test.step('Fill template body in editor', async () => {
      await this.templateEditorInput.click();
      await this.page.waitForTimeout(500);
      await this.page.keyboard.insertText(templateBody);
      await this.page.waitForTimeout(500);
    });
  }

  async clickSave(): Promise<void> {
    await test.step('Click Save button on Template form', async () => {
      await this.saveButton.click();
    });
  }

  async createTemplate(templateName: string, templateBody: string): Promise<void> {
    await test.step(`Create template: ${templateName}`, async () => {
      await this.fillTemplateName(templateName);
      await this.selectWebHookTab();
      await this.fillTemplateBody(templateBody);
      await this.clickSave();
      await this.validateSuccessToast('Template Saved Successfully.');
    });
  }

  async isTemplateVisible(templateName: string): Promise<boolean> {
    return await test.step(`Check whether template is visible: ${templateName}`, async () => {
      return (await this.page.getByText(templateName, { exact: true }).count()) > 0;
    });
  }
}