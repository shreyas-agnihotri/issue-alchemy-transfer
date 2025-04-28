
import { BaseJiraClient } from './base-client';
import { JiraConfig } from './types';

export class JiraAuthOperations extends BaseJiraClient {
  async validateCredentials(): Promise<boolean> {
    try {
      await this.request('myself');
      return true;
    } catch (error: any) {
      console.error('Validation error:', error);
      throw error;
    }
  }

  async testConnection(config: JiraConfig): Promise<boolean> {
    const previousConfig = this.config;
    this.config = config;

    try {
      await this.request('myself');
      this.config = previousConfig;
      return true;
    } catch (error) {
      this.config = previousConfig;
      throw error;
    }
  }
}
