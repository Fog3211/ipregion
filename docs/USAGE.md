# IP地区查询服务 - 数据导入和使用指南

## 📥 数据导入方案

### 方案1: IP2Location CSV数据导入（推荐）

1. **下载数据**
   ```bash
   # 访问以下网址下载免费CSV数据
   # https://lite.ip2location.com/database/ip-country-region-city-latitude-longitude-zipcode-timezone
   # 将 IP2LOCATION-LITE-DB11.CSV 放入 scripts/data/ 目录
   ```

2. **运行导入脚本**
   ```bash
   npm run import:ip2location
   ```

3. **数据包含内容**
   - 🌍 **全球覆盖**: 200+个国家和地区
   - 🏙️ **城市级精度**: 包含省/州和城市信息
   - 📊 **数据量**: 约300万条IP段记录
   - 🔄 **更新频率**: 每月更新

### 方案2: 演示数据（快速开始）

```bash
# 创建包含3个国家的演示数据
npx tsx prisma/seed-new.ts
```

## 🚀 功能特性

### 🔍 查询功能
- **按国家查询IP段**: 支持国家代码和中英文名称
- **IP反查**: 根据IP地址查询归属地信息
- **生成随机IP**: 生成指定国家的真实IP地址

### 🏗️ 数据架构
```
Country (国家)
├── Region (省/州)
│   ├── City (城市)
│   │   └── IpRange (IP段)
│   └── IpRange (IP段)
└── IpRange (IP段)
```

### 📊 数据精度
- **国家级**: 99.8% 准确率
- **省/州级**: 95% 准确率  
- **城市级**: 83% 准确率
- **坐标信息**: 包含经纬度数据

## 💻 API使用示例

### 1. 查询国家IP段
```javascript
// 查询中国的IP段
const result = await trpc.ipRegion.getIpRangesByCountry.query({
  query: "CN" // 或 "中国" 或 "China"
});
```

### 2. 生成随机IP
```javascript
// 生成5个美国的IP地址
const result = await trpc.ipRegion.generateIpByCountry.query({
  query: "US",
  count: 5
});
```

### 3. IP反查
```javascript
// 查询IP归属地
const result = await trpc.ipRegion.getCountryByIp.query({
  ip: "8.8.8.8"
});
```

### 4. 获取所有国家
```javascript
// 获取支持的国家列表
const countries = await trpc.ipRegion.getAllCountries.query();
```

## 🎯 使用场景

### 开发测试
- **IP代理测试**: 生成不同国家的测试IP
- **地理位置服务**: 模拟用户来源
- **内容分发**: 测试CDN分发策略

### 数据分析
- **用户画像**: 分析访问来源分布
- **风险控制**: IP地址风险评估
- **合规检查**: 地区访问限制

### 业务应用
- **内容本地化**: 基于IP显示本地化内容
- **价格策略**: 不同地区差异化定价
- **广告投放**: 精准地域广告投放

## 🔧 扩展开发

### 添加新数据源
1. 创建导入脚本在 `scripts/` 目录
2. 按照现有数据结构导入
3. 更新API以支持新字段

### 性能优化
```sql
-- 为大量数据创建复合索引
CREATE INDEX idx_ip_range_country_region ON ip_ranges(countryId, regionId);
CREATE INDEX idx_ip_range_start_end ON ip_ranges(startIpInt, endIpInt);
```

### 部署建议
- **小规模**: Vercel + 外部数据库
- **中等规模**: Railway 一站式部署
- **大规模**: Docker + PostgreSQL

## 📈 性能指标

### 查询性能
- **IP查询**: < 50ms (建立索引后)
- **国家查询**: < 100ms
- **随机生成**: < 200ms

### 存储需求
- **演示数据**: < 1MB
- **完整数据**: ~500MB (300万条记录)
- **索引开销**: ~100MB

## 🛡️ 数据质量

### IP2Location 免费版
- ✅ **准确性**: 国家级99.8%
- ✅ **覆盖率**: 全球200+国家
- ⚠️ **限制**: 城市级精度较低
- ⚠️ **延迟**: 月度更新

### 数据验证
```bash
# 验证数据完整性
npm run db:studio
# 检查数据库记录数和分布
```

## 🎓 学习资源

- [T3 Stack 官方文档](https://create.t3.gg/)
- [Prisma ORM 指南](https://www.prisma.io/docs)
- [tRPC 类型安全API](https://trpc.io/docs)
- [IP地理位置原理](https://en.wikipedia.org/wiki/Geolocation)

---

🚀 **开始使用**: `npm run dev` 启动开发服务器
📚 **API文档**: 访问 `/api/trpc` 查看所有可用接口
🔧 **数据库管理**: `npm run db:studio` 打开Prisma Studio
