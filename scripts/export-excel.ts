/**
 * Excel格式数据导出脚本
 * 将数据库中的地区和IP段数据导出为Excel格式
 */

import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import { silentDb as db } from '../src/server/db.js';

interface ExcelData {
  countries: any[];
  ipRanges: any[];
  summary: {
    totalCountries: number;
    totalIpRanges: number;
    independentCountries: number;
    territories: number;
    unMembers: number;
  };
}

async function exportToExcel(): Promise<void> {
  console.log('📊 开始导出Excel格式数据...');

  try {
    // 查询所有数据
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

    // 准备Excel数据
    const excelData: ExcelData = {
      countries: countries.map(country => ({
        id: country.id,
        code2: country.code2,
        nameEn: country.nameEn,
        nameZh: country.nameZh || '',
        continent: country.continent || '',
        region: country.region || '',
        independent: country.independent ? 'Yes' : 'No',
        unMember: country.unMember ? 'Yes' : 'No',
        ipRangeCount: country.ipRanges.length,
      })),
      ipRanges: [],
      summary: {
        totalCountries: countries.length,
        totalIpRanges: 0,
        independentCountries: countries.filter(c => c.independent).length,
        territories: countries.filter(c => !c.independent).length,
        unMembers: countries.filter(c => c.unMember).length,
      }
    };

    // 准备IP段数据
    for (const country of countries) {
      for (const ipRange of country.ipRanges) {
        excelData.ipRanges.push({
          countryId: country.id,
          countryCode: country.code2,
          countryName: country.nameEn,
          startIp: ipRange.startIp,
          endIp: ipRange.endIp,
          startIpInt: ipRange.startIpInt.toString(),
          endIpInt: ipRange.endIpInt.toString(),
          isp: ipRange.isp || '',
          regionName: ipRange.region?.name || '',
          cityName: ipRange.city?.name || '',
        });
        excelData.summary.totalIpRanges++;
      }
    }

    console.log(`📊 总计 ${excelData.summary.totalIpRanges} 个IP段`);

    // 创建Excel工作簿
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Geo IP Generator';
    workbook.lastModifiedBy = 'Data Sync Bot';
    workbook.created = new Date();
    workbook.modified = new Date();

    // 1. 概览工作表
    const summarySheet = workbook.addWorksheet('Summary', {
      properties: { tabColor: { argb: 'FF3366CC' } }
    });
    
    summarySheet.addRow(['Geo IP Data Summary']);
    summarySheet.addRow(['Generated at:', new Date().toISOString()]);
    summarySheet.addRow([]);
    summarySheet.addRow(['Metric', 'Count']);
    summarySheet.addRow(['Total Countries/Territories', excelData.summary.totalCountries]);
    summarySheet.addRow(['Independent Countries', excelData.summary.independentCountries]);
    summarySheet.addRow(['Territories/Dependencies', excelData.summary.territories]);
    summarySheet.addRow(['UN Members', excelData.summary.unMembers]);
    summarySheet.addRow(['Total IP Ranges', excelData.summary.totalIpRanges]);

    // 设置样式
    summarySheet.getCell('A1').font = { bold: true, size: 16 };
    summarySheet.getCell('A4').font = { bold: true };
    summarySheet.getCell('B4').font = { bold: true };
    summarySheet.getColumn('A').width = 30;
    summarySheet.getColumn('B').width = 15;

    // 2. 国家/地区工作表
    const countriesSheet = workbook.addWorksheet('Countries', {
      properties: { tabColor: { argb: 'FF33CC66' } }
    });

    const countryHeaders = [
      'Country ID', 'Code (2-letter)', 'Name (English)', 'Name (Chinese)',
      'Continent', 'Region', 'Independent', 'UN Member', 'IP Range Count'
    ];

    countriesSheet.addRow(countryHeaders);
    
    // 设置标题样式
    const countryHeaderRow = countriesSheet.getRow(1);
    countryHeaderRow.font = { bold: true };
    countryHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F3FF' }
    };

    // 添加国家数据
    for (const country of excelData.countries) {
      countriesSheet.addRow([
        country.id,
        country.code2,
        country.nameEn,
        country.nameZh,
        country.continent,
        country.region,
        country.independent,
        country.unMember,
        country.ipRangeCount
      ]);
    }

    // 设置列宽
    countriesSheet.getColumn(1).width = 12; // ID
    countriesSheet.getColumn(2).width = 8;  // Code
    countriesSheet.getColumn(3).width = 25; // Name EN
    countriesSheet.getColumn(4).width = 20; // Name ZH
    countriesSheet.getColumn(5).width = 15; // Continent
    countriesSheet.getColumn(6).width = 20; // Region
    countriesSheet.getColumn(7).width = 12; // Independent
    countriesSheet.getColumn(8).width = 12; // UN Member
    countriesSheet.getColumn(9).width = 15; // IP Count

    // 3. IP段工作表（如果数据不太大）
    if (excelData.ipRanges.length <= 100000) { // 限制为10万条以避免Excel性能问题
      const ipSheet = workbook.addWorksheet('IP Ranges', {
        properties: { tabColor: { argb: 'FFCC6633' } }
      });

      const ipHeaders = [
        'Country ID', 'Country Code', 'Country Name', 'Start IP', 'End IP',
        'Start IP (Int)', 'End IP (Int)', 'ISP', 'Region', 'City'
      ];

      ipSheet.addRow(ipHeaders);
      
      // 设置标题样式
      const ipHeaderRow = ipSheet.getRow(1);
      ipHeaderRow.font = { bold: true };
      ipHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFF2E6' }
      };

      // 添加IP数据
      for (const ipRange of excelData.ipRanges) {
        ipSheet.addRow([
          ipRange.countryId,
          ipRange.countryCode,
          ipRange.countryName,
          ipRange.startIp,
          ipRange.endIp,
          ipRange.startIpInt,
          ipRange.endIpInt,
          ipRange.isp,
          ipRange.regionName,
          ipRange.cityName
        ]);
      }

      // 设置列宽
      ipSheet.getColumn(1).width = 12; // Country ID
      ipSheet.getColumn(2).width = 8;  // Country Code
      ipSheet.getColumn(3).width = 20; // Country Name
      ipSheet.getColumn(4).width = 15; // Start IP
      ipSheet.getColumn(5).width = 15; // End IP
      ipSheet.getColumn(6).width = 15; // Start IP Int
      ipSheet.getColumn(7).width = 15; // End IP Int
      ipSheet.getColumn(8).width = 25; // ISP
      ipSheet.getColumn(9).width = 15; // Region
      ipSheet.getColumn(10).width = 15; // City

    } else {
      // 数据太大，创建说明工作表
      const noteSheet = workbook.addWorksheet('IP Ranges Note', {
        properties: { tabColor: { argb: 'FFFF6666' } }
      });
      
      noteSheet.addRow(['IP Ranges Data Too Large']);
      noteSheet.addRow([]);
      noteSheet.addRow([`Total IP ranges: ${excelData.summary.totalIpRanges}`]);
      noteSheet.addRow(['The IP ranges data is too large to include in Excel format.']);
      noteSheet.addRow(['Please use the CSV format for complete IP range data:']);
      noteSheet.addRow(['- combined-geo-ip-data.csv (full data)']);
      noteSheet.addRow(['- combined-geo-ip-data-light.csv (basic data)']);
      
      noteSheet.getCell('A1').font = { bold: true, size: 14 };
      noteSheet.getColumn('A').width = 50;
    }

    // 4. 统计工作表
    const statsSheet = workbook.addWorksheet('Statistics', {
      properties: { tabColor: { argb: 'FFCC33CC' } }
    });

    // 按大洲统计
    const continentStats: { [key: string]: number } = {};
    countries.forEach(country => {
      const continent = country.continent || 'Unknown';
      continentStats[continent] = (continentStats[continent] || 0) + 1;
    });

    statsSheet.addRow(['Statistics by Continent']);
    statsSheet.addRow([]);
    statsSheet.addRow(['Continent', 'Countries/Territories']);
    
    for (const [continent, count] of Object.entries(continentStats)) {
      statsSheet.addRow([continent, count]);
    }

    statsSheet.addRow([]);
    statsSheet.addRow(['Top 10 Countries by IP Ranges']);
    statsSheet.addRow(['Country', 'IP Range Count']);

    // 按IP段数量排序
    const topCountries = excelData.countries
      .sort((a, b) => b.ipRangeCount - a.ipRangeCount)
      .slice(0, 10);

    for (const country of topCountries) {
      statsSheet.addRow([country.nameEn, country.ipRangeCount]);
    }

    // 设置样式
    statsSheet.getCell('A1').font = { bold: true, size: 14 };
    statsSheet.getCell('A7').font = { bold: true, size: 14 };
    statsSheet.getCell('A3').font = { bold: true };
    statsSheet.getCell('B3').font = { bold: true };
    statsSheet.getCell('A8').font = { bold: true };
    statsSheet.getCell('B8').font = { bold: true };
    statsSheet.getColumn('A').width = 25;
    statsSheet.getColumn('B').width = 20;

    // 保存Excel文件
    const outputDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'combined-geo-ip-data.xlsx');
    await workbook.xlsx.writeFile(outputPath);

    // 计算文件大小
    const fileStats = fs.statSync(outputPath);
    const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);

    console.log('✅ Excel格式导出完成！');
    console.log(`📁 文件路径: ${outputPath}`);
    console.log(`📊 数据统计:`);
    console.log(`   - 工作表数量: ${workbook.worksheets.length}`);
    console.log(`   - 国家/地区: ${excelData.summary.totalCountries}`);
    console.log(`   - IP段: ${excelData.summary.totalIpRanges}`);
    console.log(`   - 文件大小: ${fileSizeMB}MB`);

    console.log(`📋 工作表说明:`);
    console.log(`   - Summary: 数据概览`);
    console.log(`   - Countries: 国家/地区详情`);
    console.log(`   - IP Ranges: IP段详情 ${excelData.ipRanges.length > 100000 ? '(数据过大，请查看Note)' : ''}`);
    console.log(`   - Statistics: 统计分析`);

  } catch (error) {
    console.error('❌ Excel导出失败:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  exportToExcel().catch(error => {
    console.error('💥 Excel导出过程出现致命错误:', error);
    process.exit(1);
  });
}

export { exportToExcel }; 