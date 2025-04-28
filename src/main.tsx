
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create root element and mount the app
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found!");
  const bodyElement = document.body;
  const newRootElement = document.createElement("div");
  newRootElement.id = "root";
  bodyElement.appendChild(newRootElement);
  createRoot(newRootElement).render(<App />);
} else {
  createRoot(rootElement).render(<App />);
}

// Add Electron-specific code here if needed
const isElectron = window.navigator.userAgent.toLowerCase().indexOf('electron') > -1;
if (isElectron) {
  console.log('Running in Electron');
}
