
import { DatabaseOperations } from './types';
import { mockDbOps } from './mock-db';
import { createElectronDb } from './electron-db';

// Determine if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && !window.navigator.userAgent.includes('Electron');

// Export the appropriate database implementation
export const db_ops: DatabaseOperations = isBrowser ? mockDbOps : createElectronDb();
