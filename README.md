# Geo IP Generator | 地理位置 IP 生成器

基于 [T3 Stack](https://create.t3.gg/) 构建的专业地理位置 IP 地址生成服务，支持全球地区（主权国家 + 领土）的真实 IP 地址生成。

## 🎯 特性

- **🎲 随机 IP 生成**: 通过输入地区代码或名称生成真实 IP 地址
- **📊 批量生成**: 支持一次生成 1-10 个 IP 地址
- **🌍 全球覆盖**: 支持 250+ 个国家和地区（包括主权国家和领土）
- **🏛️ 地区区分**: 清晰区分主权国家和地区/领土（如香港、台湾、澳门）
- **📋 一键复制**: 支持单个或批量复制生成的 IP 地址
- **📍 详细信息**: 显示 IP 地理位置、ISP 等详细信息
- **🚀 现代技术栈**: Next.js + TypeScript + tRPC + Prisma + Tailwind CSS
- **📱 响应式设计**: 支持桌面端和移动端
- **🔗 API 支持**: 提供 RESTful API 接口供外部调用

## 技术栈

- **前端**: [Next.js 15](https://nextjs.org) with App Router
- **后端**: [tRPC](https://trpc.io) for type-safe APIs
- **数据库**: [Prisma](https://prisma.io) ORM with SQLite
- **样式**: [Tailwind CSS](https://tailwindcss.com)
- **类型安全**: [TypeScript](https://www.typescriptlang.org/)
- **开发工具**: [Biome](https://biomejs.dev/) for linting and formatting

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm
- Git (用于自动化数据同步)

### 1. 克隆和安装

```bash
git clone <repository-url>
cd geo-ip-generator
pnpm install
```

### 2. 环境配置

创建环境变量文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置数据库路径：

```env
DATABASE_URL="file:./db.sqlite"
REDIS_URL="redis://localhost:6379"  # 可选，用于缓存加速
```

### 3. 项目初始化 🚀

**一键完成所有初始化步骤**：

```bash
pnpm run setup
```

这个命令会自动完成：

1. **🏗️ 数据库初始化** - 创建表结构和索引，启用性能优化
2. **🌍 导入世界地区数据** - 批量导入 250+ 个国家和地区（约 10 秒）
3. **📍 导入 IP 地址数据** - 高性能批量导入 450,000+ IP 范围（约 2-3 分钟）

导入的数据包括：

- ✅ **250+ 地区**: 包括所有 ISO 3166-1 认可的国家和地区
- ✅ **主权状态**: 区分主权国家（如中国、美国）和地区/领土（如香港、台湾、澳门）
- ✅ **多语言支持**: 英文和中文名称
- ✅ **真实 IP 数据**: 450,000+ 真实 IP 地址范围
- ✅ **地理分区**: 大洲和地区信息

### 🚀 **性能优化**

- **批量插入**: 使用事务和批量操作，提升导入速度 10-50 倍
- **SQLite 优化**: 启用 WAL 模式、优化缓存和同步设置
- **进度显示**: 实时显示导入进度和统计信息

> 💡 **注意**: 初始化过程约需 3-5 分钟，大部分时间用于下载数据。实际导入速度已大幅优化！

### 4. 启动开发服务器

```bash
pnpm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 🛠️ 数据管理命令

如果需要单独执行某些数据操作，可以使用以下命令：

### 数据库管理

```bash
# 数据库迁移（创建/更新表结构）
pnpm run db:generate

# 直接推送 schema 到数据库
pnpm run db:push

# 打开 Prisma Studio（数据库可视化管理）
pnpm run db:studio
```

### 数据导入

```bash
# 完整初始化（推荐）
pnpm run setup

# 或 单独导入世界地区数据（250+ 国家和地区）
pnpm run import:territories

# 或 单独导入 IP2Location 数据（450,000+ IP 范围）
pnpm run import:ip2location

```

### 数据同步与更新

#### 🤖 自动化同步（推荐）

项目已配置 GitHub Actions 自动化数据同步：

```bash
# 手动触发完整数据同步（包含备份、更新、多格式导出）
pnpm run sync:data

# 单独导出不同格式
pnpm run export:csv    # 导出CSV格式
pnpm run export:excel  # 导出Excel格式

# 数据质量验证
pnpm run validate:data    # 完整验证（100个样本）
pnpm run validate:sample  # 快速验证（50个样本）
pnpm run validate:demo    # 演示验证（5个样本，用于测试）
```

**自动化特性**：
- ✅ 每日 UTC 02:00 自动运行（北京时间 10:00）
- ✅ 自动备份当前数据，失败时回退
- ✅ 智能检测数据变化，无变化时跳过提交
- ✅ 自动生成多种格式：JSON、CSV、Excel
- ✅ 自动创建 GitHub Release 和下载链接
- ✅ 保留7天备份历史
- ✅ 集成数据质量验证（50个样本快速检测）

**手动触发同步**：
1. 访问项目的 GitHub Actions 页面
2. 选择 "Daily Data Sync" 工作流
3. 点击 "Run workflow" 按钮
4. 可选择强制更新（即使数据无变化）

#### 📋 手动数据更新

```bash
# 重新获取最新的地区数据
pnpm run import:territories

# 重新下载最新的 IP 数据
pnpm run import:ip2location

# 生成数据文件
pnpm run generate:data
```

> 💡 **提示**: 自动化同步已配置最佳更新策略，通常无需手动操作。

## 📖 数据说明

### 地区 vs 国家概念

为了避免政治敏感性和歧义，本项目使用"地区/领土"（Territory）概念替代"国家"：

- **主权国家**: `independent: true` - 如中国、美国、日本等
- **地区/领土**: `independent: false` - 如香港、台湾、澳门、波多黎各等

### 数据来源

- **地区数据**: [mledoze/countries](https://github.com/mledoze/countries) - 6.1k stars 的权威开源项目
- **IP 数据**: [IP2Location LITE](https://lite.ip2location.com/) - 免费版本，每月更新

### 数据特点

1. **动态更新**: 不再使用硬编码数据，直接从权威源获取最新数据
2. **政治中性**: 客观反映 ISO 3166-1 标准，不偏向任何政治立场
3. **完整覆盖**: 包含所有 ISO 认可的地区，不遗漏任何地区
4. **标准化**: 严格遵循国际标准（ISO 3166-1、ISO 639-1 等）

## 💻 使用说明

### Web 界面

1. **IP 生成**: 在输入框中输入地区代码或名称：
   - 地区代码: CN, US, JP, HK, TW, MO
   - 中文名称: 中国, 美国, 日本, 香港, 台湾, 澳门
   - 英文名称: China, America, Japan, Hong Kong, Taiwan, Macao

2. **批量生成**: 选择生成数量（1-10）

3. **一键复制**: 支持单个或批量复制生成的 IP 地址

4. **数据下载**: 访问 `/download` 页面获取完整数据集

5. **质量监控**: 访问 `/validation` 页面查看数据质量报告

### 数据下载页面

新增专门的数据下载页面，提供多种格式：

- **📄 JSON 格式**: 完整版和压缩版，适合 API 和程序化访问
- **📋 CSV 格式**: 完整版和轻量版，适合 Excel 分析和数据库导入
- **📊 Excel 格式**: 多工作表版本，包含统计分析和数据可视化
- **📈 实时统计**: 显示最新的数据量、更新时间等信息

### 数据质量监控

专门的数据验证页面，提供：

- **🔍 自动验证**: 每周自动运行，验证IP地理位置数据准确性
- **📊 质量报告**: 准确率统计、置信度分析、第三方API对比
- **⚠️ 异常检测**: 准确率低于85%时自动创建GitHub Issue
- **📚 历史记录**: 保存验证历史，便于趋势分析
- **🔄 交叉验证**: 使用多个第三方API交叉验证，避免单点故障

### API 调用

#### 生成随机 IP 地址

**API 端点**: `/api/generate-ip`

**方法 1: GET 请求**

```bash
# 生成 1 个中国 IP
GET /api/generate-ip?country=CN

# 生成 3 个美国 IP
GET /api/generate-ip?country=US&count=3

# 使用中文名称
GET /api/generate-ip?country=中国&count=2
```

**方法 2: POST 请求**

```bash
curl -X POST http://localhost:3000/api/generate-ip \
  -H "Content-Type: application/json" \
  -d '{"country": "CN", "count": 3}'
```

**响应格式**:

```json
{
  "success": true,
  "data": {
    "territory": {
      "id": "CHN",
      "code2": "CN",
      "nameEn": "China",
      "nameZh": "中国",
      "continent": "Asia",
      "region": "Eastern Asia",
      "independent": true
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
    "totalRanges": 1250,
    "generatedCount": 1
  }
}
```

## 🎯 使用场景

### 开发测试

- **网络代理测试**: 生成不同地区的测试 IP
- **地理位置服务**: 模拟用户来源
- **CDN 分发测试**: 测试内容分发网络

### 数据分析

- **用户行为模拟**: 模拟不同地区的用户访问
- **A/B 测试**: 地理位置相关功能测试
- **负载测试**: 模拟全球用户负载

### 安全测试

- **防火墙规则测试**: 测试地区访问限制
- **IP 白名单测试**: 验证访问控制
- **地理围栏测试**: 测试地区限制功能

## 🔧 数据管理

### 更新地区数据

```bash
# 获取最新的世界地区数据
pnpm run import:territories
```

### 更新 IP 数据

```bash
# 下载并导入最新的 IP 地理位置数据
pnpm run import:ip2location
```

### 数据库管理

```bash
# 查看数据库
pnpm run db:studio

# 重置数据库
pnpm run db:push

# 应用数据库迁移
pnpm run db:migrate
```

## 🗃️ 数据库结构

### 核心表结构

```sql
-- 地区信息表（包含国家和地区/领土）
Country {
  id: String         // 三位地区代码 (CHN, USA, HKG, TWN, MAC)
  code2: String      // 两位地区代码 (CN, US, HK, TW, MO)
  nameEn: String     // 英文名
  nameZh: String     // 中文名
  continent: String  // 大洲
  region: String     // 地区
  independent: Boolean // 是否为主权国家
  unMember: Boolean    // 是否为联合国成员
}

-- IP 段信息表
IpRange {
  startIp: String    // 起始 IP
  endIp: String      // 结束 IP
  countryId: String  // 关联的地区代码
  isp: String        // ISP 供应商
}
```

## 📊 项目状态

### 最新更新 (v2.1)

- ✅ **自动化同步**: GitHub Actions 每日自动数据同步
- ✅ **备份机制**: 自动备份和失败回退，确保数据安全
- ✅ **多格式导出**: 新增 CSV 和 Excel 格式支持
- ✅ **下载中心**: 专门的数据下载页面
- ✅ **质量监控**: 全新的数据验证系统和Web界面
- ✅ **智能验证**: 使用多个第三方API交叉验证数据准确性
- ✅ **异常检测**: 低准确率自动告警和Issue创建
- ✅ **时间戳管理**: 文件名包含时间戳，便于版本管理
- ✅ **智能检测**: 只有数据变化时才提交更新
- ✅ **发布自动化**: 自动创建 GitHub Release 和下载链接

### 数据统计

- **支持地区**: 250+ 个国家和地区
- **主权国家**: 195 个（联合国成员 + 非成员主权国家）
- **地区/领土**: 55+ 个（如香港、台湾、澳门、波多黎各等）
- **IP 范围**: 300 万+ 条记录（取决于导入的数据集）
- **数据源**: IP2Location LITE（免费版本）

## 🛡️ 政治立场

本项目保持政治中立：

- 严格遵循 ISO 3166-1 国际标准
- 客观反映现实世界的行政区划
- 不表达任何政治倾向或立场
- 为技术目的服务，不涉及政治争议

## 📈 性能指标

### 查询性能

- **IP 查询**: < 50ms（启用索引后）
- **地区查询**: < 100ms
- **随机生成**: < 200ms

### 存储需求

- **JSON 数据**: ~2-5MB（取决于 IP 段数量）
- **CSV 数据**: ~3-8MB（表格格式）
- **Excel 数据**: ~1-3MB（多工作表）
- **完整数据库**: ~500MB（300 万 IP 记录）
- **备份存储**: ~50MB（保留7天历史）

### 自动化性能

- **同步频率**: 每日一次
- **数据检测**: < 30 秒
- **备份创建**: < 2 分钟
- **格式导出**: < 5 分钟
- **数据验证**: < 3 分钟（50个样本）
- **失败回退**: < 1 分钟

### 数据质量指标

- **验证频率**: 每周一次（可手动触发）
- **采样规模**: 100个IP地址（标准）/ 50个（快速）
- **准确率目标**: ≥ 85%（低于此值会触发告警）
- **API提供商**: 3个（轮换使用，避免单点依赖）
- **置信度计算**: 基于多API一致性评分

## ⚙️ 部署配置

### GitHub Actions 设置

项目包含自动化数据同步功能，无需额外配置 Secrets，使用默认的 `GITHUB_TOKEN` 即可。

如需自定义配置：

1. **定时任务**: 修改 `.github/workflows/data-sync.yml` 中的 cron 表达式
2. **数据源**: 在脚本中配置不同的数据源 URL  
3. **备份策略**: 调整备份保留天数和存储位置

### 本地开发

```bash
# 测试数据同步
pnpm run sync:data

# 测试单独导出
pnpm run export:csv
pnpm run export:excel

# 检查生成的文件
ls -la data/

# 测试验证系统
pnpm run validate:demo
```

## 🤝 贡献指南

欢迎贡献代码！请参考以下步骤：

1. Fork 项目
2. 创建功能分支  
3. 测试自动化同步功能
4. 提交更改（遵循 Conventional Commits）
5. 发送 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

数据来源：

- 地区数据：[mledoze/countries](https://github.com/mledoze/countries) (ODbL License)
- IP 数据：[IP2Location LITE](https://lite.ip2location.com/) (CC BY-SA 4.0)
