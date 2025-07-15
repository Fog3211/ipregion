#!/usr/bin/env tsx
/**
 * IP2Location 数据导入脚本
 * 
 * 使用说明：
 * 1. 从 https://lite.ip2location.com/ 下载 IP2LOCATION-LITE-DB11.CSV
 * 2. 将文件放在 scripts/data/ 目录下
 * 3. 运行 npm run import:ip2location
 */

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface IP2LocationRecord {
  ip_from: string;
  ip_to: string;
  country_code: string;
  country_name: string;
  region_name: string;
  city_name: string;
  latitude: string;
  longitude: string;
  zip_code: string;
  time_zone: string;
}

// IP地址转整数
function ipToInt(ip: string): bigint {
  const parts = ip.split('.').map(Number);
  // 使用BigInt计算，避免位运算符问题
  return BigInt(parts[0]!) * BigInt(256 ** 3) + 
         BigInt(parts[1]!) * BigInt(256 ** 2) + 
         BigInt(parts[2]!) * BigInt(256) + 
         BigInt(parts[3]!);
}

// 国家名称中英文映射
const countryNames: Record<string, string> = {
  'China': '中国',
  'United States': '美国',
  'Japan': '日本',
  'Germany': '德国',
  'United Kingdom': '英国',
  'France': '法国',
  'Canada': '加拿大',
  'Australia': '澳大利亚',
  'South Korea': '韩国',
  'India': '印度',
  'Brazil': '巴西',
  'Russia': '俄罗斯',
  'Italy': '意大利',
  'Spain': '西班牙',
  'Netherlands': '荷兰',
  'Singapore': '新加坡',
  'Thailand': '泰国',
  'Malaysia': '马来西亚',
  'Indonesia': '印度尼西亚',
  'Philippines': '菲律宾',
  'Taiwan': '台湾',
  'Hong Kong': '香港',
  'Mexico': '墨西哥',
  'Argentina': '阿根廷',
  'Sweden': '瑞典',
  'Norway': '挪威',
  'Denmark': '丹麦',
  'Finland': '芬兰',
  'Switzerland': '瑞士',
  'Austria': '奥地利',
  'Belgium': '比利时',
  'Poland': '波兰',
  'Czech Republic': '捷克',
  'Turkey': '土耳其',
  'Egypt': '埃及',
  'South Africa': '南非',
  'Israel': '以色列',
  'Saudi Arabia': '沙特阿拉伯',
  'United Arab Emirates': '阿联酋',
  'New Zealand': '新西兰',
  'Chile': '智利',
  'Colombia': '哥伦比亚',
  'Peru': '秘鲁',
  'Vietnam': '越南',
  'Bangladesh': '孟加拉国',
  'Pakistan': '巴基斯坦',
  'Iran': '伊朗',
  'Iraq': '伊拉克',
  'Ukraine': '乌克兰',
  'Romania': '罗马尼亚',
  'Hungary': '匈牙利',
  'Bulgaria': '保加利亚',
  'Croatia': '克罗地亚',
  'Serbia': '塞尔维亚',
  'Slovenia': '斯洛文尼亚',
  'Slovakia': '斯洛伐克',
  'Lithuania': '立陶宛',
  'Latvia': '拉脱维亚',
  'Estonia': '爱沙尼亚',
  'Ireland': '爱尔兰',
  'Portugal': '葡萄牙',
  'Greece': '希腊',
  'Cyprus': '塞浦路斯',
  'Malta': '马耳他',
  'Luxembourg': '卢森堡',
  'Iceland': '冰岛',
  'Belarus': '白俄罗斯',
  'Moldova': '摩尔多瓦',
  'Albania': '阿尔巴尼亚',
  'Macedonia': '马其顿',
  'Bosnia and Herzegovina': '波黑',
  'Montenegro': '黑山',
  'Kosovo': '科索沃'
};

// 中国省份名称映射
const chineseProvinces: Record<string, string> = {
  'Beijing': '北京',
  'Shanghai': '上海',
  'Tianjin': '天津',
  'Chongqing': '重庆',
  'Guangdong': '广东',
  'Jiangsu': '江苏',
  'Shandong': '山东',
  'Zhejiang': '浙江',
  'Henan': '河南',
  'Sichuan': '四川',
  'Hunan': '湖南',
  'Hubei': '湖北',
  'Hebei': '河北',
  'Fujian': '福建',
  'Anhui': '安徽',
  'Guangxi': '广西',
  'Yunnan': '云南',
  'Jiangxi': '江西',
  'Liaoning': '辽宁',
  'Heilongjiang': '黑龙江',
  'Shaanxi': '陕西',
  'Jilin': '吉林',
  'Shanxi': '山西',
  'Guizhou': '贵州',
  'Inner Mongolia': '内蒙古',
  'Xinjiang': '新疆',
  'Gansu': '甘肃',
  'Hainan': '海南',
  'Ningxia': '宁夏',
  'Tibet': '西藏',
  'Qinghai': '青海',
  'Hong Kong': '香港',
  'Macau': '澳门',
  'Taiwan': '台湾'
};

