
import { BaseJiraClient } from './base-client';
import { JiraConfig } from './types';

export class JiraAuthOperations extends BaseJiraClient {
  async validateCredentials(): Promise<boolean> {
    try {
      await this.request('myself');
      return true;
    } catch (error: any) {
      console.error('Validation error:', error);
      
      // Handle specific authentication errors
      if (error.status === 401) {
        error.message = 'Authentication failed. Please check your API key and email.';
      } else if (error.status === 0) {
        error.message = 'Network error. Please check your JIRA URL and network connection.';
      }
      
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
