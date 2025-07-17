import { NextRequest, NextResponse } from 'next/server';
import { createCaller } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';

/**
 * Get list of all available countries/regions
 * 
 * Returns all countries with their codes, names, and IP range counts
 * 
 * Example:
 * GET /api/countries
 */
export async function GET(request: NextRequest) {
  try {
    // Create tRPC context and caller
    const ctx = await createTRPCContext({
      headers: request.headers,
    });
    const caller = createCaller(ctx);

    // Call tRPC procedure
    const countries = await caller.ipRegion.getCountries();

    // Return clean REST response
    return NextResponse.json({
      success: true,
      data: {
        countries,
        totalCount: countries.length,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Countries API error:', error);
    
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