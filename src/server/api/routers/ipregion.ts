import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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

export const ipRegionRouter = createTRPCRouter({
	// 生成指定国家/地区的随机IP地址
	generateIpByCountry: publicProcedure
		.input(z.object({
			query: z.string().min(1), // 可以是国家代码或名称
			count: z.number().min(1).max(10).default(1), // 生成IP的数量，默认1个，最多10个
		}))
		.query(async ({ ctx, input }) => {
			const { query, count } = input;
			
			// 首先查找国家信息
			const country = await ctx.db.country.findFirst({
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
				throw new Error(`未找到国家/地区: ${query}`);
			}

			if (country.ipRanges.length === 0) {
				throw new Error(`国家/地区 ${query} 暂无IP段数据`);
			}

			// 生成指定数量的随机IP
			const generatedIps: Array<{
				ip: string;
				location: {
					region: string | null;
					city: string | null;
					isp: string | null;
				};
				ipRange: {
					startIp: string;
					endIp: string;
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
					ipRange: {
						startIp: randomRange.startIp,
						endIp: randomRange.endIp,
					},
				});
			}

			return {
				country: {
					id: country.id,
					nameEn: country.nameEn,
					nameZh: country.nameZh,
					continent: country.continent,
					region: country.region,
				},
				ips: generatedIps,
				totalRanges: country.ipRanges.length,
			};
		}),
});
