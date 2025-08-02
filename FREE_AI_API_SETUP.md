# 免费AI API设置指南

## 🆓 免费AI API选项

### 选择1：OpenAI API（推荐）

- **免费额度**：每月$5免费额度
- **注册**：https://platform.openai.com/api-keys
- **步骤**：
  1. 注册OpenAI账户
  2. 创建API密钥
  3. 配置环境变量

### 选择2：Hugging Face Inference API（完全免费）

- **免费额度**：每月30,000次请求
- **注册**：https://huggingface.co/settings/tokens
- **步骤**：
  1. 注册Hugging Face账户
  2. 创建Access Token
  3. 配置环境变量

## 🔧 配置步骤

### 方法1：使用OpenAI API

```bash
# 创建环境变量文件
echo "NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here" > .env.local

# 重启服务器
npm run dev
```

### 方法2：使用Hugging Face API

```bash
# 创建环境变量文件
echo "NEXT_PUBLIC_HUGGINGFACE_API_KEY=your_huggingface_token_here" > .env.local

# 重启服务器
npm run dev
```

### 方法3：同时配置两个API（推荐）

```bash
# 创建环境变量文件
cat > .env.local << EOF
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_HUGGINGFACE_API_KEY=your_huggingface_token_here
EOF

# 重启服务器
npm run dev
```

## 🎯 API优先级

系统会按以下顺序尝试API：

1. **OpenAI GPT-3.5-turbo**（如果配置了OpenAI密钥）
2. **Hugging Face DialoGPT**（如果OpenAI失败或未配置）
3. **错误提示**（如果所有API都不可用）

## 💡 推荐配置

**最佳选择**：同时配置两个API

- OpenAI作为主要API（质量更高）
- Hugging Face作为备用API（完全免费）

## 🚀 快速开始

1. **选择API**：推荐先尝试Hugging Face（完全免费）
2. **获取密钥**：按照上面的链接注册并获取密钥
3. **配置环境**：创建`.env.local`文件
4. **重启服务器**：`npm run dev`
5. **测试AI**：访问应用并测试聊天功能

## 🔍 故障排除

### 常见错误：

- `No AI APIs configured`：没有配置任何API密钥
- `OpenAI API error: 401`：OpenAI密钥无效
- `Hugging Face API error: 401`：Hugging Face令牌无效

### 解决方案：

1. 检查API密钥是否正确
2. 确认环境变量文件存在
3. 重启开发服务器
4. 查看浏览器控制台错误信息

---

**现在你可以免费使用AI聊天功能了！🤖✨**
