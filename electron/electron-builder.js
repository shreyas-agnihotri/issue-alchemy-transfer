
const builder = require('electron-builder');
const { Platform } = builder;

builder.build({
  targets: Platform.current().createTarget(),
  config: {
    appId: 'com.jira-deep-clone.app',
    productName: 'JIRA Deep Clone',
    directories: {
      output: 'dist-electron',
      app: '.',
    },
    files: [
      'dist/**/*',
      'electron/**/*',
      'package.json'
    ],
    mac: {
      category: 'public.app-category.productivity',
      icon: 'public/favicon.ico'
    },
    win: {
      icon: 'public/favicon.ico'
    },
    linux: {
      icon: 'public/favicon.ico',
      category: 'Office'
    }
  }
});
