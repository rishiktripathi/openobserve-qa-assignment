import { APIRequestContext, expect, test } from '@playwright/test';
import { BASE_URL, ORG, USERNAME, PASSWORD } from './constants';

export class OpenObserveApiHelper {
  private readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  private getAuthHeader(): string {
    return `Basic ${Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')}`;
  }

  async ingestLogs(streamName: string, payload: Record<string, unknown>[]): Promise<void> {
    await test.step(`Ingest logs into stream: ${streamName}`, async () => {
      const response = await this.request.post(
        `${BASE_URL}/api/${ORG}/${streamName}/_json`,
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
          data: payload,
        }
      );

      expect(response.ok()).toBeTruthy();
    });
  }

  async searchLogs(streamName: string): Promise<any> {
    return await test.step(`Search logs in stream: ${streamName}`, async () => {
      const endTime = Date.now() * 1000;
      const startTime = endTime - 60 * 60 * 1000 * 1000;

      const response = await this.request.post(
        `${BASE_URL}/api/${ORG}/_search?type=logs`,
        {
          headers: {
            Authorization: this.getAuthHeader(),
            'Content-Type': 'application/json',
          },
          data: {
            query: {
              sql: `SELECT * FROM "${streamName}"`,
              start_time: startTime,
              end_time: endTime,
              from: 0,
              size: 100,
            },
          },
        }
      );

      expect(response.ok()).toBeTruthy();
      return await response.json();
    });
  }
}