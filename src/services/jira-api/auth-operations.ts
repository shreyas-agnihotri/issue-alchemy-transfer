
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
      } else if (error.error && typeof error.error === 'string' && error.error.includes("Invalid json response")) {
        error.message = 'Invalid response from JIRA server. Please check your JIRA URL format.';
      }
      
      throw error;
    }
  }

  async testConnection(config: JiraConfig): Promise<boolean> {
    const previousConfig = this.config;
    this.setConfig(config);

    try {
      const response = await this.request('myself');
      this.setConfig(previousConfig);
      
      if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
        throw new Error('Received empty response from JIRA server');
      }
      
      return true;
    } catch (error: any) {
      this.setConfig(previousConfig);
      console.error('Test connection failed:', error);
      throw error;
    }
  }
}
