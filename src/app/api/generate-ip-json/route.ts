import { NextRequest, NextResponse } from 'next/server';
import { generateIpByCountry, generateIpSchema } from '~/lib/services/ip-service-json';
import { withRateLimit } from '~/lib/middleware/rate-limit-middleware';

/**
 * 基于JSON数据的IP生成API (测试版本)
 * 
 * Query parameters:
 * - country: 2-letter code (CN), 3-letter code (CHN), or country name (required)
 * - count: Number of IPs to generate (1-10, default: 1)
 * 
 * Examples:
 * GET /api/generate-ip-json?country=CN&count=3
 * GET /api/generate-ip-json?country=China&count=1
 */
async function handleGenerateIPJson(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate input
    const result = generateIpSchema.safeParse({
      country: searchParams.get('country'),
      count: searchParams.get('count'),
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          message: 'Please check your country and count parameters',
          details: result.error.issues.map(issue => ({
            field: issue.path[0],
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    // Call JSON-based service function
    const response = await generateIpByCountry({
      country: result.data.country,
      count: result.data.count,
    });

    // Return clean REST response
    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
      source: 'json-data'
    });

  } catch (error) {
    console.error('Generate IP JSON API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Export the rate-limited handler
export const GET = withRateLimit(handleGenerateIPJson, 'generate-ip-json');
