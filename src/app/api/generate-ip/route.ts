import { NextRequest } from "next/server";
import { db } from "~/server/db";

// Utility function to convert IP address to integer
function ipToInt(ip: string): bigint {
	const parts = ip.split('.').map(Number);
	if (parts.length !== 4 || parts.some(part => isNaN(part) || part < 0 || part > 255)) {
		throw new Error("Invalid IP address format");
	}
	return BigInt(parts[0]! * 256 * 256 * 256 + parts[1]! * 256 * 256 + parts[2]! * 256 + parts[3]!);
}

// Utility function to convert integer to IP address
function intToIp(int: bigint): string {
	const num = Number(int);
	return [
		Math.floor(num / (256 * 256 * 256)) % 256,
		Math.floor(num / (256 * 256)) % 256,
		Math.floor(num / 256) % 256,
		num % 256
	].join('.');
}

// Generate random IP address within specified range
function generateRandomIpInRange(startIp: string, endIp: string): string {
	const startInt = ipToInt(startIp);
	const endInt = ipToInt(endIp);
	
	// Generate random integer within range
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
				error: 'Missing required parameter: country'
			}, { status: 400 });
		}

		const count = countParam ? Math.min(Math.max(Number(countParam), 1), 10) : 1;

		// Find country information
		const country = await db.country.findFirst({
			where: {
				OR: [
					{ id: query.toUpperCase() }, // Country code match (e.g., CN, US)
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
				error: `Country/region not found: ${query}`
			}, { status: 404 });
		}

		if (country.ipRanges.length === 0) {
			return Response.json({
				success: false,
				error: `No IP range data available for country/region: ${query}`
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
				error: `Country/region not found: ${query}`
			}, { status: 404 });
		}

		if (country.ipRanges.length === 0) {
			return Response.json({
				success: false,
				error: `No IP range data available for country/region: ${query}`
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
		console.error('IP generation failed:', error);
		return Response.json({
			success: false,
			error: 'Internal server error'
		}, { status: 500 });
	}
} 