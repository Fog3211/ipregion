/**
 * Redis Cache Management
 * Provides caching layer for IP region data
 */

import Redis from 'ioredis';
import { env } from '~/env';

// Cache key prefixes
export const CACHE_KEYS = {
  COUNTRY: 'country',
  IP_RANGES: 'ipranges',
  GENERATED: 'generated',
  COUNTRY_LIST: 'country_list',
} as const;

// Cache TTL in seconds
export const CACHE_TTL = {
  COUNTRY: 24 * 60 * 60,        // 24 hours - country data rarely changes
  IP_RANGES: 6 * 60 * 60,       // 6 hours - IP ranges are relatively stable
  GENERATED: 5 * 60,            // 5 minutes - generated results for deduplication
  COUNTRY_LIST: 12 * 60 * 60,   // 12 hours - country list is stable
} as const;

class CacheManager {
  private redis: Redis | null = null;
  private isEnabled = false;

  constructor() {
    this.initializeRedis();
  }

  private initializeRedis() {
    try {
      const redisUrl = env.REDIS_URL;
      if (redisUrl) {
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          showFriendlyErrorStack: process.env.NODE_ENV === 'development',
        });

        this.redis.on('error', (err) => {
          console.warn('Redis connection error, falling back to no cache:', err.message);
          this.isEnabled = false;
        });

        this.redis.on('connect', () => {
          console.log('Redis connected successfully');
          this.isEnabled = true;
        });

        this.isEnabled = true;
      } else {
        console.log('Redis URL not provided, running without cache');
        this.isEnabled = false;
      }
    } catch (error) {
      console.warn('Failed to initialize Redis:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Generate cache key with prefix
   */
  private getKey(prefix: string, identifier: string): string {
    return `ipregion:${prefix}:${identifier}`;
  }

  /**
   * Get data from cache
   */
  async get<T>(prefix: string, identifier: string): Promise<T | null> {
    if (!this.isEnabled || !this.redis) {
      return null;
    }

    try {
      const key = this.getKey(prefix, identifier);
      const cached = await this.redis.get(key);
      
      if (cached) {
        return JSON.parse(cached) as T;
      }
      
      return null;
    } catch (error) {
      console.warn(`Cache get error for ${prefix}:${identifier}:`, error);
      return null;
    }
  }

  /**
   * Set data in cache
   */
  async set(prefix: string, identifier: string, data: unknown, ttl: number): Promise<void> {
    if (!this.isEnabled || !this.redis) {
      return;
    }

    try {
      const key = this.getKey(prefix, identifier);
      const serialized = JSON.stringify(data);
      await this.redis.setex(key, ttl, serialized);
    } catch (error) {
      console.warn(`Cache set error for ${prefix}:${identifier}:`, error);
    }
  }

  /**
   * Delete specific cache entry
   */
  async delete(prefix: string, identifier: string): Promise<void> {
    if (!this.isEnabled || !this.redis) {
      return;
    }

    try {
      const key = this.getKey(prefix, identifier);
      await this.redis.del(key);
    } catch (error) {
      console.warn(`Cache delete error for ${prefix}:${identifier}:`, error);
    }
  }

  /**
   * Clear all cache entries with specific prefix
   */
  async clearPrefix(prefix: string): Promise<void> {
    if (!this.isEnabled || !this.redis) {
      return;
    }

    try {
      const pattern = this.getKey(prefix, '*');
      const keys = await this.redis.keys(pattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.warn(`Cache clear prefix error for ${prefix}:`, error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ connected: boolean; keyCount: number } | null> {
    if (!this.isEnabled || !this.redis) {
      return { connected: false, keyCount: 0 };
    }

    try {
      const keys = await this.redis.keys('ipregion:*');
      return {
        connected: true,
        keyCount: keys.length,
      };
    } catch (error) {
      console.warn('Cache stats error:', error);
      return { connected: false, keyCount: 0 };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.isEnabled || !this.redis) {
      return false;
    }

    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.warn('Cache health check failed:', error);
      return false;
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
      this.isEnabled = false;
    }
  }
}

// Singleton instance
export const cache = new CacheManager();

// Utility functions for common cache operations

/**
 * Cache wrapper function for any async operation
 */
export async function withCache<T>(
  cacheKey: { prefix: string; identifier: string },
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache first
  const cached = await cache.get<T>(cacheKey.prefix, cacheKey.identifier);
  if (cached !== null) {
    return cached;
  }

  // Execute the function and cache the result
  const result = await fetchFn();
  await cache.set(cacheKey.prefix, cacheKey.identifier, result, ttl);
  
  return result;
}

/**
 * Generate cache identifier for country queries
 */
export function getCountryCacheKey(query: string): string {
  return query.toLowerCase().trim();
}

/**
 * Generate cache identifier for IP generation
 */
export function getGenerationCacheKey(query: string, count: number): string {
  return `${query.toLowerCase().trim()}:${count}`;
}
