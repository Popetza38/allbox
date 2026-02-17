/**
 * Simple LRU Cache Implementation
 *
 * Lightweight in-memory cache for API routes
 * No external dependencies required
 */

interface CacheNode<T> {
  value: T;
  expiresAt: number;
}

interface LRUCacheOptions {
  /** Maximum number of entries */
  max: number;
  /** Time to live in milliseconds */
  ttl: number;
  /** Allow returning stale data while revalidating */
  allowStale?: boolean;
}

export class LRUCache<T> {
  private cache: Map<string, CacheNode<T>>;
  private maxSize: number;
  private ttl: number;
  private allowStale: boolean;

  constructor(options: LRUCacheOptions) {
    this.cache = new Map();
    this.maxSize = options.max;
    this.ttl = options.ttl;
    this.allowStale = options.allowStale || false;
  }

  get size(): number {
    return this.cache.size;
  }

  get max(): number {
    return this.maxSize;
  }

  set(key: string, value: T): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttl,
    });
  }

  get(key: string): T | undefined {
    const node = this.cache.get(key);

    if (!node) {
      return undefined;
    }

    // Check if expired
    if (Date.now() > node.expiresAt) {
      this.cache.delete(key);
      return this.allowStale ? node.value : undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, node);

    return node.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, node] of this.cache.entries()) {
      if (now > node.expiresAt && !this.allowStale) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Cache configuration for different endpoints
 */
const CACHE_CONFIG = {
  // ForYou / Latest content - changes frequently
  forYou: {
    max: 200,
    ttl: 1000 * 60 * 3, // 3 minutes
  },
  // Detail pages - relatively stable
  detail: {
    max: 500,
    ttl: 1000 * 60 * 10, // 10 minutes
  },
  // Episodes - stable
  episodes: {
    max: 300,
    ttl: 1000 * 60 * 15, // 15 minutes
  },
  // Search results - cache for shorter time
  search: {
    max: 1000,
    ttl: 1000 * 60 * 2, // 2 minutes
  },
  // Trending / Popular - changes periodically
  trending: {
    max: 100,
    ttl: 1000 * 60 * 5, // 5 minutes
  },
} as const;

type CacheType = keyof typeof CACHE_CONFIG;

/**
 * Global cache instances
 */
const caches: Record<CacheType, LRUCache<any>> = {
  forYou: new LRUCache({ ...CACHE_CONFIG.forYou, allowStale: true }),
  detail: new LRUCache({ ...CACHE_CONFIG.detail, allowStale: true }),
  episodes: new LRUCache({ ...CACHE_CONFIG.episodes, allowStale: true }),
  search: new LRUCache({ ...CACHE_CONFIG.search, allowStale: false }),
  trending: new LRUCache({ ...CACHE_CONFIG.trending, allowStale: true }),
};

/**
 * Get cached data
 */
export function getCached<T>(type: CacheType, key: string): T | undefined {
  return caches[type].get(key);
}

/**
 * Set cached data
 */
export function setCached<T>(type: CacheType, key: string, data: T): void {
  caches[type].set(key, data);
}

/**
 * Generate cache key with parameters
 */
export function generateCacheKey(
  endpoint: string,
  params: Record<string, string | number | boolean | undefined>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .filter(key => params[key] !== undefined)
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return sortedParams ? `${endpoint}?${sortedParams}` : endpoint;
}

/**
 * Get cache statistics
 */
export function getCacheStats(type: CacheType) {
  const cache = caches[type];

  return {
    size: cache.size,
    max: cache.max,
  };
}

/**
 * Clear specific cache
 */
export function clearCache(type: CacheType): void {
  caches[type].clear();
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  Object.values(caches).forEach(cache => cache.clear());
}

/**
 * Wrapper function for cached API calls
 */
export async function withCache<T>(
  type: CacheType,
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache first
  const cached = getCached<T>(type, key);
  if (cached) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Store in cache
  setCached(type, key, data);

  return data;
}

