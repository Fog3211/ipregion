import { ipRegionRouter } from "~/server/api/routers/ipregion";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	ipRegion: ipRegionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.ipRegion.generateIpByCountry({ query: "CN", count: 1 });
 *       ^? IP generation result
 */
export const createCaller = createCallerFactory(appRouter);
