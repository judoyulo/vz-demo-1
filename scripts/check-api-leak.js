// scripts/check-api-leak.js
// API密钥泄漏检查脚本 - 用于本地开发、GitHub推送前和CI/CD中的安全自查

const fs = require('fs');
const path = require('path');

// 敏感信息检测模式
const SENSITIVE_PATTERNS = [
  // OpenAI API Keys
  { pattern: /sk-[A-Za-z0-9]{20,}/g, name: 'OpenAI API Key' },
  
  // ElevenLabs API Keys  
  { pattern: /sk_[A-Za-z0-9]{20,}/g, name: 'ElevenLabs API Key' },
  
  // 通用API密钥模式
  { pattern: /api_key\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]?/gi, name: 'API Key Assignment' },
  
  // Bearer Token
  { pattern: /Authorization\s*[:=]\s*['"]Bearer\s+[A-Za-z0-9\-._~+/=]{20,}['"]?/gi, name: 'Bearer Token' },
  
  // 危险的公开环境变量（会暴露到前端）
  { pattern: /process\.env\.NEXT_PUBLIC_[A-Z0-9_]*API[A-Z0-9_]*KEY/g, name: 'Dangerous Public API Key' },
  { pattern: /process\.env\.NEXT_PUBLIC_[A-Z0-9_]*SECRET/g, name: 'Dangerous Public Secret' },
  
  // 硬编码的密钥（常见格式）
  { pattern: /['"]sk-[A-Za-z0-9]{20,}['"]/, name: 'Hardcoded OpenAI Key' },
  { pattern: /['"]sk_[A-Za-z0-9]{20,}['"]/, name: 'Hardcoded ElevenLabs Key' },
  
  // AWS密钥
  { pattern: /AKIA[0-9A-Z]{16}/g, name: 'AWS Access Key' },
  
  // JWT tokens
  { pattern: /eyJ[A-Za-z0-9_\/\+\-\.]+/g, name: 'Potential JWT Token' },
  
  // Google API Key
  { pattern: /AIza[0-9A-Za-z\-_]{35}/g, name: 'Google API Key' }
];

// 排除的文件和目录
const EXCLUDED_DIRS = ['node_modules', '.git', '.next', 'dist', 'build', '.cache'];
const EXCLUDED_FILES = ['package-lock.json', 'yarn.lock', '.DS_Store'];

// 扫描目录
function walk(dir, callback) {
  try {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      
      try {
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !EXCLUDED_DIRS.includes(file)) {
          walk(fullPath, callback);
        } else if (stat.isFile() && 
                   !EXCLUDED_FILES.includes(file) && 
                   /\.(js|ts|tsx|jsx|env|json|md|yml|yaml)$/.test(file)) {
          callback(fullPath);
        }
      } catch (error) {
        console.warn(`⚠️  无法访问文件: ${fullPath}`);
      }
    });
  } catch (error) {
    console.warn(`⚠️  无法扫描目录: ${dir}`);
  }
}

// 检查单个文件
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const findings = [];
    
    SENSITIVE_PATTERNS.forEach(({ pattern, name }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // 检查是否在注释中（可能是示例）
          const lines = content.split('\n');
          let isInComment = false;
          
          lines.forEach((line, lineNum) => {
            if (line.includes(match)) {
              const trimmed = line.trim();
              isInComment = trimmed.startsWith('//') || 
                           trimmed.startsWith('*') || 
                           trimmed.startsWith('#') ||
                           line.includes('your_api_key_here') ||
                           line.includes('example') ||
                           line.includes('placeholder') ||
                           line.includes('dummy_key') ||
                           line.includes('test_key') ||
                           line.includes('fake_key') ||
                           line.includes('NEVER_DO_THIS');
              
              findings.push({
                file: filePath,
                line: lineNum + 1,
                pattern: name,
                match: match.substring(0, 20) + '...',
                isComment: isInComment,
                fullLine: line.trim()
              });
            }
          });
        });
      }
    });
    
    return findings;
  } catch (error) {
    console.warn(`⚠️  无法读取文件: ${filePath}`);
    return [];
  }
}

// 主扫描函数
function scanProject() {
  console.log('🔍 开始扫描项目中的API密钥泄漏...\n');
  
  const allFindings = [];
  
  walk('.', file => {
    const findings = checkFile(file);
    allFindings.push(...findings);
  });
  
  return allFindings;
}

// 生成报告
function generateReport(findings) {
  const realThreats = findings.filter(f => !f.isComment);
  const potentialIssues = findings.filter(f => f.isComment);
  
  console.log('📊 扫描结果：');
  console.log(`   扫描的文件: ${findings.length > 0 ? '多个' : '0'}`);
  console.log(`   发现的问题: ${realThreats.length} 个严重问题, ${potentialIssues.length} 个潜在问题\n`);
  
  if (realThreats.length > 0) {
    console.log('🚨 严重安全问题 (需要立即修复):');
    realThreats.forEach(({ file, line, pattern, match, fullLine }) => {
      console.log(`❗ ${file}:${line}`);
      console.log(`   类型: ${pattern}`);
      console.log(`   内容: ${match}`);
      console.log(`   代码: ${fullLine.substring(0, 80)}${fullLine.length > 80 ? '...' : ''}`);
      console.log('');
    });
  }
  
  if (potentialIssues.length > 0) {
    console.log('⚠️  潜在问题 (请确认是否为示例代码):');
    potentialIssues.forEach(({ file, line, pattern, match }) => {
      console.log(`   ${file}:${line} - ${pattern}: ${match}`);
    });
    console.log('');
  }
  
  if (realThreats.length === 0 && potentialIssues.length === 0) {
    console.log('✅ 没有发现API密钥泄漏问题！');
    console.log('🛡️  项目API安全状态良好');
    return true;
  }
  
  if (realThreats.length > 0) {
    console.log('💡 修复建议:');
    console.log('   1. 将硬编码的API密钥移动到 .env.local 文件');
    console.log('   2. 确保 .env.local 被 .gitignore 忽略');
    console.log('   3. 移除前端代码中的 process.env.NEXT_PUBLIC_*_KEY');
    console.log('   4. 使用安全的API路由 (/api/*.ts) 处理敏感调用');
    console.log('');
    return false;
  }
  
  return true;
}

// 执行扫描
if (require.main === module) {
  const findings = scanProject();
  const isSecure = generateReport(findings);
  
  if (!isSecure) {
    console.log('🔒 构建已停止，请修复安全问题后重试。');
    process.exit(1);
  }
  
  console.log('🚀 安全检查通过，可以继续构建/部署！');
}