
const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const url = require('url');
const fetch = require('node-fetch');
const Database = require('better-sqlite3');

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;
let db;

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

  // Disable Autofill warnings
  // This prevents the errors about Autofill.enable and Autofill.setAddresses
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    callback({});
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
  
  // Initialize SQLite database
  initDatabase();
}

// Initialize the SQLite database
function initDatabase() {
  try {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'jira-clone.db');
    console.log('Database path:', dbPath);
    
    db = new Database(dbPath);
    
    // Initialize schema
    initializeSchema();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Initialize database schema
function initializeSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clone_history (
      id TEXT PRIMARY KEY,
      source_project_id TEXT NOT NULL,
      target_project_id TEXT NOT NULL,
      total_issues INTEGER NOT NULL,
      successful_issues INTEGER NOT NULL,
      failed_issues INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      query TEXT
    );

    CREATE TABLE IF NOT EXISTS clone_issue_results (
      id TEXT PRIMARY KEY,
      clone_history_id TEXT NOT NULL,
      source_issue_id TEXT NOT NULL,
      source_issue_key TEXT NOT NULL,
      target_issue_id TEXT,
      target_issue_key TEXT,
      status TEXT NOT NULL,
      error_message TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (clone_history_id) REFERENCES clone_history(id)
    );

    CREATE TABLE IF NOT EXISTS issue_links (
      id TEXT PRIMARY KEY,
      source_issue_id TEXT NOT NULL,
      target_issue_id TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS jira_configs (
      id TEXT PRIMARY KEY,
      jira_url TEXT NOT NULL,
      api_key TEXT,
      oauth_client_id TEXT,
      oauth_client_secret TEXT,
      auth_method TEXT NOT NULL DEFAULT 'api-key',
      user_email TEXT,
      jql_filter TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS oauth_tokens (
      id TEXT PRIMARY KEY,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      token_type TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      scope TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
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
  console.log('Main process: Making request to:', url);
  console.log('Request options:', JSON.stringify(options, null, 2));
  
  try {
    // Process headers to ensure they're in the right format
    const fetchOptions = { ...options };
    
    // Ensure method is set
    if (!fetchOptions.method) {
      fetchOptions.method = 'GET';
    }
    
    console.log('Making request with fetch options:', JSON.stringify(fetchOptions, null, 2));
    
    // Use node-fetch to make the request
    const response = await fetch(url, fetchOptions);
    
    // Get the status and headers
    const status = response.status;
    const statusText = response.statusText;
    const ok = response.ok;
    
    console.log('Response status:', status, statusText);
    
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

// Add IPC handlers for database operations
// These are placeholders that will need to be expanded with actual implementations
ipcMain.handle('db-get-clone-history', async () => {
  try {
    const rows = db.prepare('SELECT * FROM clone_history ORDER BY created_at DESC').all();
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error fetching clone history:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-get-clone-issue-results', async (event, { cloneHistoryId }) => {
  try {
    const rows = db.prepare('SELECT * FROM clone_issue_results WHERE clone_history_id = ? ORDER BY created_at DESC')
      .all(cloneHistoryId);
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error fetching clone issue results:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-get-jira-configs', async () => {
  try {
    const rows = db.prepare('SELECT * FROM jira_configs ORDER BY updated_at DESC').all();
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error fetching jira configs:', error);
    return { success: false, error: error.message };
  }
});
