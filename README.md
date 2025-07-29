# Geo IP Generator

A professional geolocation IP address generation service built with [T3 Stack](https://create.t3.gg/), supporting real IP address generation for 250+ countries and territories worldwide.

**🌍 [中文文档](./README.zh_CN.md) | English**

## ✨ Features

- **🎲 Random IP Generation**: Generate real IP addresses by country code or name
- **📊 Batch Generation**: Support generating 1-10 IP addresses at once
- **🌍 Global Coverage**: Support 250+ countries and territories (including sovereign states and territories)
- **🏛️ Territory Classification**: Clear distinction between sovereign countries and territories (e.g., Hong Kong, Taiwan, Macao)
- **📋 One-Click Copy**: Support single or batch copying of generated IP addresses
- **📍 Detailed Information**: Display IP geolocation, ISP, and other detailed information
- **🔍 Data Validation**: Automated quality assurance with multi-API cross-validation
- **🚀 Modern Tech Stack**: Next.js + TypeScript + Prisma + Tailwind CSS
- **📱 Responsive Design**: Support for desktop and mobile devices
- **🔗 API Support**: Provide RESTful API interface for external integration

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org) with App Router
- **Backend**: Next.js API Routes with type-safe validation
- **Database**: [Prisma](https://prisma.io) ORM with SQLite
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/)
- **Development Tools**: [Biome](https://biomejs.dev/) for linting and formatting
- **Automation**: GitHub Actions for data sync and validation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Git (for automated data synchronization)

### 1. Clone and Install

```bash
git clone <repository-url>
cd geo-ip-generator
pnpm install
```

### 2. Environment Setup

Create environment variables file:

```bash
cp .env.example .env
```

Edit the `.env` file and set the database path:

```env
DATABASE_URL="file:./db.sqlite"
REDIS_URL="redis://localhost:6379"  # Optional, for caching acceleration
```

### 3. Project Initialization 🚀

**One-click completion of all initialization steps**:

```bash
pnpm run setup
```

This command will automatically complete:

1. **🏗️ Database Initialization** - Create table structure and indexes, enable performance optimization
2. **🌍 Import World Territory Data** - Batch import 250+ countries and territories (~10 seconds)
3. **📍 Import IP Address Data** - High-performance batch import of 450,000+ IP ranges (~2-3 minutes)

Imported data includes:

- ✅ **250+ Territories**: Including all ISO 3166-1 recognized countries and territories
- ✅ **Sovereignty Status**: Distinguish sovereign countries (e.g., China, USA) and territories (e.g., Hong Kong, Taiwan, Macao)
- ✅ **Multi-language Support**: English and Chinese names
- ✅ **Real IP Data**: 450,000+ real IP address ranges
- ✅ **Geographic Partitioning**: Continent and region information

### 🚀 **Performance Optimization**

- **Batch Insert**: Using transactions and batch operations, improving import speed by 10-50x
- **SQLite Optimization**: Enable WAL mode, optimize cache and sync settings
- **Progress Display**: Real-time display of import progress and statistics

> 💡 **Note**: The initialization process takes about 3-5 minutes, most of the time is spent downloading data. The actual import speed has been significantly optimized!

### 4. Start Development Server

```bash
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔄 Data Management & Automation

### 🤖 Automated Synchronization (Recommended)

The project is configured with GitHub Actions automated data synchronization:

```bash
# Manual trigger complete data synchronization (includes backup, update, multi-format export)
pnpm run sync:data

# Individual format exports
pnpm run export:csv    # Export CSV format
pnpm run export:excel  # Export Excel format

# Data quality validation
pnpm run validate:data    # Full validation (100 samples)
pnpm run validate:sample  # Quick validation (50 samples)
pnpm run validate:demo    # Demo validation (5 samples, for testing)
```

**Automation Features**:
- ✅ Daily automatic run at UTC 02:00 (Beijing time 10:00)
- ✅ Automatic backup of current data, rollback on failure
- ✅ Smart detection of data changes, skip commit when no changes
- ✅ Automatic generation of multiple formats: JSON, CSV, Excel
- ✅ Automatic creation of GitHub Release and download links
- ✅ Retain 7-day backup history
- ✅ Integrated data quality validation (50 sample quick detection)

**Manual Trigger Synchronization**:
1. Visit the project's GitHub Actions page
2. Select "Daily Data Sync" workflow
3. Click "Run workflow" button
4. Optionally choose force update (even if no data changes)

### 📋 Manual Data Updates

```bash
# Re-fetch latest territory data
pnpm run import:territories

# Re-download latest IP data
pnpm run import:ip2location

# Generate data files
pnpm run generate:data
```

> 💡 **Tip**: Automated synchronization has configured optimal update strategies, usually no manual operation is required.

## 💻 Usage Guide

### Web Interface

1. **IP Generation**: Enter country code or name in the input box:
   - Country codes: CN, US, JP, HK, TW, MO
   - Chinese names: 中国, 美国, 日本, 香港, 台湾, 澳门
   - English names: China, America, Japan, Hong Kong, Taiwan, Macao

2. **Batch Generation**: Select generation count (1-10)

3. **One-Click Copy**: Support single or batch copying of generated IP addresses

4. **Data Download**: Visit `/download` page to get complete datasets

5. **Quality Monitoring**: Visit `/validation` page to view data quality reports

### Data Download Center

Dedicated data download page providing multiple formats:

- **📄 JSON Format**: Complete and minified versions, suitable for APIs and programmatic access
- **📋 CSV Format**: Complete and light versions, suitable for Excel analysis and database import
- **📊 Excel Format**: Multi-worksheet version, including statistical analysis and data visualization
- **📈 Real-time Statistics**: Display latest data volume, update time, and other information

### Data Quality Monitoring

Dedicated data validation page providing:

- **🔍 Automatic Validation**: Weekly automatic runs to verify IP geolocation data accuracy
- **📊 Quality Reports**: Accuracy statistics, confidence analysis, third-party API comparison
- **⚠️ Anomaly Detection**: Automatically create GitHub Issues when accuracy drops below 85%
- **📚 Historical Records**: Save validation history for trend analysis
- **🔄 Cross-validation**: Use multiple third-party APIs for cross-validation, avoiding single points of failure

### API Integration

#### Generate Random IP Addresses

**API Endpoint**: `/api/generate-ip`

**Method 1: GET Request**

```bash
# Generate 1 China IP
GET /api/generate-ip?country=CN

# Generate 3 US IPs
GET /api/generate-ip?country=US&count=3

# Using Chinese names
GET /api/generate-ip?country=中国&count=2
```

**Method 2: POST Request**

```bash
curl -X POST http://localhost:3000/api/generate-ip \
  -H "Content-Type: application/json" \
  -d '{"country": "CN", "count": 3}'
```

**Response Format**:

```json
{
  "success": true,
  "data": {
    "country": {
      "id": "CHN",
      "code2": "CN",
      "nameEn": "China",
      "nameZh": "中国",
      "continent": "Asia",
      "region": "Eastern Asia"
    },
    "ips": [
      {
        "ip": "1.2.3.4",
        "location": {
          "region": "Beijing",
          "city": "Beijing",
          "isp": "China Telecom"
        }
      }
    ],
    "totalRanges": 1250
  }
}
```

## 🎯 Use Cases

### Development & Testing
- **Network Proxy Testing**: Generate test IPs from different regions
- **Geolocation Services**: Simulate user origins
- **CDN Distribution Testing**: Test content delivery networks

### Data Analysis
- **User Behavior Simulation**: Simulate user access from different regions
- **A/B Testing**: Geographic location-related feature testing
- **Load Testing**: Simulate global user load

### Security Testing
- **Firewall Rule Testing**: Test regional access restrictions
- **IP Whitelist Testing**: Verify access control
- **Geofencing Testing**: Test regional restriction features

## 📊 Project Status

### Latest Updates (v2.1)

- ✅ **Automated Synchronization**: GitHub Actions daily automatic data synchronization
- ✅ **Backup Mechanism**: Automatic backup and failure rollback to ensure data security
- ✅ **Multi-format Export**: Added CSV and Excel format support
- ✅ **Download Center**: Dedicated data download page
- ✅ **Quality Monitoring**: Brand new data validation system and Web interface
- ✅ **Smart Validation**: Multi-third-party API cross-validation for data accuracy
- ✅ **Anomaly Detection**: Low accuracy automatic alerts and Issue creation
- ✅ **Timestamp Management**: Filenames include timestamps for easy version management
- ✅ **Smart Detection**: Only commit updates when data changes
- ✅ **Release Automation**: Automatic creation of GitHub Release and download links

### Data Statistics

- **Supported Territories**: 250+ countries and territories
- **Sovereign Countries**: 195 (UN members + non-member sovereign countries)
- **Territories**: 55+ (e.g., Hong Kong, Taiwan, Macao, Puerto Rico, etc.)
- **IP Ranges**: 450,000+ records
- **Data Source**: IP2Location LITE (free version)

## 📈 Performance Metrics

### Query Performance
- **IP Query**: < 50ms (after enabling indexes)
- **Territory Query**: < 100ms
- **Random Generation**: < 200ms

### Storage Requirements
- **JSON Data**: ~2-5MB (depending on IP range count)
- **CSV Data**: ~3-8MB (tabular format)
- **Excel Data**: ~1-3MB (multi-worksheet)
- **Complete Database**: ~500MB (3 million IP records)
- **Backup Storage**: ~50MB (7-day history retention)

### Automation Performance
- **Sync Frequency**: Daily
- **Data Detection**: < 30 seconds
- **Backup Creation**: < 2 minutes
- **Format Export**: < 5 minutes
- **Data Validation**: < 3 minutes (50 samples)
- **Failure Rollback**: < 1 minute

### Data Quality Metrics
- **Validation Frequency**: Weekly (manually triggerable)
- **Sample Size**: 100 IP addresses (standard) / 50 (quick)
- **Accuracy Target**: ≥ 85% (alerts triggered below this threshold)
- **API Providers**: 3 (rotating usage to avoid single point dependency)
- **Confidence Calculation**: Multi-API consensus scoring

## ⚙️ Deployment Configuration

### GitHub Actions Setup

The project includes automated data synchronization functionality, no additional Secrets configuration required, uses default `GITHUB_TOKEN`.

For custom configuration:

1. **Scheduled Tasks**: Modify cron expressions in `.github/workflows/data-sync.yml`
2. **Data Sources**: Configure different data source URLs in scripts
3. **Backup Strategy**: Adjust backup retention days and storage location

### Local Development

```bash
# Test data synchronization
pnpm run sync:data

# Test individual exports
pnpm run export:csv
pnpm run export:excel

# Check generated files
ls -la data/

# Test validation system
pnpm run validate:demo
```

## 🗃️ Database Structure

### Core Table Structure

```sql
-- Territory information table (includes countries and territories)
Country {
  id: String         // Three-letter territory code (CHN, USA, HKG, TWN, MAC)
  code2: String      // Two-letter territory code (CN, US, HK, TW, MO)
  nameEn: String     // English name
  nameZh: String     // Chinese name
  continent: String  // Continent
  region: String     // Region
  independent: Boolean // Whether it's a sovereign country
  unMember: Boolean    // Whether it's a UN member
}

-- IP range information table
IpRange {
  startIp: String    // Start IP
  endIp: String      // End IP
  countryId: String  // Associated territory code
  isp: String        // ISP provider
}
```

## 🛡️ Political Stance

This project maintains political neutrality:

- Strictly follows ISO 3166-1 international standards
- Objectively reflects real-world administrative divisions
- Does not express any political tendencies or positions
- Serves technical purposes without involving political disputes

## 🤝 Contributing

Welcome to contribute code! Please refer to the following steps:

1. Fork the project
2. Create a feature branch
3. Test automated synchronization functionality
4. Submit changes (follow Conventional Commits)
5. Send Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Data sources:

- Territory data: [mledoze/countries](https://github.com/mledoze/countries) (ODbL License)
- IP data: [IP2Location LITE](https://lite.ip2location.com/) (CC BY-SA 4.0)
