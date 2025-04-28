
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
const isElectron = typeof window !== 'undefined' && 
  window.navigator && 
  window.navigator.userAgent.toLowerCase().indexOf('electron') > -1;

if (isElectron) {
  console.log('Running in Electron environment');
  
  // Set up any Electron-specific listeners or configurations
  try {
    window.addEventListener('error', (event) => {
      console.error('Uncaught error:', event.error);
    });
  } catch (e) {
    console.warn('Unable to set up Electron-specific error handling', e);
  }
}
