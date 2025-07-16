import { PrismaClient } from "@prisma/client";

import { env } from "~/env";

const createPrismaClient = () =>
	new PrismaClient({
		log:
			env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
	});

/**
 * Create a silent Prisma client for bulk operations
 * This reduces log noise during data imports
 */
const createSilentPrismaClient = () =>
	new PrismaClient({
		log: ["error"], // Only log errors, no queries
	});

const globalForPrisma = globalThis as unknown as {
	prisma: ReturnType<typeof createPrismaClient> | undefined;
	silentPrisma: ReturnType<typeof createSilentPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();
export const silentDb = globalForPrisma.silentPrisma ?? createSilentPrismaClient();

if (env.NODE_ENV !== "production") {
	globalForPrisma.prisma = db;
	globalForPrisma.silentPrisma = silentDb;
}

/**
 * Apply SQLite performance optimizations
 * Call this before performing bulk operations
 */
export async function optimizeSQLiteForBulkOps(client = silentDb) {
	try {
		console.log('🔧 Applying SQLite performance optimizations...');
		
		// Enable WAL mode (Write-Ahead Logging) for better concurrency
		await client.$queryRawUnsafe('PRAGMA journal_mode = WAL;');
		
		// Optimize synchronous mode for better performance
		await client.$queryRawUnsafe('PRAGMA synchronous = NORMAL;');
		
		// Increase cache size (1GB = 1000000 pages of 1KB each)
		await client.$queryRawUnsafe('PRAGMA cache_size = 1000000;');
		
		// Store temporary data in memory for faster access
		await client.$queryRawUnsafe('PRAGMA temp_store = memory;');
		
		// Enable foreign key constraints
		await client.$queryRawUnsafe('PRAGMA foreign_keys = ON;');
		
		console.log('✅ SQLite performance optimizations applied');
	} catch (error) {
		console.warn('⚠️ Failed to apply SQLite optimizations:', error);
	}
}
