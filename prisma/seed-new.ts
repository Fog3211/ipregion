import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// IP地址转换为整数的工具函数
function ipToInt(ip: string): bigint {
  const parts = ip.split('.').map(Number);
  return BigInt(parts[0]!) * BigInt(256 ** 3) + 
         BigInt(parts[1]!) * BigInt(256 ** 2) + 
         BigInt(parts[2]!) * BigInt(256) + 
         BigInt(parts[3]!);
}

async function main() {
  console.log('🚀 开始创建示例数据...');

  // 清理现有数据
  await prisma.ipRange.deleteMany();
  await prisma.city.deleteMany();
  await prisma.region.deleteMany();
  await prisma.country.deleteMany();

  // 创建国家数据
  const countries = [
    {
      id: 'CN',
      nameEn: 'China',
      nameZh: '中国',
      continent: 'Asia',
      region: 'East Asia',
    },
    {
      id: 'US',
      nameEn: 'United States',
      nameZh: '美国',
      continent: 'North America',
      region: 'Northern America',
    },
    {
      id: 'JP',
      nameEn: 'Japan',
      nameZh: '日本',
      continent: 'Asia',
      region: 'East Asia',
    },
  ];

  for (const country of countries) {
    await prisma.country.create({
      data: country,
    });
  }

  // 创建省/州数据
  const regions = [
    // 中国的省份
    { name: 'Beijing', nameZh: '北京', countryId: 'CN' },
    { name: 'Shanghai', nameZh: '上海', countryId: 'CN' },
    { name: 'Guangdong', nameZh: '广东', countryId: 'CN' },
    
    // 美国的州
    { name: 'California', nameZh: '加利福尼亚', countryId: 'US' },
    { name: 'New York', nameZh: '纽约', countryId: 'US' },
    
    // 日本的都道府县
    { name: 'Tokyo', nameZh: '东京都', countryId: 'JP' },
    { name: 'Osaka', nameZh: '大阪府', countryId: 'JP' },
  ];

  const createdRegions = [];
  for (const region of regions) {
    const created = await prisma.region.create({
      data: region,
    });
    createdRegions.push(created);
  }

  // 创建城市数据
  const cities = [
    // 中国城市
    { name: 'Beijing', nameZh: '北京', latitude: 39.9042, longitude: 116.4074, regionId: createdRegions.find(r => r.name === 'Beijing')!.id },
    { name: 'Shanghai', nameZh: '上海', latitude: 31.2304, longitude: 121.4737, regionId: createdRegions.find(r => r.name === 'Shanghai')!.id },
    { name: 'Guangzhou', nameZh: '广州', latitude: 23.1291, longitude: 113.2644, regionId: createdRegions.find(r => r.name === 'Guangdong')!.id },
    { name: 'Shenzhen', nameZh: '深圳', latitude: 22.5431, longitude: 114.0579, regionId: createdRegions.find(r => r.name === 'Guangdong')!.id },
    
    // 美国城市
    { name: 'Los Angeles', nameZh: '洛杉矶', latitude: 34.0522, longitude: -118.2437, regionId: createdRegions.find(r => r.name === 'California')!.id },
    { name: 'San Francisco', nameZh: '旧金山', latitude: 37.7749, longitude: -122.4194, regionId: createdRegions.find(r => r.name === 'California')!.id },
    { name: 'New York', nameZh: '纽约', latitude: 40.7128, longitude: -74.0060, regionId: createdRegions.find(r => r.name === 'New York')!.id },
    
    // 日本城市
    { name: 'Tokyo', nameZh: '东京', latitude: 35.6762, longitude: 139.6503, regionId: createdRegions.find(r => r.name === 'Tokyo')!.id },
    { name: 'Osaka', nameZh: '大阪', latitude: 34.6937, longitude: 135.5023, regionId: createdRegions.find(r => r.name === 'Osaka')!.id },
  ];

  const createdCities = [];
  for (const city of cities) {
    const created = await prisma.city.create({
      data: city,
    });
    createdCities.push(created);
  }

  // 创建IP段数据，包含省/市关联
  const ipRanges = [
    // 中国IP段
    {
      startIp: '1.1.1.0',
      endIp: '1.1.1.255',
      countryId: 'CN',
      regionId: createdRegions.find(r => r.name === 'Beijing')!.id,
      cityId: createdCities.find(c => c.name === 'Beijing')!.id,
      isp: 'China Telecom',
    },
    {
      startIp: '1.1.2.0',
      endIp: '1.1.2.255',
      countryId: 'CN',
      regionId: createdRegions.find(r => r.name === 'Shanghai')!.id,
      cityId: createdCities.find(c => c.name === 'Shanghai')!.id,
      isp: 'China Unicom',
    },
    {
      startIp: '1.1.3.0',
      endIp: '1.1.3.255',
      countryId: 'CN',
      regionId: createdRegions.find(r => r.name === 'Guangdong')!.id,
      cityId: createdCities.find(c => c.name === 'Guangzhou')!.id,
      isp: 'China Mobile',
    },
    {
      startIp: '1.1.4.0',
      endIp: '1.1.4.255',
      countryId: 'CN',
      regionId: createdRegions.find(r => r.name === 'Guangdong')!.id,
      cityId: createdCities.find(c => c.name === 'Shenzhen')!.id,
      isp: 'China Telecom',
    },

    // 美国IP段
    {
      startIp: '8.8.8.0',
      endIp: '8.8.8.255',
      countryId: 'US',
      regionId: createdRegions.find(r => r.name === 'California')!.id,
      cityId: createdCities.find(c => c.name === 'Los Angeles')!.id,
      isp: 'Google LLC',
    },
    {
      startIp: '8.8.9.0',
      endIp: '8.8.9.255',
      countryId: 'US',
      regionId: createdRegions.find(r => r.name === 'California')!.id,
      cityId: createdCities.find(c => c.name === 'San Francisco')!.id,
      isp: 'Cloudflare',
    },
    {
      startIp: '8.8.10.0',
      endIp: '8.8.10.255',
      countryId: 'US',
      regionId: createdRegions.find(r => r.name === 'New York')!.id,
      cityId: createdCities.find(c => c.name === 'New York')!.id,
      isp: 'Verizon',
    },

    // 日本IP段
    {
      startIp: '126.1.1.0',
      endIp: '126.1.1.255',
      countryId: 'JP',
      regionId: createdRegions.find(r => r.name === 'Tokyo')!.id,
      cityId: createdCities.find(c => c.name === 'Tokyo')!.id,
      isp: 'NTT Communications',
    },
    {
      startIp: '126.1.2.0',
      endIp: '126.1.2.255',
      countryId: 'JP',
      regionId: createdRegions.find(r => r.name === 'Osaka')!.id,
      cityId: createdCities.find(c => c.name === 'Osaka')!.id,
      isp: 'SoftBank',
    },
  ];

  for (const ipRange of ipRanges) {
    await prisma.ipRange.create({
      data: {
        ...ipRange,
        startIpInt: ipToInt(ipRange.startIp),
        endIpInt: ipToInt(ipRange.endIp),
      },
    });
  }

  console.log('✅ 示例数据创建完成!');
  console.log('📊 统计信息:');
  console.log(`   国家: ${countries.length} 个`);
  console.log(`   省/州: ${regions.length} 个`);
  console.log(`   城市: ${cities.length} 个`);
  console.log(`   IP段: ${ipRanges.length} 个`);
  console.log('');
  console.log('🎯 您现在可以使用以下查询进行测试:');
  console.log('   - 查询"中国"或"CN"的IP段');
  console.log('   - 查询"美国"或"US"的IP段');
  console.log('   - 反查IP "1.1.1.100" 的归属地');
  console.log('   - 生成"CN"的随机IP地址');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据创建失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
