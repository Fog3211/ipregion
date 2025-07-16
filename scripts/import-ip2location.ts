import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';
import { COUNTRIES, getCountryByCode2 } from './data/countries';
import { ipToInt, intToIp } from '../src/lib/ip-utils';
import { db } from '../src/server/db';

const streamPipeline = promisify(pipeline);

// IP2Location LITE download URL (free version)
const IP2LOCATION_URL = 'https://download.ip2location.com/lite/IP2LOCATION-LITE-DB1.CSV.ZIP';
const DATA_DIR = path.join(process.cwd(), 'scripts', 'data');
const ZIP_FILE = path.join(DATA_DIR, 'IP2LOCATION-LITE-DB1.CSV.ZIP');
const CSV_FILE = path.join(DATA_DIR, 'IP2LOCATION-LITE-DB1.CSV');

interface IPLocationRecord {
  startIp: string;
  endIp: string;
  startIpInt: string;
  endIpInt: string;
  countryCode: string;
  countryName: string;
}



async function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

async function downloadIPData(): Promise<void> {
  console.log('📥 Downloading IP2Location LITE database...');
  console.log('📍 Data source: IP2Location LITE DB1 (Country only, Free version)');
  console.log('🔗 More info: https://lite.ip2location.com/');
  
  try {
    const response = await fetch(IP2LOCATION_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const fileStream = createWriteStream(ZIP_FILE);
    if (response.body) {
      await streamPipeline(response.body as any, fileStream);
    }
    
    console.log('✅ Download completed');
  } catch (error) {
    console.error('❌ Download failed:', error);
    throw error;
  }
}

async function extractZipFile(): Promise<void> {
  console.log('📂 Extracting ZIP file...');
  
  try {
    // Use unzip command (available on macOS/Linux)
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    await execAsync(`cd "${DATA_DIR}" && unzip -o "${ZIP_FILE}"`);
    console.log('✅ ZIP file extracted');
  } catch (error) {
    console.error('❌ ZIP extraction failed:', error);
    console.log('💡 Please manually extract the ZIP file to continue');
    throw error;
  }
}

async function parseCSVFile(): Promise<IPLocationRecord[]> {
  console.log('📖 Parsing CSV file...');
  
  const records: IPLocationRecord[] = [];
  const parser = parse({
    columns: false,
    skip_empty_lines: true,
  });
  
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(CSV_FILE);
    
    stream.pipe(parser);
    
    parser.on('data', (row: string[]) => {
      try {
        // IP2Location CSV format: start_ip_int, end_ip_int, country_code, country_name
        const startIpInt = row[0];
        const endIpInt = row[1];
        const countryCode = row[2];
        const countryName = row[3];
        
        if (startIpInt && endIpInt && countryCode && countryName) {
          const startIp = intToIp(BigInt(startIpInt));
          const endIp = intToIp(BigInt(endIpInt));
          
          records.push({
            startIp,
            endIp,
            startIpInt,
            endIpInt,
            countryCode: countryCode.replace(/"/g, ''), // Remove quotes
            countryName: countryName.replace(/"/g, ''), // Remove quotes
          });
        }
      } catch (error) {
        console.warn('⚠️ Skipping invalid row:', error);
      }
    });
    
    parser.on('end', () => {
      console.log(`✅ Parsed ${records.length} IP ranges`);
      resolve(records);
    });
    
    parser.on('error', reject);
  });
}

async function importCountries(): Promise<void> {
  console.log('🌍 Importing country data...');
  
  // Clear existing data
  await db.ipRange.deleteMany();
  await db.region.deleteMany();
  await db.city.deleteMany();
  await db.country.deleteMany();
  
  // Import countries
  for (const country of COUNTRIES) {
    await db.country.create({
      data: {
        id: country.id,
        code2: country.code2,
        nameEn: country.nameEn,
        nameZh: country.nameZh,
        continent: country.continent,
        region: country.region,
      },
    });
  }
  
  console.log(`✅ Imported ${COUNTRIES.length} countries`);
}

async function importIPRanges(records: IPLocationRecord[]): Promise<void> {
  console.log('🔢 Importing IP ranges...');
  
  let imported = 0;
  let skipped = 0;
  const batchSize = 1000;
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const ipRanges = [];
    
    for (const record of batch) {
      // Find matching country by 2-letter code
      const country = getCountryByCode2(record.countryCode);
      
      if (country) {
        ipRanges.push({
          startIp: record.startIp,
          endIp: record.endIp,
          startIpInt: BigInt(record.startIpInt),
          endIpInt: BigInt(record.endIpInt),
          countryId: country.id, // Use 3-letter code
          isp: null,
        });
        imported++;
      } else {
        console.warn(`⚠️ Unknown country code: ${record.countryCode}`);
        skipped++;
      }
    }
    
    if (ipRanges.length > 0) {
      await db.ipRange.createMany({
        data: ipRanges,
      });
    }
    
    // Progress indicator
    if ((i / batchSize + 1) % 10 === 0) {
      console.log(`📊 Progress: ${Math.min(i + batchSize, records.length)}/${records.length} records processed`);
    }
  }
  
  console.log(`✅ Imported ${imported} IP ranges`);
  console.log(`⚠️ Skipped ${skipped} records (unknown countries)`);
}

async function cleanup(): Promise<void> {
  console.log('🧹 Cleaning up temporary files...');
  
  try {
    if (fs.existsSync(ZIP_FILE)) {
      fs.unlinkSync(ZIP_FILE);
    }
    if (fs.existsSync(CSV_FILE)) {
      fs.unlinkSync(CSV_FILE);
    }
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.warn('⚠️ Cleanup warning:', error);
  }
}

async function showStatistics(): Promise<void> {
  console.log('\n📊 Import Statistics:');
  
  const countryCount = await db.country.count();
  const ipRangeCount = await db.ipRange.count();
  
  console.log(`   Countries: ${countryCount}`);
  console.log(`   IP Ranges: ${ipRangeCount}`);
  
  // Show some example queries
  console.log('\n🎯 Example queries you can now test:');
  console.log('   - Generate random IP for "CHN" (China)');
  console.log('   - Generate random IP for "USA" (United States)');
  console.log('   - Generate random IP for "JPN" (Japan)');
  console.log('   - API: GET /api/generate-ip?country=CHN');
}

async function main() {
  console.log('🚀 Starting Real IP Data Import...');
  console.log('📊 Data Source: IP2Location LITE (Free)');
  console.log('🌍 Coverage: Global IP ranges with country information');
  console.log('');
  
  try {
    await ensureDataDirectory();
    
    // Check if CSV file already exists
    if (!fs.existsSync(CSV_FILE)) {
      await downloadIPData();
      await extractZipFile();
    } else {
      console.log('📁 Using existing CSV file');
    }
    
    const records = await parseCSVFile();
    await importCountries();
    await importIPRanges(records);
    await cleanup();
    await showStatistics();
    
    console.log('\n🎉 Real IP data import completed successfully!');
    console.log('💡 Your IP generator now uses real global IP ranges');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    
    if (error instanceof Error && error.message.includes('unzip')) {
      console.log('\n💡 Manual extraction required:');
      console.log(`1. Extract ${ZIP_FILE}`);
      console.log(`2. Ensure ${CSV_FILE} exists`);
      console.log('3. Run this script again');
    }
    
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main().catch(console.error); 