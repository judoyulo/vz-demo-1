# 🚨 部署调试报告

## 问题分析

根据用户错误日志：
```
[Log] Using ElevenLabs voice ID: – "elevenlabs-rachel"
[Error] Failed to load resource: the server responded with a status of 400 () (elevenlabs-tts)
```

### 🔍 问题诊断

1. **问题症状**: ElevenLabs API 收到的 voiceId 是 `"elevenlabs-rachel"` 而不是正确的 `"21m00Tcm4TlvDq8ikWAM"`
2. **预期行为**: 应该传递映射后的 voice ID
3. **本地状态**: 代码已修复，`VOICE_MAPPING` 包含正确映射

### 🎯 可能原因

1. **Vercel 缓存问题**: 部署环境可能使用了旧版本代码
2. **代码路径问题**: 某个代码路径没有使用 `getVoiceId()` 函数
3. **构建缓存**: Next.js 构建缓存可能包含旧代码

### 🔧 解决方案

#### 立即措施
1. 强制清除 Vercel 缓存并重新部署
2. 验证所有语音处理路径都使用 `getVoiceId()`
3. 添加更详细的调试日志

#### 验证步骤
1. 检查网络请求中的实际 voiceId
2. 确认 `utils/voiceUtils.ts` 中的映射被正确导入
3. 验证部署版本的 git commit hash

### 📋 当前映射状态
```typescript
"elevenlabs-rachel": "21m00Tcm4TlvDq8ikWAM"
```

### 🚀 下一步行动
1. 立即推送强制缓存清除的修复
2. 添加验证日志确保映射正确工作
3. 测试部署环境