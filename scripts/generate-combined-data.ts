/**
 * 生成合并的JSON数据文件
 * 将国家/地区数据和IP段数据合并为单一JSON文件
 */

import fs from 'fs';
import path from 'path';
import { silentDb as db } from '../src/server/db.js';

interface CombinedCountryData {
  id: string; // CHN, USA, HKG
  code2: string; // CN, US, HK
  nameEn: string;
  nameZh?: string;
  continent?: string;
  region?: string;
  independent: boolean;
  unMember: boolean;
  ipRanges: Array<{
    startIp: string;
    endIp: string;
    startIpInt: string; // 转为字符串避免JSON精度问题
    endIpInt: string;
    isp?: string;
  }>;
}

interface CombinedData {
  metadata: {
    version: string;
    generatedAt: string;
    countries: number;
    ipRanges: number;
    dataSize: string;
  };
  countries: CombinedCountryData[];
}

async function generateCombinedData() {
  console.log('🔄 正在生成合并数据...');

  try {
    // 查询所有国家和对应的IP段
    const countries = await db.country.findMany({
      include: {
        ipRanges: {
          select: {
            startIp: true,
            endIp: true,
            startIpInt: true,
            endIpInt: true,
            isp: true,
          },
        },
      },
      orderBy: {
        nameEn: 'asc',
      },
    });

    console.log(`📊 找到 ${countries.length} 个国家/地区`);

    // 转换数据格式
    const combinedData: CombinedData = {
      metadata: {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        countries: countries.length,
        ipRanges: countries.reduce((sum, country) => sum + country.ipRanges.length, 0),
        dataSize: '',
      },
      countries: countries.map((country) => ({
        id: country.id,
        code2: country.code2,
        nameEn: country.nameEn,
        nameZh: country.nameZh || undefined,
        continent: country.continent || undefined,
        region: country.region || undefined,
        independent: country.independent || false,
        unMember: country.unMember || false,
        ipRanges: country.ipRanges.map((range) => ({
          startIp: range.startIp,
          endIp: range.endIp,
          startIpInt: range.startIpInt.toString(),
          endIpInt: range.endIpInt.toString(),
          isp: range.isp || undefined,
        })),
      })),
    };

    // 生成JSON文件
    const outputPath = path.join(process.cwd(), 'data', 'combined-geo-ip-data.json');
    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const jsonContent = JSON.stringify(combinedData, null, 2);
    fs.writeFileSync(outputPath, jsonContent, 'utf-8');

    // 计算文件大小
    const fileStats = fs.statSync(outputPath);
    const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);
    
    // 更新metadata中的文件大小
    combinedData.metadata.dataSize = `${fileSizeMB}MB`;
    const updatedJsonContent = JSON.stringify(combinedData, null, 2);
    fs.writeFileSync(outputPath, updatedJsonContent, 'utf-8');

    console.log(`✅ 合并数据生成完成！`);
    console.log(`📁 文件路径: ${outputPath}`);
    console.log(`📊 数据统计:`);
    console.log(`   - 国家/地区: ${combinedData.metadata.countries}`);
    console.log(`   - IP段: ${combinedData.metadata.ipRanges}`);
    console.log(`   - 文件大小: ${fileSizeMB}MB`);

    // 生成压缩版本（移除不必要的字段）
    const compressedData = {
      ...combinedData,
      countries: combinedData.countries.map((country) => ({
        id: country.id,
        code2: country.code2,
        nameEn: country.nameEn,
        nameZh: country.nameZh,
        independent: country.independent,
        ipRanges: country.ipRanges.map((range) => [
          range.startIpInt,
          range.endIpInt,
        ]),
      })),
    };

    const compressedPath = path.join(process.cwd(), 'data', 'combined-geo-ip-data.min.json');
    fs.writeFileSync(compressedPath, JSON.stringify(compressedData), 'utf-8');
    
    const compressedStats = fs.statSync(compressedPath);
    const compressedSizeMB = (compressedStats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`📦 压缩版本: ${compressedSizeMB}MB (节省 ${(100 - (compressedStats.size / fileStats.size) * 100).toFixed(1)}%)`);

  } catch (error) {
    console.error('❌ 生成数据失败:', error);
    process.exit(1);
  }
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  generateCombinedData();
}
