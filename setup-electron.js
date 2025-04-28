
const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Helper function to check if Python is available
function checkPython() {
  try {
    // Try to run Python to check if it's in PATH
    const pythonVersion = execSync('python --version').toString().trim();
    console.log(`Found Python: ${pythonVersion}`);
    return true;
  } catch (err) {
    try {
      // On some systems, especially macOS, it might be python3 instead of python
      const python3Version = execSync('python3 --version').toString().trim();
      console.log(`Found Python3: ${python3Version}`);
      
      // On macOS, create a python symlink if it doesn't exist
      if (os.platform() === 'darwin') {
        try {
          console.log('Creating python symlink to python3 for compatibility...');
          execSync('ln -sf $(which python3) /usr/local/bin/python');
        } catch (e) {
          console.log('Could not create symlink (may require sudo). Will configure npm to use python3...');
          execSync('npm config set python $(which python3)');
        }
      } else {
        // On other platforms, just configure npm to use python3
        console.log('Configuring npm to use python3...');
        execSync('npm config set python $(which python3)');
      }
      return true;
    } catch (err2) {
      return false;
    }
  }
}

// Check if package.json exists
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: package.json not found. Make sure you are in the project root directory.');
  process.exit(1);
}

console.log('Setting up Electron environment...');

// Check for Python before proceeding
if (!checkPython()) {
  console.error('Error: Python is required to build native dependencies. Please install Python and try again.');
  console.log('  - On Windows: install Python from https://www.python.org/');
  console.log('  - On macOS: run "brew install python" or use the installer from python.org');
  console.log('  - On Linux: run "sudo apt install python3" or equivalent for your distribution');
  process.exit(1);
}

// Configure npm for native module builds
console.log('Configuring npm for native module builds...');
try {
  // On Windows, we might need to explicitly set the VS build tools
  if (os.platform() === 'win32') {
    console.log('Setting up Windows build environment...');
    execSync('npm config set msvs_version 2019');
  }
} catch (err) {
  console.warn('Warning: Could not configure build environment completely:', err.message);
}

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
  
  let installCommand = 'npm install electron@latest electron-builder@latest wait-on@latest --save-dev';
  
  // Install better-sqlite3 separately with specific flags
  console.log('Installing better-sqlite3 with special configuration...');
  installCommand += ' && npm install better-sqlite3@latest --build-from-source --save-dev';
  
  exec(installCommand, 
    (installError, installStdout, installStderr) => {
      if (installError) {
        console.error(`Error installing dependencies: ${installError.message}`);
        console.log('\nTROUBLESHOOTING TIPS:');
        console.log('1. Make sure you have the following installed:');
        console.log('   - Node.js 18.x or later');
        console.log('   - Python (required for native modules)');
        console.log('   - C++ build tools:');
        console.log('     - Windows: npm install --global --production windows-build-tools');
        console.log('     - macOS: xcode-select --install');
        console.log('     - Linux: sudo apt-get install build-essential python');
        console.log('2. Try running: npm config set python /path/to/your/python');
        console.log('3. For macOS users: make sure Xcode Command Line Tools are installed.');
        console.log('\nTry running "npm install" manually after fixing the issues.');
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
