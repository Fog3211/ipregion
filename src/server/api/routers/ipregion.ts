import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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

export const ipRegionRouter = createTRPCRouter({
	// Generate random IP addresses for specified country/region
	generateIpByCountry: publicProcedure
		.input(z.object({
			query: z.string().min(1), // Can be country code or name
			count: z.number().min(1).max(10).default(1), // Number of IPs to generate, default 1, max 10
		}))
		.query(async ({ ctx, input }) => {
			const { query, count } = input;
			
			// First find country information
			const country = await ctx.db.country.findFirst({
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
				throw new Error(`Country/region not found: ${query}`);
			}

			if (country.ipRanges.length === 0) {
				throw new Error(`No IP range data available for country/region: ${query}`);
			}

			// Generate specified number of random IPs
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
