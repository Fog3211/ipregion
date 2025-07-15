import { NextRequest } from "next/server";
import { db } from "~/server/db";
import { generateRandomIpInRange } from "~/lib/ip-utils";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const query = searchParams.get('country');
		const countParam = searchParams.get('count');
		
		if (!query) {
			return Response.json({
				success: false,
				error: 'Missing required parameter: country'
			}, { status: 400 });
		}

		const count = countParam ? Math.min(Math.max(Number(countParam), 1), 10) : 1;

		// Find country information
		// Support both 2-letter (CN, US) and 3-letter (CHN, USA) country codes, plus names
		const country = await db.country.findFirst({
			where: {
				OR: [
					{ id: query.toUpperCase() }, // 3-letter country code match (e.g., CHN, USA, JPN)
					{ code2: query.toUpperCase() }, // 2-letter country code match (e.g., CN, US, JP)
					{ nameEn: { contains: query } }, // English name fuzzy match
					{ nameZh: { contains: query } }, // Chinese name fuzzy match
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
				error: `Country/region not found: ${query}. Please use 3-letter country codes (e.g., CHN, USA, JPN) or country names.`
			}, { status: 404 });
		}

		if (country.ipRanges.length === 0) {
			return Response.json({
				success: false,
				error: `No IP range data available for country/region: ${query}. Please import real IP data first.`
			}, { status: 404 });
		}

		// Generate specified number of random IPs
		const generatedIps: Array<{
			ip: string;
			location: {
				region: string | null;
				city: string | null;
				isp: string | null;
			};
		}> = [];

		for (let i = 0; i < count; i++) {
			// Randomly select an IP range
			const randomRange = country.ipRanges[Math.floor(Math.random() * country.ipRanges.length)]!;
			
			// Generate random IP within that range
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
					id: country.id, // 3-letter code (CHN, USA, JPN)
					code2: country.code2, // 2-letter code (CN, US, JP)
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
		console.error('IP generation failed:', error);
		return Response.json({
			success: false,
			error: 'Internal server error'
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
				error: 'Missing required parameter: country'
			}, { status: 400 });
		}

		const validCount = Math.min(Math.max(Number(count), 1), 10);

		// Find country information
		// Support both 2-letter (CN, US) and 3-letter (CHN, USA) country codes, plus names
		const country = await db.country.findFirst({
			where: {
				OR: [
					{ id: query.toUpperCase() }, // 3-letter country code match
					{ code2: query.toUpperCase() }, // 2-letter country code match
					{ nameEn: { contains: query, mode: 'insensitive' } },
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
				error: `Country/region not found: ${query}. Please use 3-letter country codes (e.g., CHN, USA, JPN) or country names.`
			}, { status: 404 });
		}

		if (country.ipRanges.length === 0) {
			return Response.json({
				success: false,
				error: `No IP range data available for country/region: ${query}. Please import real IP data first.`
			}, { status: 404 });
		}

		// Generate specified number of random IPs
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
					id: country.id, // 3-letter code (CHN, USA, JPN)
					code2: country.code2, // 2-letter code (CN, US, JP)
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
		console.error('IP generation failed:', error);
		return Response.json({
			success: false,
			error: 'Internal server error'
		}, { status: 500 });
	}
} 