import { writable } from 'svelte/store';
import { mathApi } from '$lib/api/mathApi';

export interface ApiConnectionState {
  connected: boolean;
  loading: boolean;
  error: string | null;
  lastChecked: Date | null;
}

const initialState: ApiConnectionState = {
  connected: false,
  loading: false,
  error: null,
  lastChecked: null
};

export const apiConnection = writable<ApiConnectionState>(initialState);

// Function to check API connection
export async function checkApiConnection(): Promise<boolean> {
  apiConnection.update(state => ({ ...state, loading: true, error: null }));
  
  try {
    const response = await mathApi.healthCheck();
    const isConnected = response.status === 'healthy';
    
    apiConnection.update(state => ({
      ...state,
      connected: isConnected,
      loading: false,
      lastChecked: new Date()
    }));
    
    return isConnected;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    apiConnection.update(state => ({
      ...state,
      connected: false,
      loading: false,
      error: errorMessage,
      lastChecked: new Date()
    }));
    
    return false;
  }
}

// Auto-check connection every 30 seconds
let connectionCheckInterval: NodeJS.Timeout | null = null;

export function startConnectionMonitoring() {
  // Initial check
  checkApiConnection();
  
  // Set up interval
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
  }
  
  connectionCheckInterval = setInterval(() => {
    checkApiConnection();
  }, 30000); // Check every 30 seconds
}

export function stopConnectionMonitoring() {
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
    connectionCheckInterval = null;
  }
}
