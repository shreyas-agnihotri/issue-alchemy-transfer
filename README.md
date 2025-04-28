
# JIRA Deep Clone

A desktop application for transferring issues between JIRA and Product Discovery projects.

## Getting Started

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository
git clone [repository-url]
cd [repository-folder]

# Step 2: Install the necessary dependencies
npm install

# Step 3: Setup Electron (this will update package.json)
node setup-electron.js

# Step 4: Start the development server
npm run dev

# Step 5: To run as a desktop app
npm run electron

# Step 6: To build the desktop app
npm run electron:build
```

## Troubleshooting

If you encounter issues during installation:

1. Make sure you're using a compatible Node.js version (18.x or later recommended)
2. If better-sqlite3 fails to install, you may need to install build tools:
   - On Windows: `npm install --global --production windows-build-tools`
   - On macOS: `xcode-select --install`
   - On Linux: `sudo apt-get install build-essential python`
3. Try running `npm cache clean --force` before installation

## Technologies Used

This project is built with:

- Electron
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

