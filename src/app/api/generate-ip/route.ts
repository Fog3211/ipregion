import { NextRequest } from "next/server";
import { db } from "~/server/db";

// IP地址转换为整数的工具函数
function ipToInt(ip: string): bigint {
	const parts = ip.split('.').map(Number);
	if (parts.length !== 4 || parts.some(part => isNaN(part) || part < 0 || part > 255)) {
		throw new Error("无效的IP地址格式");
	}
	return BigInt(parts[0]! * 256 * 256 * 256 + parts[1]! * 256 * 256 + parts[2]! * 256 + parts[3]!);
}

// 整数转换为IP地址的工具函数
function intToIp(int: bigint): string {
	const num = Number(int);
	return [
		Math.floor(num / (256 * 256 * 256)) % 256,
		Math.floor(num / (256 * 256)) % 256,
		Math.floor(num / 256) % 256,
		num % 256
	].join('.');
}

// 在指定范围内生成随机IP地址
function generateRandomIpInRange(startIp: string, endIp: string): string {
	const startInt = ipToInt(startIp);
	const endInt = ipToInt(endIp);
	
	// 生成范围内的随机整数
	const range = endInt - startInt;
	const randomOffset = BigInt(Math.floor(Math.random() * Number(range + 1n)));
	const randomIpInt = startInt + randomOffset;
	
	return intToIp(randomIpInt);
}

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const query = searchParams.get('country');
		const countParam = searchParams.get('count');
		
		if (!query) {
			return Response.json({
				success: false,
				error: '缺少必需参数: country'
			}, { status: 400 });
		}

		const count = countParam ? Math.min(Math.max(Number(countParam), 1), 10) : 1;

		// 查找国家信息
		const country = await db.country.findFirst({
			where: {
				OR: [
					{ id: query.toUpperCase() }, // 国家代码匹配（如CN, US）
					{ nameEn: { contains: query } }, // 英文名模糊匹配
					{ nameZh: { contains: query } }, // 中文名模糊匹配
				],
			},
			include: {
				ipRanges: {
					include: {
						region: true,
						city: true,
					},
				},
			},
		});

		if (!country) {
			return Response.json({
				success: false,
				error: `未找到国家/地区: ${query}`
			}, { status: 404 });
		}

		if (country.ipRanges.length === 0) {
			return Response.json({
				success: false,
				error: `国家/地区 ${query} 暂无IP段数据`
			}, { status: 404 });
		}

		// 生成指定数量的随机IP
		const generatedIps: Array<{
			ip: string;
			location: {
				region: string | null;
				city: string | null;
				isp: string | null;
			};
		}> = [];

		for (let i = 0; i < count; i++) {
			// 随机选择一个IP段
			const randomRange = country.ipRanges[Math.floor(Math.random() * country.ipRanges.length)]!;
			
			// 在该IP段内生成随机IP
			const randomIp = generateRandomIpInRange(randomRange.startIp, randomRange.endIp);
			
			generatedIps.push({
				ip: randomIp,
				location: {
					region: randomRange.region?.name || null,
					city: randomRange.city?.name || null,
					isp: randomRange.isp,
				},
			});
		}

		return Response.json({
			success: true,
			data: {
				country: {
					id: country.id,
					nameEn: country.nameEn,
					nameZh: country.nameZh,
					continent: country.continent,
					region: country.region,
				},
				ips: generatedIps,
				totalRanges: country.ipRanges.length,
				generatedCount: generatedIps.length,
			}
		});
		
	} catch (error) {
		console.error('生成IP失败:', error);
		return Response.json({
			success: false,
			error: '服务器内部错误'
		}, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { country: query, count = 1 } = body;
		
		if (!query) {
			return Response.json({
				success: false,
				error: '缺少必需参数: country'
			}, { status: 400 });
		}

		const validCount = Math.min(Math.max(Number(count), 1), 10);

		// 查找国家信息
		const country = await db.country.findFirst({
			where: {
				OR: [
					{ id: query.toUpperCase() },
					{ nameEn: { contains: query } },
					{ nameZh: { contains: query } },
				],
			},
			include: {
				ipRanges: {
					include: {
						region: true,
						city: true,
					},
				},
			},
		});

		if (!country) {
			return Response.json({
				success: false,
				error: `未找到国家/地区: ${query}`
			}, { status: 404 });
		}

		if (country.ipRanges.length === 0) {
			return Response.json({
				success: false,
				error: `国家/地区 ${query} 暂无IP段数据`
			}, { status: 404 });
		}

		// 生成指定数量的随机IP
		const generatedIps: Array<{
			ip: string;
			location: {
				region: string | null;
				city: string | null;
				isp: string | null;
			};
		}> = [];

		for (let i = 0; i < validCount; i++) {
			const randomRange = country.ipRanges[Math.floor(Math.random() * country.ipRanges.length)]!;
			const randomIp = generateRandomIpInRange(randomRange.startIp, randomRange.endIp);
			
			generatedIps.push({
				ip: randomIp,
				location: {
					region: randomRange.region?.name || null,
					city: randomRange.city?.name || null,
					isp: randomRange.isp,
				},
			});
		}

		return Response.json({
			success: true,
			data: {
				country: {
					id: country.id,
					nameEn: country.nameEn,
					nameZh: country.nameZh,
					continent: country.continent,
					region: country.region,
				},
				ips: generatedIps,
				totalRanges: country.ipRanges.length,
				generatedCount: generatedIps.length,
			}
		});
		
	} catch (error) {
		console.error('生成IP失败:', error);
		return Response.json({
			success: false,
			error: '服务器内部错误'
		}, { status: 500 });
	}
} 