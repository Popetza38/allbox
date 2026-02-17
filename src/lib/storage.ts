/**
 * Versioned Local Storage Helper
 *
 * Provides type-safe localStorage operations with schema versioning
 * to prevent issues when data structure changes
 */

export interface StorageData<T> {
  version: string;
  data: T;
  timestamp: number;
}

export interface StorageOptions<T> {
  key: string;
  version: string;
  defaultValue: T;
  validate?: (data: unknown) => data is T;
  migrate?: (oldData: unknown, oldVersion: string) => T;
}

/**
 * Safely parse JSON with fallback
 */
function safeParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Get data from localStorage with version validation
 */
export function getFromStorage<T>(options: StorageOptions<T>): T {
  const { key, version, defaultValue, validate, migrate } = options;

  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return defaultValue;
    }

    const stored = safeParse<StorageData<unknown> | null>(raw, null);

    if (!stored) {
      return defaultValue;
    }

    // Version matches
    if (stored.version === version) {
      // Validate if validator provided
      if (validate && !validate(stored.data)) {
        // Invalid data, remove and return default
        removeFromStorage(key);
        return defaultValue;
      }

      return stored.data as T;
    }

    // Version mismatch - try migration
    if (migrate) {
      try {
        const migratedData = migrate(stored.data, stored.version);
        // Save migrated data
        setToStorage({ key, version, data: migratedData });
        return migratedData;
      } catch (error) {
        console.error(`[Storage] Migration failed for ${key}:`, error);
        removeFromStorage(key);
        return defaultValue;
      }
    }

    // No migration available - clear and return default
    removeFromStorage(key);
    return defaultValue;
  } catch (error) {
    console.error(`[Storage] Error reading ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Save data to localStorage with version
 */
export function setToStorage<T>({ key, version, data }: { key: string; version: string; data: T }): void {
  // Create storage object outside try block for reuse
  const storageObj: StorageData<T> = {
    version,
    data,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(key, JSON.stringify(storageObj));
  } catch (error) {
    console.error(`[Storage] Error writing ${key}:`, error);

    // If quota exceeded, try to clear old data and retry
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldStorage();
      try {
        localStorage.setItem(key, JSON.stringify(storageObj));
      } catch (retryError) {
        console.error(`[Storage] Still cannot write ${key} after cleanup:`, retryError);
      }
    }
  }
}

/**
 * Remove data from localStorage
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`[Storage] Error removing ${key}:`, error);
  }
}

/**
 * Clear all app-related storage (preserves data from other apps)
 */
export function clearAppStorage(prefix: string = 'dramabox-'): void {
  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('[Storage] Error clearing app storage:', error);
  }
}

/**
 * Clean up old storage entries (older than 30 days)
 */
export function clearOldStorage(maxAge: number = 30 * 24 * 60 * 60 * 1000): void {
  try {
    const now = Date.now();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const raw = localStorage.getItem(key);
      if (!raw) continue;

      try {
        const stored = JSON.parse(raw) as StorageData<unknown>;

        // Check if it's our versioned storage format
        if ('timestamp' in stored && 'version' in stored) {
          const age = now - (stored.timestamp || 0);

          if (age > maxAge) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // Not our format, skip
        continue;
      }
    }
  } catch (error) {
    console.error('[Storage] Error cleaning old storage:', error);
  }
}

/**
 * Create a typed storage hook/helper
 */
export function createStorage<T>(options: StorageOptions<T>) {
  return {
    get: () => getFromStorage(options),
    set: (data: T) => setToStorage({
      key: options.key,
      version: options.version,
      data,
    }),
    remove: () => removeFromStorage(options.key),
  };
}

// Storage key constants
export const STORAGE_KEYS = {
  LANGUAGE: 'dramabox-language',
  SEARCH_HISTORY: 'dramabox-search-history',
  FAVORITES: 'dramabox-favorites',
  WATCH_HISTORY: 'dramabox-watch-history',
  SETTINGS: 'dramabox-settings',
} as const;

// Storage versions
export const STORAGE_VERSIONS = {
  LANGUAGE: 'v1',
  SEARCH_HISTORY: 'v1',
  FAVORITES: 'v1',
  WATCH_HISTORY: 'v1',
  SETTINGS: 'v1',
} as const;
