"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function IpRegionLookup() {
	const [query, setQuery] = useState("");
	const [generateCount, setGenerateCount] = useState(1);

	// 生成指定国家的IP地址
	const generateIpQuery = api.ipRegion.generateIpByCountry.useQuery(
		{ query, count: generateCount },
		{
			enabled: false, // 手动触发
		}
	);

	const handleGenerate = () => {
		if (query.trim()) {
			generateIpQuery.refetch();
		}
	};

	return (
		<div className="space-y-6">
			{/* 标题 */}
			<div className="text-center">
				<h2 className="mb-4 font-bold text-3xl text-gray-800">
					随机IP地址生成器
				</h2>
				<p className="text-gray-600">
					输入国家代码或名称，生成该地区的真实IP地址
				</p>
			</div>

			{/* 生成输入框 */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<div className="space-y-4">
					<label className="block text-sm font-medium text-gray-700">
						输入国家代码或名称
					</label>
					<div className="flex gap-2">
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="例如: CN, 中国, China, US, 美国, Japan"
							className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							onKeyPress={(e) => {
								if (e.key === "Enter") {
									handleGenerate();
								}
							}}
						/>
						<select
							value={generateCount}
							onChange={(e) => setGenerateCount(Number(e.target.value))}
							className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
								<option key={num} value={num}>{num}个</option>
							))}
						</select>
						<button
							onClick={handleGenerate}
							disabled={!query.trim() || generateIpQuery.isLoading}
							className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{generateIpQuery.isLoading ? "生成中..." : "生成IP"}
						</button>
					</div>
				</div>
			</div>

			{/* 生成结果 */}
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
								✅ 已生成 {generateIpQuery.data.ips.length} 个 {generateIpQuery.data.country.nameZh || generateIpQuery.data.country.nameEn} 的IP地址
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
								从 {generateIpQuery.data.totalRanges} 个IP段中随机生成
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
													// 可以添加复制成功的提示
												});
											}}
											className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full transition-colors font-medium"
										>
											📋 复制
										</button>
									</div>
									
									<div className="text-sm text-gray-600">
										{(ipData.location.region || ipData.location.city) && (
											<p className="flex items-center gap-1">
												<span className="text-gray-500">📍</span>
												<span className="font-medium">位置:</span>{" "}
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
											IP段: {ipData.ipRange.startIp} - {ipData.ipRange.endIp}
										</p>
									</div>
								</div>
							))}
						</div>

						{/* 批量复制功能 */}
						{generateIpQuery.data.ips.length > 1 && (
							<div className="mt-4 pt-4 border-t border-gray-200">
								<button
									onClick={() => {
										const allIps = generateIpQuery.data!.ips.map(ip => ip.ip).join('\n');
										navigator.clipboard.writeText(allIps);
									}}
									className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
								>
									📋 复制所有IP地址
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
