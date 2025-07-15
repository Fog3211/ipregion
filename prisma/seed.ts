import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// IP地址转换为整数的工具函数
function ipToInt(ip: string): bigint {
	const parts = ip.split('.').map(Number);
	if (parts.length !== 4 || parts.some(part => isNaN(part) || part < 0 || part > 255)) {
		throw new Error("无效的IP地址格式");
	}
	return BigInt(parts[0]! * 256 * 256 * 256 + parts[1]! * 256 * 256 + parts[2]! * 256 + parts[3]!);
}

async function main() {
	console.log('开始创建示例数据...');

	// 创建国家数据
	const countries = [
		{
			id: 'CN',
			nameEn: 'China',
			nameZh: '中国',
			continent: 'Asia',
			region: 'Eastern Asia',
		},
		{
			id: 'US',
			nameEn: 'United States',
			nameZh: '美国',
			continent: 'North America',
			region: 'Northern America',
		},
		{
			id: 'JP',
			nameEn: 'Japan',
			nameZh: '日本',
			continent: 'Asia',
			region: 'Eastern Asia',
		},
		{
			id: 'DE',
			nameEn: 'Germany',
			nameZh: '德国',
			continent: 'Europe',
			region: 'Western Europe',
		},
		{
			id: 'GB',
			nameEn: 'United Kingdom',
			nameZh: '英国',
			continent: 'Europe',
			region: 'Northern Europe',
		},
	];

	// 插入国家数据
	for (const country of countries) {
		await prisma.country.upsert({
			where: { id: country.id },
			update: country,
			create: country,
		});
	}

	console.log('国家数据创建完成');

	// 创建IP段数据
	const ipRanges = [
		// 中国的IP段
		{
			startIp: '1.0.1.0',
			endIp: '1.0.3.255',
			countryId: 'CN',
			regionName: '北京',
			cityName: '北京',
			isp: '中国电信',
		},
		{
			startIp: '1.0.8.0',
			endIp: '1.0.15.255',
			countryId: 'CN',
			regionName: '上海',
			cityName: '上海',
			isp: '中国联通',
		},
		{
			startIp: '1.0.32.0',
			endIp: '1.0.63.255',
			countryId: 'CN',
			regionName: '广东',
			cityName: '深圳',
			isp: '中国移动',
		},
		
		// 美国的IP段
		{
			startIp: '8.8.8.0',
			endIp: '8.8.8.255',
			countryId: 'US',
			regionName: 'California',
			cityName: 'Mountain View',
			isp: 'Google LLC',
		},
		{
			startIp: '173.252.64.0',
			endIp: '173.252.127.255',
			countryId: 'US',
			regionName: 'California',
			cityName: 'Menlo Park',
			isp: 'Facebook Inc',
		},
		{
			startIp: '157.240.0.0',
			endIp: '157.240.255.255',
			countryId: 'US',
			regionName: 'California',
			cityName: 'Menlo Park',
			isp: 'Facebook Inc',
		},
		
		// 日本的IP段
		{
			startIp: '133.1.0.0',
			endIp: '133.1.255.255',
			countryId: 'JP',
			regionName: 'Tokyo',
			cityName: 'Tokyo',
			isp: 'NTT Communications',
		},
		{
			startIp: '210.148.0.0',
			endIp: '210.148.255.255',
			countryId: 'JP',
			regionName: 'Osaka',
			cityName: 'Osaka',
			isp: 'KDDI Corporation',
		},
		
		// 德国的IP段
		{
			startIp: '85.25.0.0',
			endIp: '85.25.255.255',
			countryId: 'DE',
			regionName: 'Bavaria',
			cityName: 'Munich',
			isp: 'Deutsche Telekom AG',
		},
		
		// 英国的IP段
		{
			startIp: '81.2.69.0',
			endIp: '81.2.69.255',
			countryId: 'GB',
			regionName: 'England',
			cityName: 'London',
			isp: 'British Telecom',
		},
	];

	// 插入IP段数据
	for (const range of ipRanges) {
		const startIpInt = ipToInt(range.startIp);
		const endIpInt = ipToInt(range.endIp);

		await prisma.ipRange.create({
			data: {
				...range,
				startIpInt,
				endIpInt,
			},
		});
	}

	console.log('IP段数据创建完成');
	console.log('示例数据创建成功！');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
