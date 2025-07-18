/**
 * API Types and Interfaces
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
  timestamp: string;
}

export interface RateLimitResponse extends ApiError {
  retryAfter: number;
}

export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
  'Retry-After': string;
}

export interface GenerateIpRequest {
  country: string;
  count: number;
}

export interface GenerateIpResponse {
  ips: string[];
  country: {
    code: string;
    name: string;
  };
  count: number;
  ranges_used: number;
}

export interface Country {
  code2: string;
  code3: string;
  name: string;
  ranges_count: number;
}

export interface CountriesResponse {
  countries: Country[];
  totalCount: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  message: string;
  version: string;
} 