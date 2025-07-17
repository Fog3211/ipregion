# 部署说明

## Render 部署

1. 连接 GitHub 仓库到 Render
2. 选择 Web Service 类型
3. 配置构建命令：`pnpm install && pnpm build`
4. 配置启动命令：`pnpm start`
5. 设置环境变量（复制 `.env.example` 中的变量）

## GitHub Actions 保活配置

为了防止 Render 免费版应用休眠，我们设置了 GitHub Actions 定时任务来保活。

### 配置步骤：

1. **设置 GitHub Secrets：**
   - 进入你的 GitHub 仓库
   - 点击 `Settings` → `Secrets and variables` → `Actions`
   - 点击 `New repository secret`
   - 添加以下 Secret：
     - **Name**: `RENDER_APP_URL`
     - **Value**: `https://ipregion.onrender.com` (你的实际 Render 应用 URL)

2. **验证配置：**
   - 推送代码后，GitHub Actions 会自动开始运行
   - 可以在 `Actions` 标签页查看运行状态
   - 每 14 分钟会自动发送请求保持应用活跃

### 保活机制说明：

- **运行频率**: 每 14 分钟一次
- **目标端点**: 
  - 前端主页：`/` (确保前端保持活跃)
  - 健康检查：`/api/health` (确保后端 API 保持活跃)
- **HTTP 方法**: GET 请求
- **超时策略**: Render 通常 15 分钟不活跃后休眠，14 分钟的间隔确保应用保持活跃

### 手动触发：

如果需要立即唤醒应用：
1. 进入 GitHub 仓库的 `Actions` 标签页
2. 选择 `Keep Render App Alive` 工作流
3. 点击 `Run workflow` 按钮

## 健康检查端点

应用提供了专用的健康检查端点：

```
GET /api/health
```

返回格式：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "message": "IP Region Lookup service is running"
}
```

这个端点被 GitHub Actions 用于轻量级的保活检查。

## REST API 端点

除了 tRPC，应用还提供传统的 REST API 端点：

### 生成 IP 地址

**GET** `/api/generate-ip`

参数：
- `country`: 国家代码或名称 (必需)
  - 2位代码: `CN`, `US`, `JP`
  - 3位代码: `CHN`, `USA`, `JPN`  
  - 中文名称: `中国`, `美国`, `日本`
  - 英文名称: `China`, `America`, `Japan`
- `count`: 生成数量 (1-10, 默认为1)

示例：
```bash
GET /api/generate-ip?country=CN&count=3
GET /api/generate-ip?country=China&count=1
```

**POST** `/api/generate-ip`

请求体：
```json
{
  "country": "CN",
  "count": 3
}
```

### 获取国家列表

**GET** `/api/countries`

返回所有可用的国家/地区列表和 IP 范围数量。

### API 响应格式

所有 REST API 都返回统一格式：

```json
{
  "success": true,
  "data": { /* 具体数据 */ },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

错误响应：
```json
{
  "error": "错误类型",
  "message": "详细错误信息",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
``` 