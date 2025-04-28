
const fs = require('fs');
const path = require('path');

// Read the current package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add electron scripts
packageJson.scripts = {
  ...packageJson.scripts,
  "electron": "node electron/electron-dev.js",
  "electron:build": "vite build && electron-builder -c electron/electron-builder.js",
  "electron:pack": "vite build && electron ."
};

// Add electron main
packageJson.main = "electron/main.js";

// Write the updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Package.json updated with Electron scripts.');
