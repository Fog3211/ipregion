/**
 * CSV格式数据导出脚本
 * 将数据库中的地区和IP段数据导出为CSV格式
 */

import fs from 'fs';
import path from 'path';
import { stringify } from 'csv-stringify/sync';
import { silentDb as db } from '../src/server/db.js';

interface CsvRecord {
  countryId: string;
  countryCode2: string;
  countryNameEn: string;
  countryNameZh?: string;
  continent?: string;
  region?: string;
  independent: boolean;
  unMember: boolean;
  startIp: string;
  endIp: string;
  startIpInt: string;
  endIpInt: string;
  isp?: string;
  regionName?: string;
  cityName?: string;
}

async function exportToCsv(): Promise<void> {
  console.log('📋 开始导出CSV格式数据...');

  try {
    // 查询所有国家和对应的IP段
    const countries = await db.country.findMany({
      include: {
        ipRanges: {
          include: {
            region: true,
            city: true,
          },
        },
      },
      orderBy: {
        nameEn: 'asc',
      },
    });

    console.log(`📊 找到 ${countries.length} 个国家/地区`);

    // 转换为CSV记录格式
    const csvRecords: CsvRecord[] = [];
    let totalIpRanges = 0;

    for (const country of countries) {
      if (country.ipRanges.length === 0) {
        // 如果没有IP段，至少保留国家信息
        csvRecords.push({
          countryId: country.id,
          countryCode2: country.code2,
          countryNameEn: country.nameEn,
          countryNameZh: country.nameZh || undefined,
          continent: country.continent || undefined,
          region: country.region || undefined,
          independent: country.independent || false,
          unMember: country.unMember || false,
          startIp: '',
          endIp: '',
          startIpInt: '',
          endIpInt: '',
          isp: undefined,
          regionName: undefined,
          cityName: undefined,
        });
      } else {
        // 为每个IP段创建一条记录
        for (const ipRange of country.ipRanges) {
          csvRecords.push({
            countryId: country.id,
            countryCode2: country.code2,
            countryNameEn: country.nameEn,
            countryNameZh: country.nameZh || undefined,
            continent: country.continent || undefined,
            region: country.region || undefined,
            independent: country.independent || false,
            unMember: country.unMember || false,
            startIp: ipRange.startIp,
            endIp: ipRange.endIp,
            startIpInt: ipRange.startIpInt.toString(),
            endIpInt: ipRange.endIpInt.toString(),
            isp: ipRange.isp || undefined,
            regionName: ipRange.region?.name || undefined,
            cityName: ipRange.city?.name || undefined,
          });
          totalIpRanges++;
        }
      }
    }

    console.log(`📊 总计 ${csvRecords.length} 条记录 (${totalIpRanges} 个IP段)`);

    // 准备CSV数据
    const csvData = csvRecords.map(record => [
      record.countryId,
      record.countryCode2,
      record.countryNameEn,
      record.countryNameZh || '',
      record.continent || '',
      record.region || '',
      record.independent ? 'Yes' : 'No',
      record.unMember ? 'Yes' : 'No',
      record.startIp,
      record.endIp,
      record.startIpInt,
      record.endIpInt,
      record.isp || '',
      record.regionName || '',
      record.cityName || ''
    ]);

    // 添加标题行
    const csvHeaders = [
      'Country ID',
      'Country Code (2-letter)',
      'Country Name (English)',
      'Country Name (Chinese)',
      'Continent',
      'Region',
      'Independent',
      'UN Member',
      'Start IP',
      'End IP',
      'Start IP (Integer)',
      'End IP (Integer)',
      'ISP',
      'Region Name',
      'City Name'
    ];

    const csvContent = stringify([csvHeaders, ...csvData], {
      quoted: true,
    });

    // 确保输出目录存在
    const outputDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'combined-geo-ip-data.csv');
    fs.writeFileSync(outputPath, csvContent, 'utf-8');

    // 计算文件大小
    const fileStats = fs.statSync(outputPath);
    const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);

    console.log('✅ CSV格式导出完成！');
    console.log(`📁 文件路径: ${outputPath}`);
    console.log(`📊 数据统计:`);
    console.log(`   - 记录数: ${csvRecords.length}`);
    console.log(`   - 国家/地区: ${countries.length}`);
    console.log(`   - IP段: ${totalIpRanges}`);
    console.log(`   - 文件大小: ${fileSizeMB}MB`);

    // 生成轻量版CSV（只包含基本信息）
    const lightRecords = csvRecords
      .filter(record => record.startIp) // 只保留有IP数据的记录
      .map(record => [
        record.countryCode2,
        record.countryNameEn,
        record.startIp,
        record.endIp,
      ]);

    const lightHeaders = ['Country Code', 'Country Name', 'Start IP', 'End IP'];
    const lightContent = stringify([lightHeaders, ...lightRecords], {
      quoted: true,
    });

    const lightPath = path.join(outputDir, 'combined-geo-ip-data-light.csv');
    fs.writeFileSync(lightPath, lightContent, 'utf-8');

    const lightStats = fs.statSync(lightPath);
    const lightSizeMB = (lightStats.size / (1024 * 1024)).toFixed(2);

    console.log(`📦 轻量版本: ${lightSizeMB}MB (包含 ${lightRecords.length} 条IP记录)`);

  } catch (error) {
    console.error('❌ CSV导出失败:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  exportToCsv().catch(error => {
    console.error('💥 CSV导出过程出现致命错误:', error);
    process.exit(1);
  });
}

export { exportToCsv }; 