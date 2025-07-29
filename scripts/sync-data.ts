/**
 * 主数据同步脚本
 * 功能：
 * 1. 数据备份
 * 2. 数据更新（地区数据 + IP数据） 
 * 3. 多格式导出（JSON、CSV、Excel）
 * 4. 失败时自动回退
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { silentDb as db } from '../src/server/db.js';

interface SyncOptions {
  forceUpdate?: boolean;
  skipBackup?: boolean;
  exportFormats?: ('json' | 'csv' | 'excel')[];
  runValidation?: boolean;
}

class DataSyncManager {
  private readonly backupDir = path.join(process.cwd(), 'data', 'backups');
  private readonly dataDir = path.join(process.cwd(), 'data');
  private currentTimestamp: string;
  private backupPaths: { [key: string]: string } = {};

  constructor() {
    this.currentTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.ensureDirectories();
  }

  private ensureDirectories() {
    [this.dataDir, this.backupDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * 创建数据备份
   */
  async createBackup(): Promise<void> {
    console.log('🔄 创建数据备份...');
    
    const filesToBackup = [
      'combined-geo-ip-data.json',
      'combined-geo-ip-data.min.json',
      'combined-geo-ip-data.csv',
      'combined-geo-ip-data.xlsx'
    ];

    for (const filename of filesToBackup) {
      const sourcePath = path.join(this.dataDir, filename);
      if (fs.existsSync(sourcePath)) {
        const backupPath = path.join(this.backupDir, `${this.currentTimestamp}_${filename}`);
        fs.copyFileSync(sourcePath, backupPath);
        this.backupPaths[filename] = backupPath;
        console.log(`📁 备份: ${filename} → ${path.basename(backupPath)}`);
      }
    }

    // 同时备份数据库
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    if (fs.existsSync(dbPath)) {
      const dbBackupPath = path.join(this.backupDir, `${this.currentTimestamp}_dev.db`);
      fs.copyFileSync(dbPath, dbBackupPath);
      this.backupPaths['database'] = dbBackupPath;
      console.log(`🗄️ 数据库备份: dev.db → ${path.basename(dbBackupPath)}`);
    }

    console.log('✅ 备份完成');
  }

  /**
   * 回退到备份版本
   */
  async rollbackToBackup(): Promise<void> {
    console.log('⚠️ 检测到错误，正在回退到备份版本...');

    for (const [filename, backupPath] of Object.entries(this.backupPaths)) {
      if (filename === 'database') {
        const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
        if (fs.existsSync(backupPath)) {
          fs.copyFileSync(backupPath, dbPath);
          console.log(`🔄 数据库回退: ${path.basename(backupPath)} → dev.db`);
        }
      } else {
        const targetPath = path.join(this.dataDir, filename);
        if (fs.existsSync(backupPath)) {
          fs.copyFileSync(backupPath, targetPath);
          console.log(`🔄 文件回退: ${path.basename(backupPath)} → ${filename}`);
        }
      }
    }

    console.log('✅ 回退完成');
  }

  /**
   * 更新地区数据
   */
  async updateTerritories(): Promise<void> {
    console.log('🌍 更新地区数据...');
    
    try {
      execSync('pnpm run import:territories', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ 地区数据更新完成');
    } catch (error) {
      console.error('❌ 地区数据更新失败:', error);
      throw error;
    }
  }

  /**
   * 更新IP数据  
   */
  async updateIpData(): Promise<void> {
    console.log('🌐 更新IP数据...');
    
    try {
      execSync('pnpm run import:ip2location', {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ IP数据更新完成');
    } catch (error) {
      console.error('❌ IP数据更新失败:', error);
      throw error;
    }
  }

  /**
   * 导出JSON格式数据
   */
  async exportJson(): Promise<void> {
    console.log('📄 导出JSON格式...');
    
    try {
      execSync('pnpm run generate:data', {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ JSON格式导出完成');
    } catch (error) {
      console.error('❌ JSON格式导出失败:', error);
      throw error;
    }
  }

  /**
   * 导出CSV格式数据
   */
  async exportCsv(): Promise<void> {
    console.log('📋 导出CSV格式...');
    
    try {
      execSync('pnpm run export:csv', {
        stdio: 'inherit', 
        cwd: process.cwd()
      });
      console.log('✅ CSV格式导出完成');
    } catch (error) {
      console.error('❌ CSV格式导出失败:', error);
      throw error;
    }
  }

  /**
   * 导出Excel格式数据
   */
  async exportExcel(): Promise<void> {
    console.log('📊 导出Excel格式...');
    
    try {
      execSync('pnpm run export:excel', {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Excel格式导出完成');
    } catch (error) {
      console.error('❌ Excel格式导出失败:', error);
      throw error;
    }
  }

  /**
   * 运行数据验证（可选）
   */
  async validateData(): Promise<void> {
    console.log('🔍 运行数据质量验证...');
    
    try {
      execSync('pnpm run validate:sample', {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ 数据验证完成');
    } catch (error) {
      console.error('⚠️ 数据验证失败，但同步继续:', error);
      // 验证失败不阻止同步过程
    }
  }

  /**
   * 检查数据是否有变化
   */
  async hasDataChanged(): Promise<boolean> {
    console.log('🔍 检查数据变化...');
    
    try {
      const result = execSync('git diff --name-only data/', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      const hasChanges = result.trim().length > 0;
      console.log(hasChanges ? '📊 检测到数据变化' : '📊 数据无变化');
      return hasChanges;
    } catch (error) {
      console.log('⚠️ 无法检查Git变化，假设有变化');
      return true;
    }
  }

  /**
   * 清理旧备份（保留最近7天）
   */
  async cleanupOldBackups(): Promise<void> {
    console.log('🧹 清理旧备份...');
    
    const files = fs.readdirSync(this.backupDir);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(this.backupDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`✅ 清理了 ${deletedCount} 个旧备份文件`);
    } else {
      console.log('✅ 无需清理备份文件');
    }
  }

  /**
   * 生成同步报告
   */
  async generateReport(): Promise<void> {
    console.log('📋 生成同步报告...');

    try {
      const jsonPath = path.join(this.dataDir, 'combined-geo-ip-data.json');
      if (!fs.existsSync(jsonPath)) {
        throw new Error('数据文件不存在');
      }

      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      const stats = fs.statSync(jsonPath);

      const report = {
        timestamp: new Date().toISOString(),
        version: data.metadata.version,
        countries: data.metadata.countries,
        ipRanges: data.metadata.ipRanges,
        dataSize: data.metadata.dataSize,
        fileSize: `${(stats.size / (1024 * 1024)).toFixed(2)}MB`,
        generatedFiles: [
          'combined-geo-ip-data.json',
          'combined-geo-ip-data.min.json',
          'combined-geo-ip-data.csv',
          'combined-geo-ip-data.xlsx'
        ].filter(f => fs.existsSync(path.join(this.dataDir, f)))
      };

      const reportPath = path.join(this.dataDir, 'sync-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      console.log('📊 同步报告:');
      console.log(`   - 国家/地区: ${report.countries}`);
      console.log(`   - IP段: ${report.ipRanges}`);
      console.log(`   - 数据大小: ${report.dataSize}`);
      console.log(`   - 生成文件: ${report.generatedFiles.length} 个`);
      console.log(`   - 报告保存: sync-report.json`);

    } catch (error) {
      console.error('❌ 生成报告失败:', error);
    }
  }
}

/**
 * 主同步函数
 */
async function syncData(options: SyncOptions = {}): Promise<void> {
  const {
    forceUpdate = process.env.FORCE_UPDATE === 'true',
    skipBackup = false,
    exportFormats = ['json', 'csv', 'excel'],
    runValidation = true
  } = options;

  const syncManager = new DataSyncManager();
  let success = false;

  try {
    console.log('🚀 开始数据同步...');
    console.log(`⚙️ 配置: 强制更新=${forceUpdate}, 跳过备份=${skipBackup}`);
    console.log(`📦 导出格式: ${exportFormats.join(', ')}`);
    console.log('');

    // 1. 创建备份
    if (!skipBackup) {
      await syncManager.createBackup();
    }

    // 2. 更新数据源
    await syncManager.updateTerritories();
    await syncManager.updateIpData(); 

    // 3. 导出多种格式
    if (exportFormats.includes('json')) {
      await syncManager.exportJson();
    }
    
    if (exportFormats.includes('csv')) {
      await syncManager.exportCsv();
    }
    
    if (exportFormats.includes('excel')) {
      await syncManager.exportExcel();
    }

    // 4. 检查是否有变化
    const hasChanges = await syncManager.hasDataChanged();
    
    if (!hasChanges && !forceUpdate) {
      console.log('📊 数据无变化且未强制更新，同步完成');
      success = true;
      return;
    }

    // 5. 运行数据验证（可选）
    if (runValidation) {
      await syncManager.validateData();
    }

    // 6. 生成报告
    await syncManager.generateReport();

    // 7. 清理旧备份
    await syncManager.cleanupOldBackups();

    success = true;
    console.log('🎉 数据同步完成！');

  } catch (error) {
    console.error('❌ 数据同步失败:', error);
    
    // 回退到备份版本
    if (!skipBackup) {
      await syncManager.rollbackToBackup();
    }
    
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  syncData().catch(error => {
    console.error('💥 同步过程出现致命错误:', error);
    process.exit(1);
  });
}

export { syncData, DataSyncManager }; 