import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '~/lib/middleware/rate-limit-middleware';

/**
 * Health check endpoint for keep-alive monitoring
 * Returns basic app status and timestamp
 * Rate limited to 100 requests per minute per IP
 */
async function handleHealthCheck(request: NextRequest) {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Geo IP Generator service is running',
    version: process.env.npm_package_version || 'unknown'
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

// Export the rate-limited handler
export const GET = withRateLimit(handleHealthCheck, 'health'); 