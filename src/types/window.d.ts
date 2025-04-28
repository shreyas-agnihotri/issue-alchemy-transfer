
interface ElectronAPI {
  makeRequest: (params: {
    url: string;
    options: RequestInit & { headers: Record<string, string> }
  }) => Promise<{
    ok: boolean;
    status: number;
    statusText: string;
    data: any;
  }>;
  exchangeOAuthCode: (data: any) => Promise<any>;
  refreshOAuthToken: (data: any) => Promise<any>;
  database: {
    getCloneHistory: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
    getCloneIssueResults: (cloneHistoryId: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;
    getJiraConfigs: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
  };
}

interface Window {
  _consoleLog?: string[];
  electron?: ElectronAPI;
}
