/**
 * 测试JSON服务的功能
 */

import { generateIpByCountry, getCountries, getDataStats } from '../src/lib/services/ip-service-json.js';

async function testJsonService() {
  console.log('🧪 Testing JSON-based IP service...\n');

  try {
    // 测试数据统计
    console.log('📊 Testing data stats...');
    const stats = await getDataStats();
    console.log('Stats:', JSON.stringify(stats, null, 2));
    console.log('');

    // 测试国家列表
    console.log('🌍 Testing countries list...');
    const countries = await getCountries();
    console.log(`Found ${countries.countries.length} countries`);
    console.log('Sample countries:', countries.countries.slice(0, 3));
    console.log('');

    // 测试IP生成 - 中国
    console.log('🇨🇳 Testing IP generation for China...');
    const chinaIps = await generateIpByCountry({ country: 'CN', count: 3 });
    console.log('China IPs:', JSON.stringify(chinaIps, null, 2));
    console.log('');

    // 测试IP生成 - 美国
    console.log('🇺🇸 Testing IP generation for USA...');
    const usaIps = await generateIpByCountry({ country: 'USA', count: 2 });
    console.log('USA IPs:', JSON.stringify(usaIps, null, 2));
    console.log('');

    // 测试IP生成 - 香港
    console.log('🇭🇰 Testing IP generation for Hong Kong...');
    const hkIps = await generateIpByCountry({ country: 'HK', count: 1 });
    console.log('Hong Kong IPs:', JSON.stringify(hkIps, null, 2));
    console.log('');

    console.log('✅ All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  testJsonService();
}
