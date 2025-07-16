# IP 地理位置查询服务

基于 [T3 Stack](https://create.t3.gg/) 构建的 IP 地址地理位置查询服务，支持全球地区（主权国家 + 领土）的 IP 地址生成。

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

### 1. 克隆和安装

```bash
git clone <repository-url>
cd ipregion
pnpm install
```

### 2. 数据库初始化

```bash
# 初始化数据库结构
pnpm run db:push

# 生成 Prisma 客户端
pnpm run db:generate
```

### 3. 数据导入（必须步骤）

#### 方案一：导入完整的世界地区数据（推荐）

```bash
# 从 mledoze/countries 开源项目获取最新的世界地区数据
# 包含 250+ 个国家和地区，区分主权国家和领土
pnpm run import:territories
```

这将导入：
- ✅ **250+ 地区**: 包括所有 ISO 3166-1 认可的国家和地区
- ✅ **主权状态**: 区分主权国家（如中国、美国）和地区/领土（如香港、台湾、澳门）
- ✅ **多语言支持**: 英文和中文名称
- ✅ **地理分区**: 大洲和地区信息
- ✅ **联合国成员**: UN 成员资格状态

#### 方案二：导入真实 IP 数据

```bash
# 从 IP2Location 导入真实的 IP 地理位置数据
pnpm run import:ip2location
```

**注意**: 方案二需要先执行方案一，因为 IP 数据需要关联到地区数据。

### 4. 启动开发服务器

```bash
pnpm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

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
4. **标准化**: 严格遵循国际标准（ISO 3166-1、ISO 639-1等）

## 💻 使用说明

### Web 界面

1. 在输入框中输入地区代码或名称：
   - 地区代码: CN, US, JP, HK, TW, MO
   - 中文名称: 中国, 美国, 日本, 香港, 台湾, 澳门
   - 英文名称: China, America, Japan, Hong Kong, Taiwan, Macao

2. 选择生成数量（1-10）

3. 点击"生成 IP"按钮

4. 复制生成的 IP 地址

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

### 最新更新
- ✅ **数据源升级**: 从硬编码数据升级到动态权威数据源
- ✅ **概念澄清**: 使用"地区/领土"概念避免政治歧义
- ✅ **完整覆盖**: 支持所有 250+ 个 ISO 认可的地区
- ✅ **性能优化**: 实现缓存机制提升查询速度
- ✅ **多语言支持**: 英文和中文双语支持

### 数据统计
- **支持地区**: 250+ 个国家和地区
- **主权国家**: 195 个（联合国成员 + 非成员主权国家）
- **地区/领土**: 55+ 个（如香港、台湾、澳门、波多黎各等）
- **IP 范围**: 300万+ 条记录（取决于导入的数据集）
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
- **演示数据**: < 1MB
- **完整数据**: ~500MB（300万 IP 记录）
- **索引开销**: ~100MB

## 🤝 贡献指南

欢迎贡献代码！请参考以下步骤：

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发送 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

数据来源：
- 地区数据：[mledoze/countries](https://github.com/mledoze/countries) (ODbL License)
- IP 数据：[IP2Location LITE](https://lite.ip2location.com/) (CC BY-SA 4.0)
