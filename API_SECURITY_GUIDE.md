# 🔒 API安全完整指南

## 🎯 概述

这个项目实施了企业级的API安全保护系统，确保在本地开发、GitHub推送和Vercel部署的全流程中，API密钥都不会泄漏。

## 🛡️ 安全架构

### 多层防护体系
```
┌─────────────────────┐
│  1. 代码扫描        │ ← scripts/check-api-leak.js
├─────────────────────┤
│  2. Git预提交钩子   │ ← .husky/pre-commit  
├─────────────────────┤
│  3. CI/CD检查       │ ← .github/workflows/security.yml
├─────────────────────┤
│  4. 环境变量隔离    │ ← .env.local + .gitignore
├─────────────────────┤
│  5. 安全API路由     │ ← /api/*.ts (服务器端)
└─────────────────────┘
```

## 🔧 已实施的安全措施

### ✅ 1. 自动代码扫描
- **文件**: `scripts/check-api-leak.js`
- **功能**: 扫描所有代码文件，检测API密钥泄漏
- **检测模式**:
  - OpenAI密钥: `sk-*`
  - ElevenLabs密钥: `sk_*`
  - 危险的公开环境变量: `NEXT_PUBLIC_*_KEY`
  - Bearer Token、AWS密钥、JWT等

### ✅ 2. Git预提交保护
- **文件**: `.husky/pre-commit`
- **功能**: 每次提交前自动运行安全检查
- **效果**: 如果发现API密钥，阻止提交

### ✅ 3. GitHub Actions CI检查
- **文件**: `.github/workflows/security.yml`
- **功能**: PR和推送时自动安全检查
- **包含**:
  - API密钥泄漏检查
  - 构建测试
  - 依赖安全审计

### ✅ 4. 环境变量隔离
- **安全配置**: `.env.local` (不会被Git提交)
- **保护机制**: `.gitignore` 忽略所有环境变量文件
- **模板**: `env.example` 提供配置示例

### ✅ 5. 安全API架构
- **前端**: 永远不暴露API密钥
- **后端**: 所有API调用通过 `/api/*.ts` 路由
- **验证**: 服务器端验证和错误处理

## 🚀 使用方法

### 本地开发
```bash
# 1. 复制环境变量模板
cp env.example .env.local

# 2. 编辑并填入真实API密钥
nano .env.local

# 3. 运行安全检查
npm run security-check

# 4. 启动开发服务器
npm run dev
```

### 提交代码
```bash
# Git会自动运行pre-commit钩子进行安全检查
git add .
git commit -m "你的提交信息"

# 如果有安全问题，提交会被阻止
# 修复问题后重新提交
```

### 手动安全检查
```bash
# 运行完整的安全扫描
npm run security-check

# 检查特定文件
node scripts/check-api-leak.js
```

## 🔍 安全检查详情

### 扫描范围
- ✅ 所有 `.js`, `.ts`, `.tsx`, `.jsx` 文件
- ✅ 配置文件 `.json`, `.yml`, `.yaml`
- ✅ 文档文件 `.md`
- ❌ 排除 `node_modules`, `.git`, `.next`等

### 检测项目
1. **硬编码API密钥**
   - OpenAI: `sk-*`
   - ElevenLabs: `sk_*`
   - AWS: `AKIA*`

2. **不安全的环境变量**
   - `process.env.NEXT_PUBLIC_*_KEY`
   - `process.env.NEXT_PUBLIC_*_SECRET`

3. **Bearer Token泄漏**
   - Authorization headers
   - JWT tokens

4. **通用API密钥模式**
   - `api_key = "xxx"`
   - 各种常见格式

## 📊 检查报告示例

### ✅ 安全通过
```
🔍 开始扫描项目中的API密钥泄漏...

📊 扫描结果：
   发现的问题: 0 个严重问题, 0 个潜在问题

✅ 没有发现API密钥泄漏问题！
🛡️ 项目API安全状态良好
🚀 安全检查通过，可以继续构建/部署！
```

### ❌ 发现问题
```
🚨 严重安全问题 (需要立即修复):
❗ src/api/openai.ts:12
   类型: OpenAI API Key
   内容: sk-proj-abc123...
   代码: const apiKey = "sk-proj-abc123def456";

💡 修复建议:
   1. 将硬编码的API密钥移动到 .env.local 文件
   2. 确保 .env.local 被 .gitignore 忽略
   3. 移除前端代码中的 process.env.NEXT_PUBLIC_*_KEY
```

## 🔧 Vercel部署配置

### 环境变量设置
在Vercel Dashboard中设置：
```
ELEVENLABS_API_KEY=your_real_key
OPENAI_API_KEY=your_real_key
```

### 自动部署检查
- GitHub推送会触发CI安全检查
- 只有通过安全检查的代码才能部署
- Vercel会使用环境变量中的密钥

## 🆘 故障排除

### 问题：Git提交被阻止
**解决方案**:
1. 运行 `npm run security-check` 查看具体问题
2. 修复检测到的安全问题
3. 重新提交

### 问题：CI检查失败
**解决方案**:
1. 查看GitHub Actions日志
2. 本地运行相同的检查命令
3. 修复问题后重新推送

### 问题：本地API不工作
**解决方案**:
1. 确认 `.env.local` 文件存在且格式正确
2. 重启开发服务器
3. 检查API密钥是否有效

## 📋 安全清单

部署前请确认：

- [ ] ✅ `npm run security-check` 通过
- [ ] ✅ `.env.local` 包含所需的API密钥
- [ ] ✅ `.env.local` 被 `.gitignore` 忽略
- [ ] ✅ 前端代码不包含任何硬编码密钥
- [ ] ✅ 所有API调用通过安全的后端路由
- [ ] ✅ Git pre-commit钩子正常工作
- [ ] ✅ CI/CD安全检查通过
- [ ] ✅ Vercel环境变量已正确配置

## 🔄 持续安全

### 定期任务
1. **每月**: 轮换API密钥
2. **每周**: 运行 `npm audit` 检查依赖安全
3. **每次部署**: 确认CI安全检查通过

### 团队协作
1. 新团队成员必须阅读此指南
2. 每个开发者使用自己的 `.env.local`
3. 永远不要通过聊天工具分享API密钥

---

**🔒 记住：安全是持续的过程，而不是一次性的任务！**