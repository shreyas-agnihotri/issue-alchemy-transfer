const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const url = require('url');
const fetch = require('node-fetch');

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/favicon.ico')
  });

  // Load the app
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../dist/index.html'),
    protocol: 'file:',
    slashes: true
  });
  
  mainWindow.loadURL(startUrl);

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // Handle protocol for OAuth callback
  setupOAuthCallback();
}

// Set up protocol handler for OAuth callback
function setupOAuthCallback() {
  // Register custom protocol handler for OAuth callback (app://oauth-callback)
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('jiraclone', process.execPath, [path.resolve(process.argv[1])]);
    }
  } else {
    app.setAsDefaultProtocolClient('jiraclone');
  }

  // Handle protocol callback
  app.on('open-url', (event, url) => {
    event.preventDefault();
    
    if (url.startsWith('jiraclone://oauth-callback')) {
      console.log('OAuth callback received:', url);
      
      // Parse the URL to extract OAuth data
      const parsedUrl = new URL(url);
      const code = parsedUrl.searchParams.get('code');
      const state = parsedUrl.searchParams.get('state');
      
      if (code && state && mainWindow) {
        // Forward the OAuth data to the renderer process
        mainWindow.webContents.send('oauth-callback', { code, state });
      }
    }
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handler for making HTTP requests
ipcMain.handle('make-request', async (event, { url, options }) => {
  console.log('Making request to:', url);
  try {
    // Use node-fetch to make the request
    const response = await fetch(url, options);
    
    // Get the status and headers
    const status = response.status;
    const statusText = response.statusText;
    const ok = response.ok;
    
    // Parse the response based on content type
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return { ok, status, statusText, data };
  } catch (error) {
    console.error('Error making request:', error);
    return { 
      ok: false, 
      status: 0, 
      statusText: error.message, 
      data: { error: error.message } 
    };
  }
});

// IPC handlers for OAuth
ipcMain.handle('exchange-oauth-code', async (event, { code, clientId, clientSecret, redirectUri }) => {
  try {
    // In a real implementation, we would:
    // 1. Exchange the OAuth code for tokens using Atlassian's token endpoint
    // 2. Return the tokens to the renderer process
    
    // This is a simplified mock implementation
    return {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      token_type: 'Bearer',
      expires_at: Date.now() + 3600 * 1000, // 1 hour expiration
      scope: 'read:jira-work write:jira-work'
    };
  } catch (error) {
    console.error('Error exchanging OAuth code:', error);
    throw error;
  }
});

ipcMain.handle('refresh-oauth-token', async (event, { refreshToken, clientId, clientSecret }) => {
  try {
    // In a real implementation, we would:
    // 1. Exchange the refresh token for a new access token
    // 2. Return the new tokens to the renderer process
    
    // This is a simplified mock implementation
    return {
      access_token: 'mock_refreshed_access_token',
      refresh_token: 'mock_refreshed_refresh_token',
      token_type: 'Bearer',
      expires_at: Date.now() + 3600 * 1000, // 1 hour expiration
      scope: 'read:jira-work write:jira-work'
    };
  } catch (error) {
    console.error('Error refreshing OAuth token:', error);
    throw error;
  }
});
