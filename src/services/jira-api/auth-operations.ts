
import { BaseJiraClient } from './base-client';
import { JiraConfig } from './types';

export class JiraAuthOperations extends BaseJiraClient {
  async validateCredentials(): Promise<boolean> {
    try {
      const response = await this.request('myself');
      if (!response || Object.keys(response).length === 0) {
        throw new Error('Received empty response from JIRA server');
      }
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
      } else if (!error.message) {
        error.message = 'Unknown error occurred while validating credentials.';
      }
      
      throw error;
    }
  }

  async testConnection(config: JiraConfig): Promise<boolean> {
    const previousConfig = this.config;
    
    try {
      this.setConfig(config);
      console.log('Testing connection with config:', {
        baseUrl: config.baseUrl,
        authType: config.auth.type
      });

      const response = await this.request('myself');
      
      if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
        console.warn('Empty response received during test connection');
        throw new Error('Received empty response from JIRA server');
      }
      
      console.log('Test connection successful:', response);
      return true;
    } catch (error: any) {
      console.error('Test connection failed:', error);
      
      // Enhance error message if it's generic
      if (!error.message || error.message === 'Failed to fetch') {
        error.message = 'Failed to connect to JIRA. Please check your URL and network connection.';
      }
      
      throw error;
    } finally {
      // Always restore previous config
      this.setConfig(previousConfig);
    }
  }
}
