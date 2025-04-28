
import { JiraConfig, JiraError } from './types';

export class BaseJiraClient {
  protected config: JiraConfig | null = null;
  protected isElectron = typeof window !== 'undefined' && 
    'electron' in window && window.electron !== undefined;

  setConfig(config: JiraConfig | null) {
    this.config = config;
    console.log('Jira configuration updated:', {
      baseUrl: config?.baseUrl,
      authType: config?.auth.type,
      hasEmail: !!config?.auth.email,
      hasApiKey: !!config?.auth.apiKey
    });
  }

  protected getHeaders() {
    if (!this.config) {
      throw new Error('Jira configuration not set');
    }

    if (!this.config.auth.email || !this.config.auth.apiKey) {
      throw new Error('Email and API key are required for authentication');
    }

    const credentials = `${this.config.auth.email}:${this.config.auth.apiKey}`;
    const base64Auth = btoa(credentials);
    
    const headers = {
      'Authorization': `Basic ${base64Auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    console.debug('Request headers generated:', {
      ...headers,
      Authorization: '***REDACTED***'
    });

    return headers;
  }

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.config) {
      throw new Error('Jira configuration not set');
    }

    const url = `${this.config.baseUrl}/rest/api/3/${endpoint}`;
    console.log(`Making ${options.method || 'GET'} request to: ${url}`);
    
    if (this.isElectron && window.electron) {
      return this.makeElectronRequest<T>(url, options);
    }
    
    return this.makeBrowserRequest<T>(url, options);
  }

  private async makeElectronRequest<T>(url: string, options: RequestInit): Promise<T> {
    try {
      console.group(`Electron API Request: ${options.method || 'GET'} ${url}`);
      console.time('Request Duration');
      
      const headers = this.getHeaders();
      const requestOptions = { ...options };
      
      if (requestOptions.body && typeof requestOptions.body === 'object') {
        requestOptions.body = JSON.stringify(requestOptions.body);
        console.debug('Request payload:', JSON.parse(requestOptions.body));
      }
      
      const response = await window.electron.makeRequest({
        url,
        options: {
          ...requestOptions,
          headers
        }
      });
      
      console.debug('Response status:', response.ok ? 'OK' : 'Failed', response.status);
      
      if (!response.ok) {
        console.error('Request failed:', response);
        this.handleErrorResponse(response);
      }
      
      console.timeEnd('Request Duration');
      console.groupEnd();
      
      return response.data;
    } catch (error: any) {
      console.error('Electron request failed:', {
        error: error.message,
        stack: error.stack,
        status: error.status
      });
      console.groupEnd();
      throw error;
    }
  }

  private async makeBrowserRequest<T>(url: string, options: RequestInit): Promise<T> {
    try {
      console.group(`Browser API Request: ${options.method || 'GET'} ${url}`);
      console.time('Request Duration');

      if (options.body) {
        console.debug('Request payload:', 
          typeof options.body === 'string' ? JSON.parse(options.body) : options.body
        );
      }

      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(),
      });
  
      console.debug('Response status:', response.status, response.statusText);

      if (!response.ok) {
        console.error('Request failed:', {
          status: response.status,
          statusText: response.statusText
        });
        await this.handleErrorResponse(response);
      }
  
      const data = await response.json();
      console.debug('Response data:', data);
      console.timeEnd('Request Duration');
      console.groupEnd();
      return data;
    } catch (error: any) {
      console.error('Browser request failed:', {
        message: error.message,
        stack: error.stack,
        status: error.status || 0
      });
      console.groupEnd();

      if (!error.status) {
        error = {
          status: 0,
          message: error.message || 'Network error',
          error: error
        };
      }
      throw error;
    }
  }

  private async handleErrorResponse(response: Response | { ok: boolean; status: number; statusText: string; data: any }) {
    const error: JiraError = {
      status: response.status,
      message: 'response' in response ? response.statusText : response.statusText,
    };
    
    if (response.status === 401) {
      error.message = 'Authentication failed. Please check your API key and email.';
    }
    
    try {
      error.error = 'data' in response ? response.data : await response.json();
      console.error('Error response data:', error.error);
    } catch (e) {
      try {
        error.error = 'data' in response ? response.data : await response.text();
        console.error('Error response text:', error.error);
      } catch (e) {
        error.error = 'Failed to parse error response';
        console.error('Failed to parse error response');
      }
    }
    
    throw error;
  }
}
