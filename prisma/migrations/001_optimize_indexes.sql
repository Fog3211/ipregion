-- CreateIndex
-- Optimize IP range lookups with compound index
CREATE INDEX IF NOT EXISTS "idx_ip_range_country_lookup" ON "IpRange"("countryId", "startIpInt", "endIpInt");

-- CreateIndex  
-- Optimize country lookups by different identifiers
CREATE INDEX IF NOT EXISTS "idx_country_code2" ON "Country"("code2");
CREATE INDEX IF NOT EXISTS "idx_country_name_en" ON "Country"("nameEn");
CREATE INDEX IF NOT EXISTS "idx_country_name_zh" ON "Country"("nameZh");

-- CreateIndex
-- Optimize region and city lookups
CREATE INDEX IF NOT EXISTS "idx_region_country" ON "Region"("countryId", "name");
CREATE INDEX IF NOT EXISTS "idx_city_region" ON "City"("regionId", "name");

-- CreateIndex
-- Optimize ISP lookups if needed
CREATE INDEX IF NOT EXISTS "idx_ip_range_isp" ON "IpRange"("isp");

-- CreateIndex
-- Optimize geographical lookups
CREATE INDEX IF NOT EXISTS "idx_city_coordinates" ON "City"("latitude", "longitude");
