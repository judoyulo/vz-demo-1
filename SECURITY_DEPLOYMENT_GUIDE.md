# 🔒 API安全保护与Vercel部署指南

## 🚨 重要安全修复

### 已修复的安全漏洞
1. **硬编码API密钥** - 已从 `pages/api/elevenlabs-tts.ts` 中移除
2. **前端暴露API密钥** - 移除所有 `NEXT_PUBLIC_*` API密钥
3. **不安全的直接API调用** - 改为使用安全的后端API路由

## 📋 Vercel部署安全配置

### 1. 环境变量配置

在Vercel Dashboard中设置以下环境变量（不要在代码中硬编码）：

```bash
# 在Vercel项目设置 > Environment Variables 中添加：

ELEVENLABS_API_KEY=your_actual_elevenlabs_api_key
OPENAI_API_KEY=your_actual_openai_api_key  
HUGGINGFACE_API_KEY=your_actual_huggingface_api_key
```

### 2. 本地开发配置

创建 `.env.local` 文件（已被 `.gitignore` 忽略）：

```bash
# 复制 env.example 为 .env.local
cp env.example .env.local

# 编辑 .env.local 并填入真实的API密钥
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

### 3. 安全架构变更

#### ✅ 修复前（不安全）:
```typescript
// 🚨 在前端直接暴露API密钥 (不安全的示例)
const apiKey = "NEVER_DO_THIS_EXPOSES_TO_FRONTEND";
fetch('https://api.openai.com/v1/chat/completions', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});
```

#### ✅ 修复后（安全）:
```typescript
// ✅ 通过安全的后端API路由
fetch('/api/ai-chat', {
  method: 'POST',
  body: JSON.stringify({ message, personality })
});
```

## 🛡️ 安全措施

### 1. API密钥保护
- ✅ 所有API密钥现在仅存储在服务器端
- ✅ 前端无法访问任何敏感API密钥
- ✅ `.env.local` 文件被 `.gitignore` 忽略
- ✅ 提供 `env.example` 作为配置模板

### 2. API路由安全
- ✅ 新增 `/api/ai-chat` 安全路由
- ✅ 新增 `/api/elevenlabs-tts` 安全路由（已有）
- ✅ 新增 `/api/speech-to-text` 安全路由（已有）

### 3. 错误处理
- ✅ API失败时的优雅降级
- ✅ 详细的服务器端日志记录
- ✅ 不向前端暴露敏感错误信息

## 🚀 Vercel部署步骤

### 1. 推送代码到Git
```bash
git add .
git commit -m "🔒 Security: Protect API keys and implement secure routes"
git push origin main
```

### 2. 在Vercel中配置环境变量
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** > **Environment Variables**
4. 添加以下变量：
   - `ELEVENLABS_API_KEY`: 你的ElevenLabs API密钥
   - `OPENAI_API_KEY`: 你的OpenAI API密钥  
   - `HUGGINGFACE_API_KEY`: 你的HuggingFace API密钥

### 3. 重新部署
- Vercel会自动检测环境变量变更并重新部署
- 或手动触发重新部署

## 🔍 安全验证清单

部署后请验证：

- [ ] 前端控制台中没有API密钥信息
- [ ] `/api/ai-chat` 端点正常工作
- [ ] `/api/elevenlabs-tts` 端点正常工作
- [ ] AI对话功能正常
- [ ] 语音合成功能正常
- [ ] 无API密钥泄漏到客户端

## ⚠️ 重要注意事项

1. **永远不要**将API密钥提交到Git仓库
2. **定期轮换**API密钥以提高安全性
3. **监控API使用量**防止滥用
4. **设置API使用限制**在各API提供商处
5. **定期审查**环境变量配置

## 🆘 故障排除

### API不工作？
1. 检查Vercel环境变量是否正确设置
2. 查看Vercel函数日志
3. 确认API密钥有效且有足够额度

### 本地开发问题？
1. 确认 `.env.local` 文件存在且包含正确的API密钥
2. 重启开发服务器 `npm run dev`
3. 检查控制台错误信息

---

**记住：安全第一！永远不要在前端暴露API密钥。** 🔒