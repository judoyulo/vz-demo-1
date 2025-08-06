# 🔒 本地开发环境API安全配置指南

## ✅ **是的，本地开发完全可以安全使用ElevenLabs和OpenAI API！**

你的配置已经是安全的，API密钥通过服务器端处理，不会暴露到前端。

## 🏠 本地开发环境安全架构

### 当前安全配置状态
✅ **API密钥保护**: 存储在 `.env.local` (已被 `.gitignore` 忽略)  
✅ **服务器端处理**: 所有API调用通过安全的后端路由  
✅ **前端无暴露**: 前端无法访问任何API密钥  
✅ **环境隔离**: 本地和生产环境独立配置  

## 🔧 本地配置验证

### 1. 检查环境变量文件
```bash
# 确认 .env.local 存在且包含API密钥
ls -la .env.local

# 应该包含这些变量：
# ELEVENLABS_API_KEY=your_key_here
# OPENAI_API_KEY=your_key_here
# HUGGINGFACE_API_KEY=your_key_here (可选)
```

### 2. 验证API路由工作
```bash
# 启动开发服务器
npm run dev

# 测试API (可选 - 运行测试脚本)
node test-local-api.js
```

## 🛡️ 安全架构详解

### 数据流程 (安全)
```
用户前端 → 安全API路由 → 外部API服务
    ↓           ↓              ↓
 无API密钥   读取.env.local   使用真实密钥
```

### API路由保护
1. **`/api/elevenlabs-tts`**:
   ```typescript
   const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY; // 服务器端
   if (!elevenLabsApiKey) {
     return res.status(500).json({ error: 'API key not configured' });
   }
   ```

2. **`/api/ai-chat`**:
   ```typescript
   const openaiApiKey = process.env.OPENAI_API_KEY; // 服务器端
   const huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY; // 服务器端
   ```

3. **`/api/speech-to-text`**:
   ```typescript
   const openaiApiKey = process.env.OPENAI_API_KEY; // 服务器端
   ```

## 🧪 本地API测试

### 手动测试ElevenLabs
```bash
curl -X POST http://localhost:3001/api/elevenlabs-tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","voiceId":"9BWtsMINqrJLrRacOk9x"}'
```

### 手动测试AI Chat
```bash
curl -X POST http://localhost:3001/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","personality":"Sarah: Detective"}'
```

## 🔍 安全验证清单

- [ ] ✅ `.env.local` 文件存在且包含API密钥
- [ ] ✅ `.env.local` 被 `.gitignore` 忽略 (不会提交到Git)
- [ ] ✅ 前端控制台没有API密钥信息
- [ ] ✅ `/api/elevenlabs-tts` 端点正常工作
- [ ] ✅ `/api/ai-chat` 端点正常工作
- [ ] ✅ 语音合成功能正常
- [ ] ✅ AI对话功能正常

## 🆘 常见问题排除

### ❓ API不工作怎么办？

1. **检查环境变量**:
   ```bash
   # 确认.env.local存在且格式正确
   cat .env.local | head -3
   # 应该看到: ELEVENLABS_API_KEY=sk_xxx...
   ```

2. **检查API密钥有效性**:
   - 登录 [ElevenLabs Dashboard](https://elevenlabs.io/app/settings) 确认密钥有效
   - 登录 [OpenAI Dashboard](https://platform.openai.com/api-keys) 确认密钥有效

3. **检查API配额**:
   - ElevenLabs: 确认还有字符配额
   - OpenAI: 确认账户有余额

4. **重启开发服务器**:
   ```bash
   # 停止服务器 (Ctrl+C)
   # 重新启动
   npm run dev
   ```

### ❓ 控制台有错误？

检查浏览器开发者工具的Console和Network标签：
- **Console**: 查看前端错误
- **Network**: 查看API请求状态

### ❓ 环境变量没生效？

1. 确认文件名正确: `.env.local` (不是 `.env`)
2. 确认格式正确: `KEY=value` (等号两边无空格)
3. 重启开发服务器

## 🔒 最佳安全实践

### 1. 环境变量安全
- ✅ 使用 `.env.local` 而不是 `.env`
- ✅ 永远不要提交 `.env.local` 到Git
- ✅ 定期轮换API密钥

### 2. 开发流程安全
- ✅ 所有API调用通过后端路由
- ✅ 前端永远不暴露API密钥
- ✅ 错误处理不泄漏敏感信息

### 3. 监控和限制
- ✅ 监控API使用量
- ✅ 设置合理的API限制
- ✅ 使用不同的API密钥用于开发和生产

## 💡 额外提示

### 快速重新配置
如果需要重新配置API密钥：
```bash
# 1. 备份当前配置
cp .env.local .env.local.backup

# 2. 使用模板重新配置
cp env.example .env.local

# 3. 编辑新的API密钥
nano .env.local

# 4. 重启开发服务器
npm run dev
```

### 团队开发
- 每个开发者都应该有自己的 `.env.local`
- 不要共享API密钥文件
- 使用 `env.example` 作为配置模板

---

**✅ 总结：你的本地开发环境已经完全安全，可以放心使用所有API功能！** 🚀