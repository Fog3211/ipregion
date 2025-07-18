/**
 * Cache Configuration
 */

import type { RateLimitConfig, RateLimitEndpoint } from '~/types';

// Cache key prefixes
export const CACHE_KEYS = {
  COUNTRY: 'country',
  IP_RANGES: 'ipranges',
  GENERATED: 'generated',
  COUNTRY_LIST: 'country_list',
  RATE_LIMIT: 'ratelimit',
} as const;

// Cache TTL in seconds
export const CACHE_TTL = {
  COUNTRY: 24 * 60 * 60,        // 24 hours - country data rarely changes
  IP_RANGES: 6 * 60 * 60,       // 6 hours - IP ranges are relatively stable
  GENERATED: 5 * 60,            // 5 minutes - generated results for deduplication
  COUNTRY_LIST: 12 * 60 * 60,   // 12 hours - country list is stable
  RATE_LIMIT: 60,               // 1 minute - rate limit window
} as const;

// Rate limit configuration per endpoint
export const RATE_LIMITS: Record<RateLimitEndpoint, RateLimitConfig> = {
  // Generate IP endpoint - more restrictive as it's computationally expensive
  'generate-ip': {
    requests: 10,       // 10 requests
    windowMs: 60 * 1000, // per minute
    ttl: CACHE_TTL.RATE_LIMIT,
  },
  // Countries endpoint - less restrictive as it's mostly cached
  'countries': {
    requests: 30,       // 30 requests
    windowMs: 60 * 1000, // per minute
    ttl: CACHE_TTL.RATE_LIMIT,
  },
  // Health endpoint - very permissive
  'health': {
    requests: 100,      // 100 requests
    windowMs: 60 * 1000, // per minute
    ttl: CACHE_TTL.RATE_LIMIT,
  },
  // Default fallback
  'default': {
    requests: 20,       // 20 requests
    windowMs: 60 * 1000, // per minute
    ttl: CACHE_TTL.RATE_LIMIT,
  },
}; 