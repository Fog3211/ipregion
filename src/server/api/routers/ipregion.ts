import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { generateRandomIpInRange } from "~/lib/ip-utils";

export const ipRegionRouter = createTRPCRouter({
	// Generate random IP addresses for specified country/region
	generateIpByCountry: publicProcedure
		.input(z.object({
			query: z.string().min(1), // Can be 2-letter code (CN), 3-letter code (CHN), or country name
			count: z.number().min(1).max(10).default(1), // Number of IPs to generate, default 1, max 10
		}))
		.query(async ({ ctx, input }) => {
			const { query, count } = input;
			
			// First find country information
			// Support both 2-letter (CN, US) and 3-letter (CHN, USA) country codes, plus names
			const country = await ctx.db.country.findFirst({
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
				throw new Error(`Country/region not found: ${query}. Please use 3-letter country codes (e.g., CHN, USA, JPN) or country names.`);
			}

			if (country.ipRanges.length === 0) {
				throw new Error(`No IP range data available for country/region: ${query}. Please import real IP data first.`);
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
					id: country.id, // 3-letter code (CHN, USA, JPN)
					code2: country.code2, // 2-letter code (CN, US, JP)
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
