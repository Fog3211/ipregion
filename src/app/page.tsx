import Link from "next/link";

import { HydrateClient } from "~/trpc/server";
import { IpRegionLookup } from "~/app/_components/ip-region-lookup";

export default async function Home() {
	return (
		<HydrateClient>
			<main className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-cyan-50">
				{/* 导航栏 */}
				<nav className="border-b bg-white/80 backdrop-blur-sm">
					<div className="container mx-auto flex items-center justify-between px-4 py-4">
						<h1 className="font-bold text-2xl text-gray-800">
							随机IP生成器
						</h1>
						<div className="text-sm text-gray-600">
							输入地区码生成真实IP地址
						</div>
					</div>
				</nav>

				{/* 主要内容区域 */}
				<div className="container mx-auto flex-1 px-4 py-8">
					{/* IP地区生成组件 */}
					<section className="mb-12">
						<div className="mx-auto max-w-4xl">
							<IpRegionLookup />
						</div>
					</section>

					{/* 使用说明 */}
					<section className="mx-auto max-w-4xl">
						<div className="bg-white rounded-lg shadow-md p-6">
							<h3 className="font-semibold text-lg text-gray-800 mb-4">
								🎯 使用说明
							</h3>
							<div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
								<div>
									<h4 className="font-medium text-gray-700 mb-2">支持的输入格式：</h4>
									<ul className="space-y-1">
										<li>• 国家代码：CN, US, JP, UK</li>
										<li>• 中文名：中国, 美国, 日本</li>
										<li>• 英文名：China, America, Japan</li>
									</ul>
								</div>
								<div>
									<h4 className="font-medium text-gray-700 mb-2">功能特点：</h4>
									<ul className="space-y-1">
										<li>• 生成真实可用的IP地址</li>
										<li>• 支持批量生成（1-10个）</li>
										<li>• 一键复制单个或所有IP</li>
										<li>• 显示详细地理位置信息</li>
									</ul>
								</div>
							</div>
							
							<div className="mt-4 pt-4 border-t border-gray-200">
								<h4 className="font-medium text-gray-700 mb-2">API调用示例：</h4>
								<div className="bg-gray-50 rounded-lg p-3 font-mono text-sm space-y-2">
									<div className="text-gray-600">GET /api/generate-ip?country=CN&count=3</div>
									<div className="text-gray-600">POST /api/generate-ip {"{"}"country":"CN","count":3{"}"}</div>
								</div>
							</div>
						</div>
					</section>
				</div>

				{/* 页脚 */}
				<footer className="border-t bg-gray-50">
					<div className="container mx-auto px-4 py-6 text-center text-gray-600">
						<p className="text-sm">
							基于{" "}
							<Link
								href="https://create.t3.gg"
								target="_blank"
								className="text-blue-600 hover:text-blue-800"
							>
								T3 Stack
							</Link>{" "}
							构建 - 高性能的IP地址生成服务
						</p>
					</div>
				</footer>
			</main>
		</HydrateClient>
	);
}
