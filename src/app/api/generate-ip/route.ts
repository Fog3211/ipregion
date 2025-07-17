import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createCaller } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';

// Input validation schema
const generateIpSchema = z.object({
  country: z.string().min(1, 'Country parameter is required'),
  count: z.coerce.number().min(1).max(10).default(1),
});

/**
 * Generate IP addresses by country/region
 * 
 * Query parameters:
 * - country: 2-letter code (CN), 3-letter code (CHN), or country name
 * - count: Number of IPs to generate (1-10, default: 1)
 * 
 * Examples:
 * GET /api/generate-ip?country=CN&count=3
 * GET /api/generate-ip?country=CHN&count=1  
 * GET /api/generate-ip?country=China&count=5
 */
export async function GET(request: NextRequest) {
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
          details: result.error.issues 
        },
        { status: 400 }
      );
    }

    // Create tRPC context and caller
    const ctx = await createTRPCContext({
      headers: request.headers,
    });
    const caller = createCaller(ctx);

    // Call tRPC procedure
    const response = await caller.ipRegion.generateIpByCountry({
      query: result.data.country,
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

/**
 * Generate IP addresses by country/region (POST method)
 * 
 * Request body:
 * {
 *   "country": "CN",
 *   "count": 3
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Parse and validate input
    const result = generateIpSchema.safeParse({
      country: body.country,
      count: body.count,
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request body', 
          details: result.error.issues 
        },
        { status: 400 }
      );
    }

    // Create tRPC context and caller
    const ctx = await createTRPCContext({
      headers: request.headers,
    });
    const caller = createCaller(ctx);

    // Call tRPC procedure
    const response = await caller.ipRegion.generateIpByCountry({
      query: result.data.country,
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