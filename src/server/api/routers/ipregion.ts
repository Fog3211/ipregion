import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { generateRandomIpInRange } from "~/lib/ip-utils";
import { 
  cache, 
  withCache, 
  CACHE_KEYS, 
  CACHE_TTL, 
  getCountryCacheKey, 
  getGenerationCacheKey 
} from "~/lib/cache";

export const ipRegionRouter = createTRPCRouter({
	// Generate random IP addresses for specified country/region
	generateIpByCountry: publicProcedure
		.input(z.object({
			query: z.string().min(1), // Can be 2-letter code (CN), 3-letter code (CHN), or country name
			count: z.number().min(1).max(10).default(1), // Number of IPs to generate, default 1, max 10
		}))
		.query(async ({ ctx, input }) => {
			const { query, count } = input;
			
			// Use cache for the entire operation
			return await withCache(
				{
					prefix: CACHE_KEYS.GENERATED,
					identifier: getGenerationCacheKey(query, count)
				},
				CACHE_TTL.GENERATED,
				async () => {
					// First find country information with caching
					const country = await withCache(
						{
							prefix: CACHE_KEYS.COUNTRY,
							identifier: getCountryCacheKey(query)
						},
						CACHE_TTL.COUNTRY,
						async () => {
							return await ctx.db.country.findFirst({
								where: {
									OR: [
										{ id: query.toUpperCase() }, // 3-letter country code match (e.g., CHN, USA, JPN)
										{ code2: query.toUpperCase() }, // 2-letter country code match (e.g., CN, US, JP)
										{ nameEn: { contains: query } }, // English name fuzzy match
										{ nameZh: { contains: query } }, // Chinese name fuzzy match
									],
								},
								select: {
									id: true,
									code2: true,
									nameEn: true,
									nameZh: true,
									continent: true,
									region: true,
								},
							});
						}
					);

					if (!country) {
						throw new Error(`Country/region not found: ${query}. Please use 3-letter country codes (e.g., CHN, USA, JPN) or country names.`);
					}

					// Get IP ranges for the country with caching
					const ipRanges = await withCache(
						{
							prefix: CACHE_KEYS.IP_RANGES,
							identifier: country.id
						},
						CACHE_TTL.IP_RANGES,
						async () => {
							return await ctx.db.ipRange.findMany({
								where: {
									countryId: country.id,
								},
								select: {
									startIp: true,
									endIp: true,
									region: {
										select: {
											name: true,
										},
									},
									city: {
										select: {
											name: true,
										},
									},
									isp: true,
								},
								// Optimize: limit the number of ranges we fetch for random selection
								take: 1000, // Get up to 1000 ranges, should be enough for random selection
							});
						}
					);

					if (ipRanges.length === 0) {
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
						const randomRange = ipRanges[Math.floor(Math.random() * ipRanges.length)]!;
						
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
						totalRanges: ipRanges.length,
						cached: false, // This will be true when served from cache
					};
				}
			);
		}),

	// Get country list with caching
	getCountries: publicProcedure
		.query(async ({ ctx }) => {
			return await withCache(
				{
					prefix: CACHE_KEYS.COUNTRY_LIST,
					identifier: 'all'
				},
				CACHE_TTL.COUNTRY_LIST,
				async () => {
					return await ctx.db.country.findMany({
						select: {
							id: true,
							code2: true,
							nameEn: true,
							nameZh: true,
							continent: true,
							region: true,
							_count: {
								select: {
									ipRanges: true,
								},
							},
						},
						orderBy: {
							nameEn: 'asc',
						},
					});
				}
			);
		}),

	// Get cache statistics (for debugging/monitoring)
	getCacheStats: publicProcedure
		.query(async () => {
			const stats = await cache.getStats();
			const health = await cache.healthCheck();
			
			return {
				connected: health,
				keyCount: stats?.keyCount || 0,
				timestamp: new Date().toISOString(),
			};
		}),

	// Clear cache (for admin use)
	clearCache: publicProcedure
		.input(z.object({
			type: z.enum(['all', 'countries', 'ipranges', 'generated']).optional(),
		}))
		.mutation(async ({ input }) => {
			const { type = 'all' } = input;

			switch (type) {
				case 'countries':
					await cache.clearPrefix(CACHE_KEYS.COUNTRY);
					await cache.clearPrefix(CACHE_KEYS.COUNTRY_LIST);
					break;
				case 'ipranges':
					await cache.clearPrefix(CACHE_KEYS.IP_RANGES);
					break;
				case 'generated':
					await cache.clearPrefix(CACHE_KEYS.GENERATED);
					break;
				default:
					await cache.clearPrefix(CACHE_KEYS.COUNTRY);
					await cache.clearPrefix(CACHE_KEYS.IP_RANGES);
					await cache.clearPrefix(CACHE_KEYS.GENERATED);
					await cache.clearPrefix(CACHE_KEYS.COUNTRY_LIST);
			}

			return { 
				success: true, 
				message: `Cache cleared for: ${type}`,
				timestamp: new Date().toISOString(),
			};
		}),
});
