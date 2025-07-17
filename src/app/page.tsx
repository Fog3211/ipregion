import Link from "next/link";

import { IpRegionLookup } from "~/app/_components/ip-region-lookup";

export default function Home() {
	return (
			<main className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-cyan-50">
				{/* Navigation bar */}
				<nav className="border-b bg-white/80 backdrop-blur-sm">
					<div className="container mx-auto flex items-center justify-between px-4 py-4">
						<h1 className="font-bold text-2xl text-gray-800">
							Geo IP Generator
						</h1>
						<div className="text-sm text-gray-600">
							Professional IP generation service by country/region
						</div>
					</div>
				</nav>

				{/* Main content area */}
				<div className="container mx-auto flex-1 px-4 py-8">
					{/* IP region generation component */}
					<section className="mb-12">
						<div className="mx-auto max-w-4xl">
							<IpRegionLookup />
						</div>
					</section>

					{/* Usage instructions */}
					<section className="mx-auto max-w-4xl">
						<div className="bg-white rounded-lg shadow-md p-6">
							<h3 className="font-semibold text-lg text-gray-800 mb-4">
								🎯 Usage Guide
							</h3>
							<div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
								<div>
									<h4 className="font-medium text-gray-700 mb-2">Supported Input Formats:</h4>
									<ul className="space-y-1">
										<li>• Country codes: CN, US, JP, UK</li>
										<li>• Chinese names: 中国, 美国, 日本</li>
										<li>• English names: China, America, Japan</li>
									</ul>
								</div>
								<div>
									<h4 className="font-medium text-gray-700 mb-2">Features:</h4>
									<ul className="space-y-1">
										<li>• Generate real usable IP addresses</li>
										<li>• Support batch generation (1-10)</li>
										<li>• One-click copy single or all IPs</li>
										<li>• Display detailed geolocation info</li>
									</ul>
								</div>
							</div>
							
							<div className="mt-4 pt-4 border-t border-gray-200">
								<h4 className="font-medium text-gray-700 mb-2">API Call Examples:</h4>
								<div className="bg-gray-50 rounded-lg p-3 font-mono text-sm space-y-2">
									<div className="text-gray-600">GET /api/generate-ip?country=CN&count=3</div>
									<div className="text-gray-600">GET /api/generate-ip?country=China&count=1</div>
								</div>
							</div>
						</div>
					</section>
				</div>

				{/* Footer */}
				<footer className="border-t bg-gray-50">
					<div className="container mx-auto px-4 py-6 text-center text-gray-600">
						<p className="text-sm">
							Built with{" "}
							<Link
								href="https://create.t3.gg"
								target="_blank"
								className="text-blue-600 hover:text-blue-800"
							>
								T3 Stack
							</Link>{" "}
							- Professional geo-location IP generation service
						</p>
					</div>
				</footer>
			</main>
	);
}
