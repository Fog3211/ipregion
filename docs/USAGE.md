# IP Region Query Service - Data Import and Usage Guide

## 📥 Data Import Solutions

### Solution 1: IP2Location CSV Data Import (Recommended)

1. **Download Data**
   ```bash
   # Visit the following URL to download free CSV data
   # https://lite.ip2location.com/database/ip-country-region-city-latitude-longitude-zipcode-timezone
   # Place IP2LOCATION-LITE-DB11.CSV in scripts/data/ directory
   ```

2. **Run Import Script**
   ```bash
   pnpm run import:ip2location
   ```

3. **Data Contents**
   - 🌍 **Global Coverage**: 200+ countries and regions
   - 🏙️ **City-level Accuracy**: Includes province/state and city information
   - 📊 **Data Volume**: Approximately 3 million IP range records
   - 🔄 **Update Frequency**: Monthly updates

### Solution 2: Demo Data (Quick Start)

```bash
# Create demo data containing 3 countries
npx tsx prisma/seed-new.ts
```

## 🚀 Features

### 🔍 Query Functions
- **Query IP ranges by country**: Supports country codes and Chinese/English names
- **IP reverse lookup**: Query location information based on IP address
- **Generate random IPs**: Generate real IP addresses for specified countries

### 🏗️ Data Architecture
```
Country
├── Region (Province/State)
│   ├── City
│   │   └── IpRange
│   └── IpRange
└── IpRange
```

### 📊 Data Accuracy
- **Country Level**: 99.8% accuracy
- **Province/State Level**: 95% accuracy  
- **City Level**: 83% accuracy
- **Coordinate Information**: Includes latitude and longitude data

## 💻 API Usage Examples

### 1. Query Country IP Ranges
```javascript
// Query China's IP ranges
const result = await trpc.ipRegion.getIpRangesByCountry.query({
  query: "CN" // or "中国" or "China"
});
```

### 2. Generate Random IPs
```javascript
// Generate 5 US IP addresses
const result = await trpc.ipRegion.generateIpByCountry.query({
  query: "US",
  count: 5
});
```

### 3. IP Reverse Lookup
```javascript
// Query IP location
const result = await trpc.ipRegion.getCountryByIp.query({
  ip: "8.8.8.8"
});
```

### 4. Get All Countries
```javascript
// Get list of supported countries
const countries = await trpc.ipRegion.getAllCountries.query();
```

## 🎯 Use Cases

### Development Testing
- **IP Proxy Testing**: Generate test IPs from different countries
- **Geolocation Services**: Simulate user origins
- **Content Distribution**: Test CDN distribution strategies

### Data Analysis
- **User Profiling**: Analyze visitor source distribution
- **Risk Control**: IP address risk assessment
- **Compliance Check**: Regional access restrictions

### Business Applications
- **Content Localization**: Display localized content based on IP
- **Pricing Strategy**: Differential pricing for different regions
- **Ad Targeting**: Precise geo-targeted advertising

## 🔧 Extended Development

### Adding New Data Sources
1. Create import scripts in `scripts/` directory
2. Import according to existing data structure
3. Update API to support new fields

### Performance Optimization
```sql
-- Create composite indexes for large datasets
CREATE INDEX idx_ip_range_country_region ON ip_ranges(countryId, regionId);
CREATE INDEX idx_ip_range_start_end ON ip_ranges(startIpInt, endIpInt);
```

### Deployment Recommendations
- **Small Scale**: Vercel + External Database
- **Medium Scale**: Railway One-stop Deployment
- **Large Scale**: Docker + PostgreSQL

## 📈 Performance Metrics

### Query Performance
- **IP Query**: < 50ms (after indexing)
- **Country Query**: < 100ms
- **Random Generation**: < 200ms

### Storage Requirements
- **Demo Data**: < 1MB
- **Complete Data**: ~500MB (3 million records)
- **Index Overhead**: ~100MB

## 🛡️ Data Quality

### IP2Location Free Version
- ✅ **Accuracy**: 99.8% at country level
- ✅ **Coverage**: 200+ countries globally
- ⚠️ **Limitation**: Lower city-level accuracy
- ⚠️ **Latency**: Monthly updates

### Data Validation
```bash
# Verify data integrity
pnpm run db:studio
# Check database record count and distribution
```

## 🎓 Learning Resources

- [T3 Stack Official Documentation](https://create.t3.gg/)
- [Prisma ORM Guide](https://www.prisma.io/docs)
- [tRPC Type-safe API](https://trpc.io/docs)
- [IP Geolocation Principles](https://en.wikipedia.org/wiki/Geolocation)

---

🚀 **Get Started**: `pnpm run dev` Start development server
📚 **API Documentation**: Visit `/api/trpc` to view all available interfaces
🔧 **Database Management**: `pnpm run db:studio` Open Prisma Studio
