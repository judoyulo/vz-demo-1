# 🎤 Professional Voice AI Setup Guide

## 🚨 重要：API 密钥配置

**当前问题**：外部 API 效果差是因为缺少 API 密钥配置！

### 1. 创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# Voice AI API Keys
NEXT_PUBLIC_VOICEMOD_API_KEY=your_voicemod_api_key_here
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
NEXT_PUBLIC_AZURE_SPEECH_KEY=your_azure_speech_key_here
NEXT_PUBLIC_AZURE_SPEECH_REGION=your_azure_region_here
```

### 2. 获取 API 密钥

#### Voicemod API

- 访问：https://developer.voicemod.net/
- 注册开发者账户
- 获取 API 密钥
- 支持：性别转换、年龄转换、特效音

#### ElevenLabs API

- 访问：https://elevenlabs.io/
- 注册账户
- 获取 API 密钥
- 支持：高质量 TTS、语音克隆

#### Azure Cognitive Services

- 访问：https://azure.microsoft.com/services/cognitive-services/speech-services/
- 创建 Azure 账户
- 创建 Speech Service
- 获取密钥和区域

### 3. 调试和故障排除

#### 检查 API 状态

打开浏览器控制台，查看 API 密钥状态：

```
🔑 API Key Status:
Voicemod API Key: ✅ Available / ❌ Missing
ElevenLabs API Key: ✅ Available / ❌ Missing
Azure Speech Key: ✅ Available / ❌ Missing
```

#### 常见问题

**问题**：所有 API 显示 "❌ Missing"
**解决**：

1. 确保 `.env.local` 文件存在
2. 重启开发服务器：`npm run dev`
3. 检查环境变量名称是否正确

**问题**：API 连接失败
**解决**：

1. 检查 API 密钥是否正确
2. 检查网络连接
3. 查看控制台错误信息

**问题**：只有本地处理工作
**解决**：

1. 配置 API 密钥
2. 本地处理是备用方案，效果有限

### 4. 效果对比

| 处理方式           | 质量       | 性别转换 | 设置难度 | 成本 |
| ------------------ | ---------- | -------- | -------- | ---- |
| **Voicemod API**   | ⭐⭐⭐⭐⭐ | ✅ 完美  | 中等     | 付费 |
| **ElevenLabs API** | ⭐⭐⭐⭐   | ✅ 优秀  | 简单     | 付费 |
| **Azure Speech**   | ⭐⭐⭐⭐   | ✅ 优秀  | 中等     | 付费 |
| **本地处理**       | ⭐⭐       | ❌ 有限  | 简单     | 免费 |

### 5. 快速测试

1. 配置 API 密钥
2. 重启服务器
3. 访问 `/voice` 页面
4. 录制音频
5. 测试不同 API 效果

### 6. 当前状态

- ✅ 本地处理：工作正常，效果有限
- ❌ Voicemod API：需要 API 密钥
- ❌ ElevenLabs API：需要 API 密钥
- ❌ Azure Speech：需要 API 密钥

**下一步**：配置 API 密钥以获得专业级变声效果！

## 🔍 问题诊断完成！

### **❌ 根本原因**

外部 API 效果差是因为**缺少 API 密钥配置**！

### ** 解决方案**

#### **1. 当前状态**

- ✅ **本地处理**：工作正常，但效果有限（只有音调变换和滤波）
- ❌ **Voicemod API**：未配置 API 密钥
- ❌ **ElevenLabs API**：未配置 API 密钥
- ❌ **Azure Speech**：未配置 API 密钥

#### **2. 调试信息已添加**

- **API 密钥状态检查**：控制台会显示每个 API 的可用状态
- ⚠️ **页面警告**：如果没有 API 密钥，页面会显示警告信息
- 📊 **详细错误信息**：处理失败时会显示具体原因

#### **3. 配置步骤**

**步骤 1：创建环境变量文件**

```bash
# 在项目根目录创建 .env.local 文件
NEXT_PUBLIC_VOICEMOD_API_KEY=your_voicemod_api_key_here
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
NEXT_PUBLIC_AZURE_SPEECH_KEY=your_azure_speech_key_here
NEXT_PUBLIC_AZURE_SPEECH_REGION=your_azure_region_here
```

**步骤 2：获取 API 密钥**

- **Voicemod**：https://developer.voicemod.net/ （推荐，支持真正的性别转换）
- **ElevenLabs**：https://elevenlabs.io/
- **Azure**：https://azure.microsoft.com/services/cognitive-services/

**步骤 3：重启服务器**

```bash
npm run dev
```

#### **4. 效果对比**

| 处理方式           | 性别转换 | 音质       | 设置难度 | 成本 |
| ------------------ | -------- | ---------- | -------- | ---- |
| **Voicemod API**   | ✅ 完美  | ⭐⭐⭐⭐⭐ | 中等     | 💰   |
| **ElevenLabs API** | ✅ 优秀  | ⭐⭐⭐⭐⭐ | 简单     | 💰💰 |
| **Azure Speech**   | ✅ 优秀  | ⭐⭐⭐⭐   | 中等     | 💰   |
| **本地处理**       | ❌ 有限  | ⭐⭐⭐     | 简单     | 免费 |

### ** 立即行动**

1. **检查控制台**：打开浏览器控制台，查看 API 密钥状态
2. **配置 API 密钥**：按照 `VOICE_API_SETUP.md` 的说明
3. **测试效果**：配置完成后测试专业级变声效果

**现在请打开浏览器控制台，告诉我你看到的 API 密钥状态信息！**
