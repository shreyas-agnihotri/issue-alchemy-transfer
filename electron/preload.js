
const { contextBridge, ipcRenderer } = require('electron');

// Add any preload functionality here
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
});

// Expose protected methods for API requests and OAuth handling
contextBridge.exposeInMainWorld('electron', {
  makeRequest: (params) => ipcRenderer.invoke('make-request', params),
  exchangeOAuthCode: (data) => ipcRenderer.invoke('exchange-oauth-code', data),
  refreshOAuthToken: (data) => ipcRenderer.invoke('refresh-oauth-token', data),
  
  // Database operations
  database: {
    getCloneHistory: () => ipcRenderer.invoke('db-get-clone-history'),
    getCloneIssueResults: (cloneHistoryId) => 
      ipcRenderer.invoke('db-get-clone-issue-results', { cloneHistoryId }),
    getJiraConfigs: () => ipcRenderer.invoke('db-get-jira-configs')
  }
});

// Listen for OAuth callbacks
ipcRenderer.on('oauth-callback', (event, data) => {
  // Forward the OAuth callback data to the window
  window.dispatchEvent(
    new CustomEvent('oauth-callback', { detail: data })
  );
});
