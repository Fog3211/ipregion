import { NextRequest, NextResponse } from 'next/server';
import { getCountries } from '~/lib/services/ip-service';

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
    // Call service function directly
    const countries = await getCountries();

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