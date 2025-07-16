/**
 * Simple seed script to add basic test data
 * This allows us to test the caching functionality without importing full IP data
 */

import { db } from "../src/server/db";

async function main() {
  console.log("🌱 Seeding database with test data...");

  // Create test countries
  const testCountries = [
    {
      id: "CHN",
      code2: "CN", 
      nameEn: "China",
      nameZh: "中国",
      continent: "Asia",
      region: "Eastern Asia"
    },
    {
      id: "USA",
      code2: "US",
      nameEn: "United States",
      nameZh: "美国", 
      continent: "North America",
      region: "Northern America"
    },
    {
      id: "JPN",
      code2: "JP",
      nameEn: "Japan", 
      nameZh: "日本",
      continent: "Asia",
      region: "Eastern Asia"
    }
  ];

  for (const countryData of testCountries) {
    const country = await db.country.upsert({
      where: { id: countryData.id },
      update: countryData,
      create: countryData,
    });

    console.log(`✅ Created/updated country: ${country.nameEn} (${country.code2})`);

    // Add test IP ranges for each country
    const testIpRanges = [
      {
        startIp: countryData.code2 === "CN" ? "1.2.0.0" : 
                 countryData.code2 === "US" ? "8.8.0.0" : "13.107.0.0",
        endIp: countryData.code2 === "CN" ? "1.2.255.255" : 
               countryData.code2 === "US" ? "8.8.255.255" : "13.107.255.255",
        startIpInt: countryData.code2 === "CN" ? BigInt("16908288") : 
                    countryData.code2 === "US" ? BigInt("134744064") : BigInt("226623744"),
        endIpInt: countryData.code2 === "CN" ? BigInt("16973823") : 
                  countryData.code2 === "US" ? BigInt("134809599") : BigInt("226689279"),
        countryId: country.id,
        isp: countryData.code2 === "CN" ? "China Telecom" : 
             countryData.code2 === "US" ? "Google LLC" : "Microsoft Corporation",
      },
      {
        startIp: countryData.code2 === "CN" ? "114.114.0.0" : 
                 countryData.code2 === "US" ? "208.67.0.0" : "20.0.0.0",
        endIp: countryData.code2 === "CN" ? "114.114.255.255" : 
               countryData.code2 === "US" ? "208.67.255.255" : "20.0.255.255",
        startIpInt: countryData.code2 === "CN" ? BigInt("1918987264") : 
                    countryData.code2 === "US" ? BigInt("3502195712") : BigInt("335544320"),
        endIpInt: countryData.code2 === "CN" ? BigInt("1918987775") : 
                  countryData.code2 === "US" ? BigInt("3502261247") : BigInt("335609855"),
        countryId: country.id,
        isp: countryData.code2 === "CN" ? "China Unicom" : 
             countryData.code2 === "US" ? "OpenDNS LLC" : "Microsoft Corporation",
      }
    ];

    for (const ipRangeData of testIpRanges) {
      await db.ipRange.create({
        data: ipRangeData,
      });
    }

    console.log(`✅ Created ${testIpRanges.length} IP ranges for ${country.nameEn}`);
  }

  console.log("🎉 Database seeding completed!");
  console.log("Test the API with queries like: CN, China, 中国, US, America, Japan");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
