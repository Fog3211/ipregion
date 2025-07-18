/**
 * IP Rate Limiting Middleware
 * Provides IP-based rate limiting using Redis backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { incrementRateLimit, CACHE_TTL } from '~/lib/cache';

// Rate limit configuration per endpoint
export const RATE_LIMITS = {
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
} as const;

/**
 * Extract client IP address from request
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  const clientIP = request.headers.get('x-client-ip');
  
  // Return the first available IP
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0]?.trim() || '';
  }
  
  if (realIP) return realIP;
  if (cfConnectingIP) return cfConnectingIP;
  if (clientIP) return clientIP;
  
  // Fallback to unknown if no IP headers are available
  return 'unknown';
}

/**
 * Extract endpoint name from request URL
 */
function getEndpointName(request: NextRequest): string {
  const pathname = new URL(request.url).pathname;
  
  // Extract endpoint from API path
  const match = pathname.match(/\/api\/([^\/]+)/);
  if (match?.[1]) {
    return match[1];
  }
  
  return 'default';
}

/**
 * Rate limiting middleware
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  endpoint?: string
): Promise<NextResponse | null> {
  try {
    // Get client IP and endpoint
    const clientIP = getClientIP(request);
    const endpointName = endpoint || getEndpointName(request);
    
    // Skip rate limiting for localhost in development
    if (process.env.NODE_ENV === 'development' && 
        (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === 'localhost')) {
      return null; // Allow request to continue
    }
    
    // Get rate limit config for this endpoint
    const config = RATE_LIMITS[endpointName as keyof typeof RATE_LIMITS] || RATE_LIMITS.default;
    
    // Check current request count
    const currentCount = await incrementRateLimit(clientIP, endpointName, config.ttl);
    
    // If Redis is not available, allow request (fail open)
    if (currentCount === 0) {
      return null;
    }
    
    // Check if limit exceeded
    if (currentCount > config.requests) {
      console.warn(`Rate limit exceeded for IP ${clientIP} on endpoint ${endpointName}: ${currentCount}/${config.requests}`);
      
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Max ${config.requests} requests per minute allowed.`,
          retryAfter: Math.ceil(config.windowMs / 1000),
          timestamp: new Date().toISOString(),
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.requests.toString(),
            'X-RateLimit-Remaining': Math.max(0, config.requests - currentCount).toString(),
            'X-RateLimit-Reset': new Date(Date.now() + config.windowMs).toISOString(),
            'Retry-After': Math.ceil(config.windowMs / 1000).toString(),
          }
        }
      );
    }
    
    // Request is within limits, allow it to continue
    return null;
    
  } catch (error) {
    console.error('Rate limiting middleware error:', error);
    // On error, allow request to continue (fail open)
    return null;
  }
}

/**
 * Higher-order function to wrap API routes with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  endpoint?: string
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Apply rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request, endpoint);
    
    // If rate limited, return the rate limit response
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Otherwise, continue with the original handler
    return handler(request);
  };
}

/**
 * Rate limit information for client
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: string;
  endpoint: string;
}

/**
 * Get rate limit information for debugging
 */
export function getRateLimitInfo(endpoint: string): RateLimitInfo {
  const config = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.default;
  
  return {
    limit: config.requests,
    remaining: config.requests, // This would need to be calculated based on current usage
    reset: new Date(Date.now() + config.windowMs).toISOString(),
    endpoint,
  };
} 