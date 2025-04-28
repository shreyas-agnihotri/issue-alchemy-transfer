
const { exec } = require('child_process');

// Run the script to update package.json
exec('node electron/package-scripts.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(stdout);
  console.log('Electron setup complete. You can now run the app with:');
  console.log('npm run electron');
});
