
const fs = require('fs');
const path = require('path');

try {
  // Read the current package.json
  const packageJsonPath = path.join(__dirname, '../package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error('Error: package.json not found at path:', packageJsonPath);
    process.exit(1);
  }
  
  let packageJson;
  try {
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    packageJson = JSON.parse(packageJsonContent);
  } catch (parseError) {
    console.error('Error parsing package.json:', parseError);
    process.exit(1);
  }

  // Add electron scripts if they don't exist
  packageJson.scripts = {
    ...packageJson.scripts,
    "electron": packageJson.scripts.electron || "node electron/electron-dev.js",
    "electron:build": packageJson.scripts["electron:build"] || "vite build && electron-builder -c electron/electron-builder.js",
    "electron:pack": packageJson.scripts["electron:pack"] || "vite build && electron ."
  };

  // Add electron main if it doesn't exist
  if (!packageJson.main) {
    packageJson.main = "electron/main.js";
  }

  // Write the updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Package.json updated with Electron scripts.');
} catch (error) {
  console.error('Failed to update package.json:', error);
  process.exit(1);
}