async function importIP2LocationData() {
  const csvFilePath = path.join(__dirname, 'data', 'IP2LOCATION-LITE-DB11.CSV');
  
  if (!fs.existsSync(csvFilePath)) {
    console.error('❌ CSV文件不存在:', csvFilePath);
    console.log('📥 请从以下地址下载 IP2LOCATION-LITE-DB11.CSV:');
    console.log('🔗 https://lite.ip2location.com/database/ip-country-region-city-latitude-longitude-zipcode-timezone');
    console.log('📁 并将文件放在 scripts/data/ 目录下');
    process.exit(1);
  }

  console.log('🚀 开始导入 IP2Location 数据...');
  console.log('📂 文件路径:', csvFilePath);

  // 统计计数器
  let totalRecords = 0;
  let processedRecords = 0;
  let skippedRecords = 0;
  let errorRecords = 0;

  // 缓存已创建的国家、省份、城市
  const countryCache = new Map<string, boolean>();
  const regionCache = new Map<string, boolean>();
  const cityCache = new Map<string, boolean>();

  const records: IP2LocationRecord[] = [];

  // 读取CSV文件
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv({
        headers: ['ip_from', 'ip_to', 'country_code', 'country_name', 'region_name', 'city_name', 'latitude', 'longitude', 'zip_code', 'time_zone']
      }))
      .on('data', (data: IP2LocationRecord) => {
        if (data.country_code && data.country_code !== '-' && data.ip_from && data.ip_to) {
          records.push(data);
          totalRecords++;
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`📊 读取到 ${totalRecords} 条记录`);

  // 分批处理数据
  const batchSize = 1000;
  const totalBatches = Math.ceil(records.length / batchSize);

  for (let i = 0; i < totalBatches; i++) {
    const batch = records.slice(i * batchSize, (i + 1) * batchSize);
    console.log(`⏳ 处理批次 ${i + 1}/${totalBatches} (${batch.length} 条记录)...`);

    try {
      await prisma.$transaction(async (tx) => {
        for (const record of batch) {
          try {
            const countryCode = record.country_code.toUpperCase();
            const countryName = record.country_name;
            const regionName = record.region_name === '-' ? null : record.region_name;
            const cityName = record.city_name === '-' ? null : record.city_name;
            const latitude = record.latitude === '-' ? null : parseFloat(record.latitude);
            const longitude = record.longitude === '-' ? null : parseFloat(record.longitude);

            // 1. 创建或获取国家
            if (!countryCache.has(countryCode)) {
              await tx.country.upsert({
                where: { id: countryCode },
                create: {
                  id: countryCode,
                  nameEn: countryName,
                  nameZh: countryNames[countryName] || null,
                  continent: getContinent(countryCode),
                  region: getRegion(countryCode),
                },
                update: {}
              });
              countryCache.set(countryCode, true);
            }

            let regionId: number | null = null;
            let cityId: number | null = null;

            // 2. 创建或获取省份
            if (regionName) {
              const regionKey = `${countryCode}:${regionName}`;
              if (!regionCache.has(regionKey)) {
                const region = await tx.region.upsert({
                  where: {
                    name_countryId: {
                      name: regionName,
                      countryId: countryCode
                    }
                  },
                  create: {
                    name: regionName,
                    nameZh: chineseProvinces[regionName] || null,
                    countryId: countryCode,
                  },
                  update: {}
                });
                regionCache.set(regionKey, true);
                regionId = region.id;
              } else {
                // 查找已存在的region
                const existingRegion = await tx.region.findFirst({
                  where: {
                    name: regionName,
                    countryId: countryCode
                  }
                });
                regionId = existingRegion?.id || null;
              }
            }

            // 3. 创建或获取城市
            if (cityName && regionId) {
              const cityKey = `${regionId}:${cityName}`;
              if (!cityCache.has(cityKey)) {
                const city = await tx.city.upsert({
                  where: {
                    name_regionId: {
                      name: cityName,
                      regionId: regionId
                    }
                  },
                  create: {
                    name: cityName,
                    nameZh: null, // 可以后续添加中文名映射
                    latitude,
                    longitude,
                    regionId,
                  },
                  update: {}
                });
                cityCache.set(cityKey, true);
                cityId = city.id;
              } else {
                // 查找已存在的city
                const existingCity = await tx.city.findFirst({
                  where: {
                    name: cityName,
                    regionId
                  }
                });
                cityId = existingCity?.id || null;
              }
            }

            // 4. 创建IP段
            const startIpInt = ipToInt(record.ip_from);
            const endIpInt = ipToInt(record.ip_to);

            await tx.ipRange.create({
              data: {
                startIp: record.ip_from,
                endIp: record.ip_to,
                startIpInt,
                endIpInt,
                countryId: countryCode,
                regionId,
                cityId,
                isp: null, // IP2Location Lite版本不包含ISP信息
              }
            });

            processedRecords++;
          } catch (error) {
            console.error(`❌ 处理记录失败:`, record, error);
            errorRecords++;
          }
        }
      });
    } catch (error) {
      console.error(`❌ 批次处理失败:`, error);
      skippedRecords += batch.length;
    }

    // 显示进度
    const progress = ((i + 1) / totalBatches * 100).toFixed(1);
    console.log(`✅ 批次 ${i + 1}/${totalBatches} 完成 (${progress}%)`);
  }

  console.log('\n🎉 导入完成!');
  console.log(`📊 统计信息:`);
  console.log(`   总记录数: ${totalRecords}`);
  console.log(`   成功导入: ${processedRecords}`);
  console.log(`   跳过记录: ${skippedRecords}`);
  console.log(`   错误记录: ${errorRecords}`);
  console.log(`   成功率: ${((processedRecords / totalRecords) * 100).toFixed(2)}%`);
}

// 根据国家代码获取大洲
function getContinent(countryCode: string): string {
  const continentMap: Record<string, string> = {
    // 亚洲
    'CN': 'Asia', 'JP': 'Asia', 'KR': 'Asia', 'IN': 'Asia', 'TH': 'Asia', 'MY': 'Asia', 
    'SG': 'Asia', 'ID': 'Asia', 'PH': 'Asia', 'VN': 'Asia', 'TW': 'Asia', 'HK': 'Asia',
    'BD': 'Asia', 'PK': 'Asia', 'IR': 'Asia', 'IQ': 'Asia', 'SA': 'Asia', 'AE': 'Asia',
    'IL': 'Asia', 'TR': 'Asia',
    
    // 欧洲
    'DE': 'Europe', 'GB': 'Europe', 'FR': 'Europe', 'IT': 'Europe', 'ES': 'Europe',
    'NL': 'Europe', 'SE': 'Europe', 'NO': 'Europe', 'DK': 'Europe', 'FI': 'Europe',
    'CH': 'Europe', 'AT': 'Europe', 'BE': 'Europe', 'PL': 'Europe', 'CZ': 'Europe',
    'RU': 'Europe', 'UA': 'Europe', 'RO': 'Europe', 'HU': 'Europe', 'BG': 'Europe',
    'HR': 'Europe', 'RS': 'Europe', 'SI': 'Europe', 'SK': 'Europe', 'LT': 'Europe',
    'LV': 'Europe', 'EE': 'Europe', 'IE': 'Europe', 'PT': 'Europe', 'GR': 'Europe',
    
    // 北美洲
    'US': 'North America', 'CA': 'North America', 'MX': 'North America',
    
    // 南美洲
    'BR': 'South America', 'AR': 'South America', 'CL': 'South America', 
    'CO': 'South America', 'PE': 'South America',
    
    // 大洋洲
    'AU': 'Oceania', 'NZ': 'Oceania',
    
    // 非洲
    'ZA': 'Africa', 'EG': 'Africa'
  };
  
  return continentMap[countryCode] || 'Unknown';
}

// 根据国家代码获取地区
function getRegion(countryCode: string): string {
  const regionMap: Record<string, string> = {
    'CN': 'East Asia', 'JP': 'East Asia', 'KR': 'East Asia', 'TW': 'East Asia', 'HK': 'East Asia',
    'US': 'North America', 'CA': 'North America', 'MX': 'North America',
    'DE': 'Western Europe', 'GB': 'Western Europe', 'FR': 'Western Europe', 'IT': 'Western Europe',
    'AU': 'Australia and New Zealand', 'NZ': 'Australia and New Zealand',
    'BR': 'South America', 'AR': 'South America',
    'IN': 'Southern Asia', 'PK': 'Southern Asia', 'BD': 'Southern Asia',
    'TH': 'South-Eastern Asia', 'MY': 'South-Eastern Asia', 'SG': 'South-Eastern Asia',
    'RU': 'Eastern Europe', 'UA': 'Eastern Europe'
  };
  
  return regionMap[countryCode] || 'Unknown';
}

// 主执行函数
async function main() {
  try {
    await importIP2LocationData();
  } catch (error) {
    console.error('❌ 导入过程中发生错误:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

export { importIP2LocationData };
