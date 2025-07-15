#!/usr/bin/env tsx
/**
 * IP2Location Data Import Script
 * 
 * 1. Download IP2LOCATION-LITE-DB11.CSV from https://lite.ip2location.com/
 * 2. Place the file in scripts/data/ directory
 * 3. Run pnpm run import:ip2location
 */

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { db } from '../src/server/db';

interface IP2LocationRow {
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

// Convert IP address to integer
function ipToInt(ip: string): bigint {
  const parts = ip.split('.').map(Number);
  return BigInt(parts[0]! * 256 * 256 * 256 + parts[1]! * 256 * 256 + parts[2]! * 256 + parts[3]!);
}

// Convert integer to IP address
function intToIp(int: bigint): string {
  const num = Number(int);
  return [
    Math.floor(num / (256 * 256 * 256)) % 256,
    Math.floor(num / (256 * 256)) % 256,
    Math.floor(num / 256) % 256,
    num % 256
  ].join('.');
}

async function importIP2LocationData() {
  const csvFilePath = path.join(__dirname, 'data', 'IP2LOCATION-LITE-DB11.CSV');
  
  if (!fs.existsSync(csvFilePath)) {
    console.error('❌ CSV file not found:', csvFilePath);
    console.log('📥 Please download IP2LOCATION-LITE-DB11.CSV from https://lite.ip2location.com/');
    console.log('📁 and place it in scripts/data/ directory');
    process.exit(1);
  }

  console.log('🚀 Starting IP2Location data import...');
  
  const countries = new Map<string, any>();
  const regions = new Map<string, any>();
  const cities = new Map<string, any>();
  const ipRanges: any[] = [];
  
  let rowCount = 0;

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv({ headers: false }))
      .on('data', (row: any) => {
        try {
          const data: IP2LocationRow = {
            ip_from: row[0],
            ip_to: row[1],
            country_code: row[2],
            country_name: row[3],
            region_name: row[4],
            city_name: row[5],
            latitude: row[6],
            longitude: row[7],
            zip_code: row[8],
            time_zone: row[9],
          };

          // Process country data
          if (data.country_code && data.country_code !== '-') {
            countries.set(data.country_code, {
              id: data.country_code,
              nameEn: data.country_name || data.country_code,
              nameZh: null, // Can be supplemented later
              continent: null,
              region: null,
            });
          }

          // Process region data
          if (data.region_name && data.region_name !== '-') {
            const regionKey = `${data.country_code}_${data.region_name}`;
            regions.set(regionKey, {
              name: data.region_name,
              nameZh: null,
              countryId: data.country_code,
            });
          }

          // Process city data
          if (data.city_name && data.city_name !== '-' && data.region_name && data.region_name !== '-') {
            const regionKey = `${data.country_code}_${data.region_name}`;
            const cityKey = `${regionKey}_${data.city_name}`;
            
            cities.set(cityKey, {
              name: data.city_name,
              nameZh: null,
              latitude: data.latitude && data.latitude !== '-' ? parseFloat(data.latitude) : null,
              longitude: data.longitude && data.longitude !== '-' ? parseFloat(data.longitude) : null,
              regionKey: regionKey,
            });
          }

          // Process IP range data
          if (data.ip_from && data.ip_to && data.country_code) {
            const startIp = intToIp(BigInt(data.ip_from));
            const endIp = intToIp(BigInt(data.ip_to));
            
            ipRanges.push({
              startIp,
              endIp,
              startIpInt: BigInt(data.ip_from),
              endIpInt: BigInt(data.ip_to),
              countryId: data.country_code,
              regionName: data.region_name && data.region_name !== '-' ? data.region_name : null,
              cityName: data.city_name && data.city_name !== '-' ? data.city_name : null,
              isp: null, // IP2Location Lite version doesn't include ISP info
            });
          }

          rowCount++;
          if (rowCount % 10000 === 0) {
            console.log(`📊 Processed ${rowCount} records...`);
          }
        } catch (error) {
          console.error('❌ Error processing row:', error);
        }
      })
      .on('end', async () => {
        try {
          console.log(`✅ CSV processing completed, total ${rowCount} records`);
          console.log(`📈 Found ${countries.size} countries, ${regions.size} regions, ${cities.size} cities, ${ipRanges.length} IP ranges`);
          
          // Import data to database
          console.log('💾 Starting database import...');
          
          // Clear existing data
          await db.ipRange.deleteMany();
          await db.city.deleteMany();
          await db.region.deleteMany();
          await db.country.deleteMany();
          
          // Import countries
          console.log('🌍 Importing countries...');
          for (const country of countries.values()) {
            await db.country.create({ data: country });
          }
          
          // Import regions
          console.log('📍 Importing regions...');
          const regionMap = new Map<string, number>();
          for (const region of regions.values()) {
            const created = await db.region.create({ data: region });
            regionMap.set(`${region.countryId}_${region.name}`, created.id);
          }
          
          // Import cities
          console.log('🏙️ Importing cities...');
          const cityMap = new Map<string, number>();
          for (const city of cities.values()) {
            const regionId = regionMap.get(city.regionKey);
            if (regionId) {
              const created = await db.city.create({ 
                data: {
                  ...city,
                  regionId,
                  regionKey: undefined,
                }
              });
              cityMap.set(`${city.regionKey}_${city.name}`, created.id);
            }
          }
          
          // Import IP ranges (batch process)
          console.log('🌐 Importing IP ranges...');
          const batchSize = 1000;
          for (let i = 0; i < ipRanges.length; i += batchSize) {
            const batch = ipRanges.slice(i, i + batchSize).map(range => {
              const regionId = range.regionName ? regionMap.get(`${range.countryId}_${range.regionName}`) : null;
              const cityId = (range.regionName && range.cityName) ? 
                cityMap.get(`${range.countryId}_${range.regionName}_${range.cityName}`) : null;
              
              return {
                ...range,
                regionId,
                cityId,
                regionName: undefined,
                cityName: undefined,
              };
            });
            
            await db.ipRange.createMany({ data: batch });
            console.log(`📦 Imported batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(ipRanges.length / batchSize)}`);
          }
          
          console.log('✅ Data import completed successfully!');
          console.log(`📊 Final statistics:
            - Countries: ${countries.size}
            - Regions: ${regions.size}  
            - Cities: ${cities.size}
            - IP Ranges: ${ipRanges.length}`);
          
          resolve();
        } catch (error) {
          console.error('❌ Database import error:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('❌ CSV reading error:', error);
        reject(error);
      });
  });
}

// Execute import
importIP2LocationData()
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });
