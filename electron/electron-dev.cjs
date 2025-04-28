
const { spawn } = require('child_process');
const electron = require('electron');
const path = require('path');
const waitOn = require('wait-on');

// Start Vite dev server
const viteProcess = spawn('npm', ['run', 'dev'], { shell: true, stdio: 'inherit' });

// Wait for Vite server to start
waitOn({
  resources: ['http://localhost:8080'],
  timeout: 30000
}).then(() => {
  // Start Electron with dev server URL
  const electronProcess = spawn(electron, [path.join(__dirname, '../electron/main.cjs')], {
    env: {
      ...process.env,
      ELECTRON_START_URL: 'http://localhost:8080',
      NODE_ENV: 'development'
    },
    shell: true,
    stdio: 'inherit'
  });

  // Handle cleanup on exit
  electronProcess.on('close', () => {
    viteProcess.kill();
    process.exit();
  });
}).catch(error => {
  console.error('Error starting Electron:', error);
  viteProcess.kill();
  process.exit(1);
});
