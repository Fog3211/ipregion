import {
	QueryClient,
	defaultShouldDehydrateQuery,
} from "@tanstack/react-query";
import SuperJSON from "superjson";

export const createQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				// With SSR, we usually want to set some default staleTime
				// above 0 to avoid refetching immediately on the client
				staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh
				gcTime: 10 * 60 * 1000,   // 10 minutes - cache garbage collection
				refetchOnWindowFocus: false, // Don't refetch on window focus for IP data
				refetchOnReconnect: true,    // Do refetch when reconnecting
				retry: (failureCount, error) => {
					// Retry network errors but not client errors (4xx)
					const isNetworkError = !error?.message?.includes('fetch');
					return isNetworkError && failureCount < 3;
				},
				retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
			},
			mutations: {
				retry: false, // Don't retry mutations by default
			},
			dehydrate: {
				serializeData: SuperJSON.serialize,
				shouldDehydrateQuery: (query) =>
					defaultShouldDehydrateQuery(query) ||
					query.state.status === "pending",
			},
			hydrate: {
				deserializeData: SuperJSON.deserialize,
			},
		},
	});
