import { NextRequest, NextResponse } from 'next/server';
import { generateIpByCountry, generateIpSchema } from '~/lib/services/ip-service';
import { withRateLimit } from '~/lib/middleware/rate-limit-middleware';

/**
 * Generate random IP addresses by country/region (GET only)
 * 
 * Security measures:
 * - IP rate limiting (10 requests per minute)
 * - Parameter validation with regex patterns
 * - Count limited to 1-10 (matches frontend)
 * - Input sanitization and length limits
 * 
 * Query parameters:
 * - country: 2-letter code (CN), 3-letter code (CHN), or country name (required)
 * - count: Number of IPs to generate (1-10, default: 1)
 * 
 * Examples:
 * GET /api/generate-ip?country=CN&count=3
 * GET /api/generate-ip?country=China&count=1
 */
async function handleGenerateIP(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Additional security: Check if too many parameters (prevent parameter pollution)
    if (searchParams.toString().length > 200) {
      return NextResponse.json(
        {
          error: 'Request too large',
          message: 'Query string exceeds maximum length'
        },
        { status: 400 }
      );
    }

    // Parse and validate input with strict validation
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

    // Call service function directly
    const response = await generateIpByCountry({
      country: result.data.country,
      count: result.data.count,
    });

    // Return clean REST response
    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Generate IP API error:', error);

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
export const GET = withRateLimit(handleGenerateIP, 'generate-ip');

