/**
 * 验证系统演示脚本
 * 用于测试验证功能是否正常工作
 */

import { IpDataValidator } from './validate-ip-data.js';

async function runValidationDemo() {
  console.log('🎮 开始验证系统演示...');
  console.log('📝 这是一个演示脚本，将验证5个IP地址样本\n');

  const validator = new IpDataValidator(5); // 只验证5个样本用于演示
  
  try {
    const report = await validator.runValidation();
    
    console.log('\n🎉 演示完成！');
    console.log('\n📊 演示结果摘要:');
    console.log(`   - 验证样本: ${report.summary.totalSamples}`);
    console.log(`   - 准确率: ${(report.summary.accuracyRate * 100).toFixed(1)}%`);
    console.log(`   - 正确结果: ${report.summary.correctCount}`);
    console.log(`   - 错误结果: ${report.summary.incorrectCount}`);
    console.log(`   - API错误: ${report.summary.errorCount}`);
    console.log(`   - 平均置信度: ${(report.summary.averageConfidence * 100).toFixed(1)}%`);
    
    console.log('\n🔧 API提供商表现:');
    Object.entries(report.providerStats).forEach(([provider, stats]) => {
      console.log(`   - ${provider}:`);
      console.log(`     • 成功率: ${(stats.successRate * 100).toFixed(1)}%`);
      console.log(`     • 准确率: ${(stats.accuracyRate * 100).toFixed(1)}%`);
    });
    
    if (report.errors.length > 0) {
      console.log('\n⚠️ 发现的问题:');
      report.errors.slice(0, 3).forEach((error, index) => {
        console.log(`   ${index + 1}. IP: ${error.ip}`);
        console.log(`      预期: ${error.expected.countryCode} (${error.expected.countryName})`);
        const actualResults = Object.entries(error.actual)
          .filter(([_, response]) => response.success)
          .map(([provider, response]) => `${provider}: ${response.countryCode}`)
          .join(', ');
        console.log(`      实际: ${actualResults || '无成功响应'}`);
      });
      
      if (report.errors.length > 3) {
        console.log(`   ... 还有 ${report.errors.length - 3} 个问题`);
      }
    }
    
    console.log('\n📁 验证报告已保存到 data/validation/ 目录');
    console.log('💡 提示: 运行 "pnpm run validate:data" 进行完整验证');
    
  } catch (error) {
    console.error('💥 演示失败:', error);
    process.exit(1);
  }
}

// 运行演示
if (import.meta.url === `file://${process.argv[1]}`) {
  runValidationDemo().catch(error => {
    console.error('💥 演示脚本执行失败:', error);
    process.exit(1);
  });
}

export { runValidationDemo }; 