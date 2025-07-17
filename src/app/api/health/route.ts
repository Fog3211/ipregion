import { NextResponse } from 'next/server';

/**
 * Health check endpoint for keep-alive monitoring
 * Returns basic app status and timestamp
 */
export async function GET() {
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