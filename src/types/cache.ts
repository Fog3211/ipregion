/**
 * Cache Types and Interfaces
 */

export interface CacheConfig {
  prefix: string;
  ttl: number;
}

export interface CacheStats {
  connected: boolean;
  keyCount: number;
}

export interface RateLimitConfig {
  requests: number;
  windowMs: number;
  ttl: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: string;
  endpoint: string;
}

export type CacheKey = {
  prefix: string;
  identifier: string;
};

export type RateLimitEndpoint = 'generate-ip' | 'countries' | 'health' | 'default'; 