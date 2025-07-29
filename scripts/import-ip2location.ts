import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';
import { ipToInt, intToIp } from '../src/lib/utils/ip-utils';
import { silentDb as db, optimizeSQLiteForBulkOps } from '../src/server/db';

const streamPipeline = promisify(pipeline);

// IP2Location LITE download URL (free version)
const IP2LOCATION_URL = 'https://download.ip2location.com/lite/IP2LOCATION-LITE-DB1.CSV.ZIP';
const DATA_DIR = path.join(process.cwd(), 'scripts', 'data');
const ZIP_FILE = path.join(DATA_DIR, 'IP2LOCATION-LITE-DB1.CSV.ZIP');
const CSV_FILE = path.join(DATA_DIR, 'IP2LOCATION-LITE-DB1.CSV');

interface IPLocationRecord {
  startIp: string;
  endIp: string;
  countryCode: string;
  countryName: string;
}

interface DatabaseStats {
  total: number;
  imported: number;
  skipped: number;
  errors: number;
}

// Territory lookup cache for performance
let territoryCache: Map<string, { id: string; nameEn: string }> | null = null;

/**
 * Load and cache territory data from database
 */
async function loadTerritoryCache(): Promise<void> {
  if (territoryCache) return;
  
  console.log('🔄 Loading territory data from database...');
  
  const territories = await db.country.findMany({
    select: {
      id: true,
      code2: true,
      nameEn: true,
    },
  });
  
  territoryCache = new Map();
  territories.forEach(territory => {
    territoryCache!.set(territory.code2.toUpperCase(), {
      id: territory.id,
      nameEn: territory.nameEn,
    });
  });
  
  console.log(`✅ Loaded ${territories.length} territories into cache`);
}

/**
 * Find territory by 2-letter code
 */
function getTerritoryByCode2(code2: string): { id: string; nameEn: string } | undefined {
  if (!territoryCache) {
    throw new Error('Territory cache not loaded. Call loadTerritoryCache() first.');
  }
  return territoryCache.get(code2.toUpperCase());
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

async function importIPRanges(records: IPLocationRecord[]): Promise<void> {
  console.log('🔢 Importing IP ranges...');
  
  // Load territory cache first
  await loadTerritoryCache();
  
  const stats: DatabaseStats = {
    total: records.length,
    imported: 0,
    skipped: 0,
    errors: 0,
  };
  
  const batchSize = 5000; // Increased batch size for better performance
  console.log(`📦 Processing ${records.length} records in batches of ${batchSize}...`);
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    try {
      // Prepare batch data for bulk insert
      const batchData: Array<{
        startIp: string;
        endIp: string;
        startIpInt: bigint;
        endIpInt: bigint;
        countryId: string;
      }> = [];
      
      // Process batch to filter valid records
      for (const record of batch) {
        const territory = getTerritoryByCode2(record.countryCode);
        if (territory) {
          batchData.push({
            startIp: record.startIp,
            endIp: record.endIp,
            startIpInt: BigInt(ipToInt(record.startIp)),
            endIpInt: BigInt(ipToInt(record.endIp)),
            countryId: territory.id,
          });
        } else {
          stats.skipped++;
        }
      }
      
      // Bulk insert the entire batch in a transaction
      if (batchData.length > 0) {
        await db.$transaction(async (tx) => {
          const result = await tx.ipRange.createMany({
            data: batchData,
          });
          
          stats.imported += result.count;
        }, {
          timeout: 120000, // 2 minutes timeout for large batches
        });
      }
      
    } catch (error) {
      console.error(`❌ Error importing batch starting at index ${i}:`, error);
      stats.errors += batch.length;
    }
    
    // Progress update
    const processed = Math.min(i + batchSize, records.length);
    const progressPct = Math.round((processed / stats.total) * 100);
    console.log(`   📊 Progress: ${processed}/${stats.total} (${progressPct}%) - Imported: ${stats.imported}, Skipped: ${stats.skipped}, Errors: ${stats.errors}`);
  }
  
  console.log(`✅ IP range import completed:`);
  console.log(`   Total records: ${stats.total}`);
  console.log(`   Successfully imported: ${stats.imported}`);
  console.log(`   Skipped (unknown territory): ${stats.skipped}`);
  console.log(`   Errors: ${stats.errors}`);
  console.log(`   Success rate: ${Math.round((stats.imported / stats.total) * 100)}%`);
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
  console.log('\n📈 Final Statistics:');
  
  const territoryCount = await db.country.count();
  const ipRangeCount = await db.ipRange.count();
  
  console.log(`   Total territories/countries: ${territoryCount}`);
  console.log(`   IP ranges: ${ipRangeCount}`);
  
  // Show IP ranges by territory (top 10)
  const topTerritories = await db.country.findMany({
    select: {
      code2: true,
      nameEn: true,
      nameZh: true,
      _count: {
        select: {
          ipRanges: true,
        },
      },
    },
    orderBy: {
      ipRanges: {
        _count: 'desc',
      },
    },
    take: 10,
  });
  
  console.log('\n🏆 Top 10 territories by IP ranges:');
  topTerritories.forEach((territory, index) => {
    const chineseName = territory.nameZh ? ` / ${territory.nameZh}` : '';
    console.log(`   ${index + 1}. ${territory.code2} - ${territory.nameEn}${chineseName} (${territory._count.ipRanges} ranges)`);
  });
  
  console.log('\n🎯 Next steps:');
  console.log('   1. Run database migration: pnpm run db:generate');
  console.log('   2. Update territories data: pnpm run import:territories');
  console.log('   3. Test API: GET /api/trpc/ipRegion.generateIpByCountry?input={"query":"CHN","count":1}');
}

async function main() {
  console.log('🚀 Starting Real IP Data Import...');
  console.log('📊 Data Source: IP2Location LITE (Free)');
  console.log('🌍 Coverage: Global IP ranges with country information');
  console.log('');
  
  try {
    // Apply SQLite optimizations for bulk operations (using silent client)
    await optimizeSQLiteForBulkOps(db);
    
    await ensureDataDirectory();
    
    // Check if CSV file already exists
    if (!fs.existsSync(CSV_FILE)) {
      await downloadIPData();
      await extractZipFile();
    } else {
      console.log('📁 Using existing CSV file');
    }
    
    const records = await parseCSVFile();
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