"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "~/trpc/react";

export function IpRegionLookup() {
	const [query, setQuery] = useState("");
	const [generateCount, setGenerateCount] = useState(4);
	const [isClient, setIsClient] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Handle click outside dropdown to close it
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Generate IP addresses for specified country with optimized caching
	const generateIpQuery = api.ipRegion.generateIpByCountry.useQuery(
		{ query, count: generateCount },
		{
			enabled: false, // Manual trigger
			staleTime: 5 * 60 * 1000, // 5 minutes - IP generation results stay fresh
			gcTime: 10 * 60 * 1000,   // 10 minutes - cache retention
			refetchOnWindowFocus: false, // Don't refetch on focus for generated IPs
		}
	);

	// Get cache statistics for display - only on client
	const cacheStatsQuery = api.ipRegion.getCacheStats.useQuery(
		undefined,
		{
			enabled: isClient, // Only run on client to avoid hydration mismatch
			refetchInterval: 30000, // Refresh every 30 seconds
			staleTime: 10000,       // 10 seconds stale time for stats
		}
	);

	const handleGenerate = () => {
		if (query.trim()) {
			generateIpQuery.refetch();
		}
	};

	const ipCountOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	return (
		<div className="space-y-6">
			{/* Title */}
			<div className="text-center">
				<h2 className="mb-4 font-bold text-3xl text-gray-800">
					Random IP Address Generator
				</h2>
				<p className="text-gray-600">
					Enter country code or name to generate real IP addresses from that region
				</p>
			</div>

			{/* Generation input */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="space-y-4">
					<label className="block text-sm font-medium text-gray-700">
						Enter country code or name
					</label>
					<div className="flex gap-2">
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="e.g: CN, China, 中国, US, America, Japan"
							className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							onKeyPress={(e) => {
								if (e.key === "Enter") {
									handleGenerate();
								}
							}}
						/>
						
						{/* Custom Dropdown */}
						<div className="relative" ref={dropdownRef}>
							<button
								type="button"
								onClick={() => setIsDropdownOpen(!isDropdownOpen)}
								className="flex items-center justify-between w-[120px] px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium text-gray-700"
							>
								<span>{generateCount} IPs</span>
								<svg 
									className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
									fill="none" 
									stroke="currentColor" 
									viewBox="0 0 24 24"
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</button>

							{/* Dropdown Menu */}
							{isDropdownOpen && (
								<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
									{ipCountOptions.map((num) => (
										<button
											key={num}
											type="button"
											onClick={() => {
												setGenerateCount(num);
												setIsDropdownOpen(false);
											}}
											className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors duration-150 ${
												generateCount === num 
													? 'bg-blue-100 text-blue-700 font-medium' 
													: 'text-gray-700'
											}`}
										>
											<div className="flex items-center justify-between">
												<span>{num} IPs</span>
												{generateCount === num && (
													<svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
														<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
													</svg>
												)}
											</div>
										</button>
									))}
								</div>
							)}
						</div>

						<button
							onClick={handleGenerate}
							disabled={!query.trim() || generateIpQuery.isLoading}
							className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{generateIpQuery.isLoading ? "Generating..." : "Generate IP"}
						</button>
					</div>
				</div>
			</div>

			{/* Generation results */}
			<div className="space-y-4">
				{generateIpQuery.error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4">
						<p className="text-red-600">
							❌ {generateIpQuery.error.message}
						</p>
					</div>
				)}

				{generateIpQuery.data && (
					<div className="bg-white rounded-lg shadow-md p-6">
						<div className="mb-4">
							<h3 className="font-semibold text-xl text-gray-800">
								✅ Generated {generateIpQuery.data.ips.length} IP address{generateIpQuery.data.ips.length > 1 ? 'es' : ''} from {generateIpQuery.data.country.nameZh || generateIpQuery.data.country.nameEn}
							</h3>
							<div className="flex flex-wrap gap-2 mt-2">
								<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
									{generateIpQuery.data.country.id}
								</span>
								{generateIpQuery.data.country.continent && (
									<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
										{generateIpQuery.data.country.continent}
									</span>
								)}
								{generateIpQuery.data.country.region && (
									<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
										{generateIpQuery.data.country.region}
									</span>
								)}
							</div>
							<p className="text-sm text-gray-500 mt-2">
								Randomly generated from {generateIpQuery.data.totalRanges} IP ranges
								{/* Cache status indicator */}
								{generateIpQuery.dataUpdatedAt && (
									<span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
										🚀 Cached {Math.round((Date.now() - generateIpQuery.dataUpdatedAt) / 1000)}s ago
									</span>
								)}
							</p>
						</div>

						<div className="space-y-3">
							{generateIpQuery.data.ips.map((ipData, index) => (
								<div
									key={index}
									className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-md transition-shadow"
								>
									<div className="flex items-center justify-between mb-2">
										<div className="font-mono text-lg font-bold text-blue-700">
											{ipData.ip}
										</div>
										<button
											onClick={() => {
												navigator.clipboard.writeText(ipData.ip).then(() => {
													// Could add copy success notification
												});
											}}
											className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full transition-colors font-medium"
										>
											📋 Copy
										</button>
									</div>
									
									<div className="text-sm text-gray-600">
										{(ipData.location.region || ipData.location.city) && (
											<p className="flex items-center gap-1">
												<span className="text-gray-500">📍</span>
												<span className="font-medium">Location:</span>{" "}
												{[ipData.location.region, ipData.location.city].filter(Boolean).join(", ")}
											</p>
										)}
										{ipData.location.isp && (
											<p className="flex items-center gap-1">
												<span className="text-gray-500">🌐</span>
												<span className="font-medium">ISP:</span>{" "}
												{ipData.location.isp}
											</p>
										)}
										<p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
											<span className="text-gray-400">🔗</span>
											IP Range: {ipData.ipRange.startIp} - {ipData.ipRange.endIp}
										</p>
									</div>
								</div>
							))}
						</div>

						{/* Batch copy function */}
						{generateIpQuery.data.ips.length > 1 && (
							<div className="mt-4 pt-4 border-t border-gray-200">
								<button
									onClick={() => {
										const allIps = generateIpQuery.data!.ips.map(ip => ip.ip).join('\n');
										navigator.clipboard.writeText(allIps);
									}}
									className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
								>
									📋 Copy All IP Addresses
								</button>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Cache Statistics - only show on client */}
			{isClient && cacheStatsQuery.data && (
				<div className="bg-gray-50 rounded-lg p-4">
					<h4 className="font-medium text-gray-700 mb-2">⚡ Cache Performance</h4>
					<div className="flex flex-wrap gap-4 text-sm text-gray-600">
						<span className="flex items-center gap-1">
							<span className={`w-2 h-2 rounded-full ${cacheStatsQuery.data.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
							Cache: {cacheStatsQuery.data.connected ? 'Connected' : 'Disconnected'}
						</span>
						<span>Keys: {cacheStatsQuery.data.keyCount}</span>
						<span>Updated: {new Date(cacheStatsQuery.data.timestamp).toLocaleTimeString()}</span>
					</div>
				</div>
			)}
		</div>
	);
}
