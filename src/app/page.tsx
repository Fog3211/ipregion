import Link from "next/link";

import { IpRegionLookup } from "~/app/_components/ip-region-lookup";

export default function Home() {
	return (
			<main className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-cyan-50">
				{/* Navigation bar */}
				<nav className="border-b bg-white/80 backdrop-blur-sm">
					<div className="container mx-auto flex items-center justify-between px-4 py-3 sm:py-4">
						<h1 className="font-bold text-xl sm:text-2xl text-gray-800">
							Geo IP Generator
						</h1>
						<div className="flex items-center space-x-2 sm:space-x-4">
							<Link 
								href="/download"
								className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors px-2 sm:px-3 py-2 rounded-lg hover:bg-blue-50"
							>
								<span className="hidden sm:inline">📦 Download Data</span>
								<span className="sm:hidden">📦 Download</span>
							</Link>
							<Link 
								href="/validation"
								className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors px-2 sm:px-3 py-2 rounded-lg hover:bg-blue-50"
							>
								<span className="hidden sm:inline">🔍 Data Quality</span>
								<span className="sm:hidden">🔍 Quality</span>
							</Link>
						</div>
					</div>
				</nav>

				{/* Main content area */}
				<div className="container mx-auto flex-1 px-4 py-6 sm:py-8">
					{/* IP region generation component */}
					<section className="mb-8 sm:mb-12">
						<div className="mx-auto max-w-4xl">
							<IpRegionLookup />
						</div>
					</section>

					{/* Usage instructions */}
					<section className="mx-auto max-w-4xl">
						<div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
							<h3 className="font-semibold text-lg text-gray-800 mb-4">
								🎯 Usage Guide
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-sm text-gray-600">
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
								<div className="bg-gray-50 rounded-lg p-3 font-mono text-xs sm:text-sm space-y-2 overflow-x-auto">
									<div className="text-gray-600 whitespace-nowrap">GET /api/generate-ip?country=CN&count=3</div>
									<div className="text-gray-600 whitespace-nowrap">GET /api/generate-ip?country=China&count=1</div>
								</div>
							</div>

							<div className="mt-4 pt-4 border-t border-gray-200">
								<h4 className="font-medium text-gray-700 mb-2">Additional Features:</h4>
								<div className="space-y-3">
									<div>
										<p className="text-gray-600 mb-3">Download complete datasets in multiple formats:</p>
										<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
											<Link 
												href="/download"
												className="inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
											>
												📦 Download Data
											</Link>
											<Link 
												href="/validation"
												className="inline-flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
											>
												🔍 View Data Quality
											</Link>
										</div>
									</div>
									<div className="text-xs text-gray-500">
										• JSON, CSV, Excel formats available<br/>
										• Weekly automated data validation with 85%+ accuracy target<br/>
										• Third-party API cross-validation for quality assurance
									</div>
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
