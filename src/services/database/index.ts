
import { DatabaseOperations } from './types';
import { mockDbOps } from './mock-db';
import { createElectronDb } from './electron-db';

// Determine if we're in an Electron environment 
const isElectron = typeof window !== 'undefined' && window.navigator.userAgent.includes('Electron');

// Export the appropriate database implementation
export const db_ops: DatabaseOperations = isElectron ? createElectronDb() : mockDbOps;

// Re-export types for external use
export * from './types';
