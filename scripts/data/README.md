# 数据文件下载说明

## IP2Location 数据库

### 下载地址
https://lite.ip2location.com/database/ip-country-region-city-latitude-longitude-zipcode-timezone

### 下载步骤
1. 访问上述网址
2. 选择 "IP2LOCATION-LITE-DB11.CSV" 
3. 点击下载（免费，但需要邮箱注册）
4. 将下载的 CSV 文件放在当前目录下

### 文件格式
文件名应为：`IP2LOCATION-LITE-DB11.CSV`

### 数据字段
- ip_from: 起始IP地址
- ip_to: 结束IP地址  
- country_code: 国家代码
- country_name: 国家名称
- region_name: 省/州名称
- city_name: 城市名称
- latitude: 纬度
- longitude: 经度
- zip_code: 邮编
- time_zone: 时区

### 注意事项
- 免费版本精度约为83%
- 文件大小约50MB，包含约300万条记录
- 每月更新一次数据

## 替代方案

### MaxMind GeoLite2
如果您更喜欢使用MaxMind的数据：
1. 访问 https://dev.maxmind.com/geoip/geolite2-free-geolocation-data
2. 注册账号获取License Key
3. 下载 GeoLite2-City.mmdb 文件
4. 使用另外的导入脚本（需要另外创建）

### 在线API
对于小规模使用，也可以考虑使用实时API：
- GeoJS: https://get.geojs.io/
- IPapi: https://ipapi.co/
- IP-API: http://ip-api.com/
