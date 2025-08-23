import { writable } from 'svelte/store';
import { userVault } from '$lib/services/userVault';
import { user } from './auth';
// Removed Supabase User type import

interface VaultState {
  data: Record<string, any>;
  loading: boolean;
  error: Error | null;
}

function createUserVaultStore() {
  const initialState: VaultState = {
    data: {},
    loading: false,
    error: null
  };

  const { subscribe, set, update } = writable<VaultState>(initialState);

  let currentUserId: string | undefined;

  // Subscribe to auth changes to clear data on sign out
  user.subscribe(($user) => {
    if (!$user) {
      // Clear data when user signs out
      set(initialState);
      currentUserId = undefined;
    } else if ($user.id !== currentUserId) {
      // Load data for new user
      currentUserId = $user.id;
      loadAllData($user.id);
    }
  });

  async function loadAllData(userId: string) {
    try {
      update(state => ({ ...state, loading: true, error: null }));
      const data = await userVault.getAllUserData(userId);
      
      update(state => ({
        ...state,
        data: data || {},
        loading: false
      }));
    } catch (error) {
      console.error('Failed to load vault data:', error);
      update(state => ({
        ...state,
        error: error instanceof Error ? error : new Error('Failed to load vault data'),
        loading: false
      }));
    }
  }

  async function setValue(key: string, value: any, userId: string) {
    try {
      update(state => ({ ...state, loading: true, error: null }));
      const success = await userVault.setData(key, value, userId);
      
      if (success) {
        update(state => ({
          ...state,
          data: { ...state.data, [key]: value },
          loading: false
        }));
      }
      return success;
    } catch (error) {
      console.error(`Failed to set vault key '${key}':`, error);
      update(state => ({
        ...state,
        error: error instanceof Error ? error : new Error(`Failed to set ${key}`),
        loading: false
      }));
      return false;
    }
  }

  async function getValue<T = any>(key: string, userId: string): Promise<T | null> {
    try {
      update(state => ({ ...state, loading: true, error: null }));
      const value = await userVault.getData<T>(key, userId);
      
      if (value !== null) {
        update(state => ({
          ...state,
          data: { ...state.data, [key]: value },
          loading: false
        }));
      } else {
        update(state => ({ ...state, loading: false }));
      }
      
      return value;
    } catch (error) {
      console.error(`Failed to get vault key '${key}':`, error);
      update(state => ({
        ...state,
        error: error instanceof Error ? error : new Error(`Failed to get ${key}`),
        loading: false
      }));
      return null;
    }
  }

  async function deleteKey(key: string, userId: string): Promise<boolean> {
    try {
      update(state => ({ ...state, loading: true, error: null }));
      const success = await userVault.deleteData(key, userId);
      
      if (success) {
        update(state => {
          const newData = { ...state.data };
          delete newData[key];
          return { ...state, data: newData, loading: false };
        });
      }
      
      return success;
    } catch (error) {
      console.error(`Failed to delete vault key '${key}':`, error);
      update(state => ({
        ...state,
        error: error instanceof Error ? error : new Error(`Failed to delete ${key}`),
        loading: false
      }));
      return false;
    }
  }

  function clearError() {
    update(state => ({ ...state, error: null }));
  }

  return {
    subscribe,
    setValue,
    getValue,
    deleteKey,
    clearError,
    refresh: (userId: string) => loadAllData(userId)
  };
}

export const userVaultStore = createUserVaultStore();
