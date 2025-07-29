import fs from 'fs';
import path from 'path';
import Link from 'next/link';

interface DataFileInfo {
  name: string;
  description: string;
  format: string;
  size: string;
  lastModified: string;
  downloadUrl: string;
  icon: string;
}

function getFileInfo(filename: string): DataFileInfo | null {
  const filePath = path.join(process.cwd(), 'data', filename);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const stats = fs.statSync(filePath);
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  const fileInfoMap: Record<string, Omit<DataFileInfo, 'size' | 'lastModified' | 'downloadUrl'>> = {
    'combined-geo-ip-data.json': {
      name: 'Complete JSON Data',
      description: 'Full dataset with country information and IP ranges in JSON format',
      format: 'JSON',
      icon: '📄'
    },
    'combined-geo-ip-data.min.json': {
      name: 'Minified JSON Data', 
      description: 'Compressed JSON format optimized for smaller file size',
      format: 'JSON (Min)',
      icon: '🗜️'
    },
    'combined-geo-ip-data.csv': {
      name: 'Complete CSV Data',
      description: 'Full dataset in CSV format, suitable for Excel and data analysis',
      format: 'CSV',
      icon: '📋'
    },
    'combined-geo-ip-data-light.csv': {
      name: 'Light CSV Data',
      description: 'Basic IP range data in CSV format (Country, Name, Start IP, End IP)',
      format: 'CSV (Light)',
      icon: '📑'
    },
    'combined-geo-ip-data.xlsx': {
      name: 'Excel Workbook',
      description: 'Multi-sheet Excel file with data analysis and statistics',
      format: 'Excel',
      icon: '📊'
    }
  };

  const fileInfo = fileInfoMap[filename];
  if (!fileInfo) return null;

  return {
    ...fileInfo,
    size: `${sizeInMB} MB`,
    lastModified: stats.mtime.toISOString().split('T')[0] || '',
    downloadUrl: `/data/${filename}`
  };
}

export default function DownloadPage() {
  const availableFiles = [
    'combined-geo-ip-data.json',
    'combined-geo-ip-data.min.json', 
    'combined-geo-ip-data.csv',
    'combined-geo-ip-data-light.csv',
    'combined-geo-ip-data.xlsx'
  ].map(getFileInfo).filter((file): file is DataFileInfo => file !== null);

  // 读取同步报告
  let syncReport = null;
  try {
    const reportPath = path.join(process.cwd(), 'data', 'sync-report.json');
    if (fs.existsSync(reportPath)) {
      syncReport = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    }
  } catch (error) {
    console.error('Failed to read sync report:', error);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="font-bold text-2xl text-gray-800 hover:text-blue-600 transition-colors">
            Geo IP Generator
          </Link>
          <div className="text-sm text-gray-600">
            Data Downloads
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-bold text-3xl text-gray-800 mb-4">
            📦 Data Downloads
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Download our geo-location IP database in various formats. All data is updated automatically and includes 250+ countries/territories with real IP ranges.
          </p>
        </div>

        {/* Data Statistics */}
        {syncReport && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="font-semibold text-xl text-gray-800 mb-4">📊 Data Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{syncReport.countries}</div>
                <div className="text-sm text-gray-600">Countries/Territories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{syncReport.ipRanges?.toLocaleString()}</div>
                <div className="text-sm text-gray-600">IP Ranges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{syncReport.dataSize}</div>
                <div className="text-sm text-gray-600">Total Data Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{syncReport.generatedFiles?.length || 0}</div>
                <div className="text-sm text-gray-600">Available Formats</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Last updated: {new Date(syncReport.timestamp).toLocaleDateString()} at {new Date(syncReport.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}

        {/* Download Files */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableFiles.map((file, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{file.icon}</div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {file.format}
                </span>
              </div>
              
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                {file.name}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4">
                {file.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Size: {file.size}</span>
                <span>Updated: {file.lastModified}</span>
              </div>
              
              <a
                href={file.downloadUrl}
                download
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download {file.format}
              </a>
            </div>
          ))}
        </div>

        {/* Usage Information */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="font-semibold text-xl text-gray-800 mb-4">💡 Usage Guide</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">📄 JSON Formats</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Complete JSON:</strong> Full structured data with metadata</li>
                <li>• <strong>Minified JSON:</strong> Optimized for bandwidth and storage</li>
                <li>• Ideal for: APIs, web applications, programmatic access</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">📋 CSV Formats</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Complete CSV:</strong> All data fields in tabular format</li>
                <li>• <strong>Light CSV:</strong> Essential fields only (smaller file)</li>
                <li>• Ideal for: Excel analysis, data processing, databases</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">📊 Excel Format</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Multiple worksheets with data organization</li>
                <li>• Built-in statistics and analysis</li>
                <li>• Ideal for: Business reports, data exploration</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">🔄 Update Schedule</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automatic daily updates via GitHub Actions</li>
                <li>• Territory data: Monthly from authoritative sources</li>
                <li>• IP data: Quarterly from IP2Location LITE</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-700 mb-2">📜 License & Attribution</h3>
            <p className="text-sm text-gray-600">
              This data is provided under the Creative Commons Attribution-ShareAlike 4.0 International License. 
              Territory data sourced from <a href="https://github.com/mledoze/countries" className="text-blue-600 hover:underline">mledoze/countries</a>, 
              IP data from <a href="https://lite.ip2location.com/" className="text-blue-600 hover:underline">IP2Location LITE</a>.
            </p>
          </div>
        </div>

        {/* API Information */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6">
          <h2 className="font-semibold text-xl text-gray-800 mb-4">🔗 Programmatic Access</h2>
          <p className="text-gray-600 mb-4">
            Need real-time access? Use our REST API to generate IP addresses programmatically:
          </p>
          
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 mb-4">
            <div className="mb-2"># Generate 3 China IPs</div>
            <div>curl "https://yoursite.com/api/generate-ip?country=CN&count=3"</div>
          </div>
          
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try API Generator →
          </Link>
        </div>
      </div>
    </main>
  );
} 