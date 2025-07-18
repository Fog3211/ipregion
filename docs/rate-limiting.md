# IP 限流功能

本项目实现了基于 Redis 的 IP 限流功能，用于防止 API 被滥用和过度调用。

## 功能特性

- **基于 IP 地址的限流**：每个 IP 地址有独立的请求计数
- **分端点配置**：不同 API 端点有不同的限流策略
- **Redis 支持**：使用 Redis 作为分布式计数器存储
- **故障开放**：当 Redis 不可用时，自动退化为不限流
- **详细响应头**：提供限流状态信息

## 限流配置

每个 API 端点的限流策略：

| 端点 | 限制 | 时间窗口 | 说明 |
|------|------|----------|------|
| `/api/generate-ip` | 10 请求 | 1 分钟 | 最严格，计算密集型 |
| `/api/countries` | 30 请求 | 1 分钟 | 中等，主要是缓存数据 |
| `/api/health` | 100 请求 | 1 分钟 | 最宽松，健康检查 |

## 环境配置

### Redis 配置

在 `.env` 文件中配置 Redis 连接：

```bash
# 可选：Redis URL（如果不配置，限流功能将被禁用）
REDIS_URL=redis://localhost:6379

# 或者使用 Redis Cloud
REDIS_URL=redis://username:password@hostname:port
```

### 开发环境

在开发环境中，来自 `localhost` 的请求默认不受限流限制，便于开发和测试。

## 使用方式

限流功能已自动集成到所有 API 路由中，无需额外配置。当请求超过限制时，API 会返回：

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Max 10 requests per minute allowed.",
  "retryAfter": 60,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 响应头信息

限流中间件会在响应中添加以下头信息：

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 2024-01-01T00:01:00.000Z
Retry-After: 45
```

## 测试限流功能

### 自动测试

使用内置的测试脚本：

```bash
# 启动应用
pnpm dev

# 在另一个终端运行测试
pnpm test:rate-limit
```

### 手动测试

使用 curl 快速测试：

```bash
# 快速发送多个请求测试限流
for i in {1..15}; do
  echo "Request $i:"
  curl -s -w "Status: %{http_code}\n" \
    "http://localhost:3000/api/generate-ip?country=CN&count=1"
  sleep 0.1
done
```

### 使用不同 IP 测试

```bash
# 模拟不同 IP 地址的请求
curl -H "X-Forwarded-For: 192.168.1.100" \
  "http://localhost:3000/api/generate-ip?country=CN&count=1"
```

## 监控和日志

### 限流日志

当触发限流时，服务器会记录警告日志：

```
Rate limit exceeded for IP 192.168.1.100 on endpoint generate-ip: 11/10
```

### Redis 监控

可以通过以下方式检查 Redis 中的限流数据：

```bash
# 连接到 Redis
redis-cli

# 查看所有限流键
KEYS ipregion:ratelimit:*

# 查看特定 IP 的计数
GET ipregion:ratelimit:192.168.1.100:generate-ip
```

## 配置自定义

### 修改限流参数

在 `src/server/api/rate-limit-middleware.ts` 中修改 `RATE_LIMITS` 配置：

```typescript
export const RATE_LIMITS = {
  'generate-ip': {
    requests: 20,        // 增加到 20 请求
    windowMs: 60 * 1000, // 1 分钟窗口
    ttl: CACHE_TTL.RATE_LIMIT,
  },
  // ... 其他配置
};
```

### 添加新端点

```typescript
// 在 RATE_LIMITS 中添加新配置
'my-new-endpoint': {
  requests: 50,
  windowMs: 60 * 1000,
  ttl: CACHE_TTL.RATE_LIMIT,
},

// 在 API 路由中使用
export const GET = withRateLimit(handleMyEndpoint, 'my-new-endpoint');
```

## 性能考虑

- Redis 操作是异步的，不会阻塞请求处理
- 使用 Redis 的 `INCR` 和 `EXPIRE` 命令，性能优异
- 限流检查只在请求开始时执行一次
- 当 Redis 不可用时，自动降级为无限流模式

## 安全考虑

- 支持多种 IP 头检测（X-Forwarded-For、X-Real-IP 等）
- 防止 IP 头欺骗（在生产环境中配置反向代理）
- 时间窗口滑动，防止突发请求
- 开发环境的 localhost 豁免

## 故障排除

### Redis 连接问题

1. 检查 `REDIS_URL` 环境变量是否正确
2. 确认 Redis 服务是否运行
3. 查看应用日志中的 Redis 连接错误

### 限流不生效

1. 确认 Redis 连接正常
2. 检查是否在开发环境使用 localhost
3. 验证请求头中的 IP 地址
4. 查看限流计数器是否正确增加

### 误报限流

1. 检查时钟同步（Redis 和应用服务器）
2. 确认 TTL 设置正确
3. 检查是否有代理或负载均衡器影响 IP 检测 