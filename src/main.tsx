
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create root element regardless of environment
createRoot(document.getElementById("root")!).render(<App />);

// Add Electron-specific code here if needed
const isElectron = window.navigator.userAgent.toLowerCase().indexOf('electron') > -1;
if (isElectron) {
  console.log('Running in Electron');
}
