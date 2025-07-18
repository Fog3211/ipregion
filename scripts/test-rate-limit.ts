#!/usr/bin/env tsx

/**
 * Rate Limit Testing Script
 * Tests the IP rate limiting functionality by making rapid requests
 */

import { performance } from 'perf_hooks';

interface TestResult {
  status: number;
  headers: Record<string, string>;
  body?: unknown;
  timestamp: number;
}

/**
 * Make a request to the API and capture response details
 */
async function makeRequest(url: string, headers: Record<string, string> = {}): Promise<TestResult> {
  const start = performance.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'RateLimit-Test-Script/1.0',
        ...headers,
      },
    });
    
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }
    
    return {
      status: response.status,
      headers: responseHeaders,
      body,
      timestamp: performance.now() - start,
    };
  } catch (error) {
    console.error('Request failed:', error);
    return {
      status: 0,
      headers: {},
      body: { error: error instanceof Error ? error.message : 'Unknown error' },
      timestamp: performance.now() - start,
    };
  }
}

/**
 * Test rate limiting for a specific endpoint
 */
async function testEndpoint(baseUrl: string, endpoint: string, maxRequests: number = 15): Promise<void> {
  console.log(`\n🧪 Testing rate limit for /${endpoint}`);
  console.log(`Making ${maxRequests} requests rapidly...`);
  
  const url = `${baseUrl}/api/${endpoint}${endpoint === 'generate-ip' ? '?country=CN&count=1' : ''}`;
  const results: TestResult[] = [];
  
  // Make requests rapidly
  for (let i = 0; i < maxRequests; i++) {
    const result = await makeRequest(url);
    results.push(result);
    
    // Log status changes
    if (i === 0 || result.status !== results[i - 1]?.status) {
      console.log(`  Request ${i + 1}: Status ${result.status} (${result.timestamp.toFixed(2)}ms)`);
      
      if (result.status === 429) {
        console.log(`  Rate limit headers:`, {
          limit: result.headers['x-ratelimit-limit'],
          remaining: result.headers['x-ratelimit-remaining'],
          reset: result.headers['x-ratelimit-reset'],
          retryAfter: result.headers['retry-after'],
        });
      }
    }
    
    // Short delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Analyze results
  const successCount = results.filter(r => r.status === 200).length;
  const rateLimitedCount = results.filter(r => r.status === 429).length;
  const errorCount = results.filter(r => r.status !== 200 && r.status !== 429).length;
  
  console.log('\n📊 Results Summary:');
  console.log(`  ✅ Successful requests: ${successCount}`);
  console.log(`  🚫 Rate limited requests: ${rateLimitedCount}`);
  console.log(`  ❌ Error requests: ${errorCount}`);
  
  if (rateLimitedCount > 0) {
    console.log('  ✅ Rate limiting is working correctly!');
  } else {
    console.log('  ⚠️  No rate limiting detected - check Redis connection');
  }
}

/**
 * Test with different IP addresses (simulation)
 */
async function testWithDifferentIPs(baseUrl: string): Promise<void> {
  console.log('\n🌐 Testing with simulated different IP addresses');
  
  const testIPs = ['192.168.1.1', '10.0.0.1', '172.16.0.1'];
  const endpoint = 'generate-ip?country=CN&count=1';
  
  for (const ip of testIPs) {
    console.log(`\nTesting with IP: ${ip}`);
    
    // Make several requests with the same fake IP
    for (let i = 0; i < 5; i++) {
      const result = await makeRequest(`${baseUrl}/api/${endpoint}`, {
        'X-Forwarded-For': ip,
        'X-Real-IP': ip,
      });
      
      console.log(`  Request ${i + 1}: Status ${result.status}`);
      
      if (result.status === 429) {
        console.log(`  🚫 Rate limited after ${i + 1} requests`);
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
}

/**
 * Main test function
 */
async function main(): Promise<void> {
  const baseUrl = process.env.TEST_URL || 'http://localhost:3000';
  
  console.log('🚀 Starting Rate Limit Tests');
  console.log(`Target URL: ${baseUrl}`);
  console.log('Note: Ensure Redis is configured for rate limiting to work\n');
  
  try {
    // Test health endpoint (most permissive)
    await testEndpoint(baseUrl, 'health', 10);
    
    // Test countries endpoint (moderate)
    await testEndpoint(baseUrl, 'countries', 15);
    
    // Test generate-ip endpoint (most restrictive)
    await testEndpoint(baseUrl, 'generate-ip', 15);
    
    // Test with different simulated IPs
    await testWithDifferentIPs(baseUrl);
    
    console.log('\n✅ Rate limit testing completed!');
    console.log('\n💡 Tips:');
    console.log('  - If no rate limiting is detected, check REDIS_URL environment variable');
    console.log('  - Rate limits reset after 1 minute');
    console.log('  - Different endpoints have different limits (health: 100, countries: 30, generate-ip: 10)');
    console.log('  - In development, localhost requests may be excluded from rate limiting');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  main().catch(console.error);
}

export { testEndpoint, testWithDifferentIPs }; 