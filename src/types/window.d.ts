
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
}

interface Window {
  _consoleLog?: string[];
  electron?: ElectronAPI;
}
