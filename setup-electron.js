
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if package.json exists
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: package.json not found. Make sure you are in the project root directory.');
  process.exit(1);
}

console.log('Setting up Electron environment...');

// Run the script to update package.json
exec('node electron/package-scripts.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing package-scripts.js: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(stdout);
  
  // Install necessary dependencies if they're not already installed
  console.log('Installing Electron dependencies...');
  exec('npm install electron@latest electron-builder@latest wait-on@latest better-sqlite3@latest --save-dev', 
    (installError, installStdout, installStderr) => {
      if (installError) {
        console.error(`Error installing dependencies: ${installError.message}`);
        console.log('Try running "npm install" manually after fixing the issues.');
        return;
      }
      if (installStderr) {
        console.warn(`Warning during installation: ${installStderr}`);
      }
      console.log(installStdout);
      console.log('Electron setup complete. You can now run the app with:');
      console.log('npm run electron');
    });
});
