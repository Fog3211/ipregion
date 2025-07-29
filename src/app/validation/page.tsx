import fs from 'fs';
import path from 'path';
import Link from 'next/link';

interface ValidationSummary {
  timestamp: string;
  summary: {
    totalSamples: number;
    correctCount: number;
    incorrectCount: number;
    errorCount: number;
    accuracyRate: number;
    averageConfidence: number;
  };
  providerStats: {
    [provider: string]: {
      successRate: number;
      accuracyRate: number;
      responseTime: number;
    };
  };
  errorCount: number;
}

function getValidationSummary(): ValidationSummary | null {
  try {
    const summaryPath = path.join(process.cwd(), 'data', 'validation', 'latest-validation-summary.json');
    if (fs.existsSync(summaryPath)) {
      return JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    }
  } catch (error) {
    console.error('Failed to read validation summary:', error);
  }
  return null;
}

function getValidationHistory(): Array<{ filename: string; date: string; size: string }> {
  try {
    const validationDir = path.join(process.cwd(), 'data', 'validation');
    if (!fs.existsSync(validationDir)) {
      return [];
    }

    const files = fs.readdirSync(validationDir)
      .filter(file => file.startsWith('validation-report-') && file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(validationDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          date: stats.mtime.toISOString().split('T')[0] || '',
          size: `${(stats.size / 1024).toFixed(1)} KB`
        };
      })
      .sort((a, b) => b.filename.localeCompare(a.filename))
      .slice(0, 10); // 最多显示10个历史报告

    return files;
  } catch (error) {
    console.error('Failed to read validation history:', error);
    return [];
  }
}

export default function ValidationPage() {
  const summary = getValidationSummary();
  const history = getValidationHistory();

  const getAccuracyColor = (rate: number) => {
    if (rate >= 0.95) return 'text-green-600 bg-green-100';
    if (rate >= 0.85) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAccuracyIcon = (rate: number) => {
    if (rate >= 0.95) return '🟢';
    if (rate >= 0.85) return '🟡';
    return '🔴';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="font-bold text-2xl text-gray-800 hover:text-blue-600 transition-colors">
            Geo IP Generator
          </Link>
          <div className="flex items-center space-x-4">
            <Link 
              href="/download"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
            >
              📦 Download Data
            </Link>
            <div className="text-sm text-gray-600">
              Data Validation
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-bold text-3xl text-gray-800 mb-4">
            🔍 Data Validation
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Monitor the accuracy and quality of our IP geolocation database through automated validation against multiple third-party APIs.
          </p>
        </div>

        {summary ? (
          <>
            {/* Current Status */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-xl text-gray-800">📊 Latest Validation Results</h2>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAccuracyColor(summary.summary.accuracyRate)}`}>
                    {getAccuracyIcon(summary.summary.accuracyRate)} {(summary.summary.accuracyRate * 100).toFixed(1)}% Accuracy
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(summary.timestamp).toLocaleDateString()} {new Date(summary.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Summary Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{summary.summary.totalSamples}</div>
                  <div className="text-sm text-gray-600">Total Samples</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{summary.summary.correctCount}</div>
                  <div className="text-sm text-gray-600">Correct Results</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{summary.summary.incorrectCount}</div>
                  <div className="text-sm text-gray-600">Incorrect Results</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{summary.summary.errorCount}</div>
                  <div className="text-sm text-gray-600">API Errors</div>
                </div>
              </div>

              {/* Confidence Score */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Average Confidence</span>
                  <span className="text-sm text-gray-600">{(summary.summary.averageConfidence * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${summary.summary.averageConfidence * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Provider Statistics */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">API Provider Performance</h3>
                <div className="grid gap-3">
                  {Object.entries(summary.providerStats).map(([provider, stats]) => (
                    <div key={provider} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-800">{provider}</div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-green-600">
                          ✅ {(stats.successRate * 100).toFixed(1)}% Success
                        </span>
                        <span className="text-blue-600">
                          🎯 {(stats.accuracyRate * 100).toFixed(1)}% Accuracy
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Validation Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="font-semibold text-xl text-gray-800 mb-4">🔬 Validation Methodology</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">🎯 Sampling Strategy</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Random sampling from database IP ranges</li>
                    <li>• Ensures geographical distribution balance</li>
                    <li>• Covers major countries and territories</li>
                    <li>• Sample size: {summary.summary.totalSamples} IPs per validation</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">🔄 Validation Process</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Multi-provider cross-validation</li>
                    <li>• Daily rotation of API providers</li>
                    <li>• Confidence scoring based on consensus</li>
                    <li>• Automated error detection and logging</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">📡 API Providers</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• ip-api.com (1000 requests/day)</li>
                    <li>• ipapi.co (1000 requests/day)</li>
                    <li>• geojs.io (unlimited free)</li>
                    <li>• Rotation prevents rate limiting</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">📈 Quality Metrics</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Accuracy: Country code match rate</li>
                    <li>• Confidence: Cross-provider consensus</li>
                    <li>• Success: API response reliability</li>
                    <li>• Threshold: 85% minimum accuracy</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* No Validation Data */
          <div className="bg-white rounded-lg shadow-md p-8 text-center mb-8">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="font-semibold text-xl text-gray-800 mb-2">No Validation Data Available</h2>
            <p className="text-gray-600 mb-6">
              No validation reports have been generated yet. Run a validation to see data quality metrics.
            </p>
            <div className="space-y-3">
              <div className="text-sm text-gray-500">
                Validation runs automatically every Monday, or you can trigger manually:
              </div>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 inline-block">
                pnpm run validate:data
              </div>
            </div>
          </div>
        )}

        {/* Validation History */}
        {history.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="font-semibold text-xl text-gray-800 mb-4">📚 Validation History</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Date</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Report File</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Size</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((report, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-600">{report.date}</td>
                      <td className="py-2 px-3 font-mono text-xs text-gray-800">{report.filename}</td>
                      <td className="py-2 px-3 text-gray-600">{report.size}</td>
                      <td className="py-2 px-3">
                        <a
                          href={`/data/validation/${report.filename}`}
                          download
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Validation reports are automatically generated and stored for analysis.
                <br />
                Contact the development team if you need access to older reports.
              </p>
            </div>
          </div>
        )}

        {/* Action Panel */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6">
          <h2 className="font-semibold text-xl text-gray-800 mb-4">⚡ Quick Actions</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="font-medium text-gray-700 mb-2">Manual Validation</h3>
              <p className="text-sm text-gray-600 mb-3">Run validation manually for immediate results</p>
              <div className="bg-gray-900 rounded p-2 font-mono text-xs text-green-400">
                pnpm run validate:data
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-medium text-gray-700 mb-2">View Full Reports</h3>
              <p className="text-sm text-gray-600 mb-3">Download detailed validation reports</p>
              <div className="text-sm text-blue-600">
                See validation history above
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🔧</div>
              <h3 className="font-medium text-gray-700 mb-2">GitHub Actions</h3>
              <p className="text-sm text-gray-600 mb-3">Automated validation runs weekly</p>
              <div className="text-sm text-gray-500">
                Every Monday at 11:00 Beijing time
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              ← Back to IP Generator
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
} 