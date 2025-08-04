# FFmpeg 安装指导 - Safari 语音兼容性

## 问题说明
Safari 浏览器录制的音频格式为 MP4/AAC，需要转换为 WAV 格式才能被 OpenAI Whisper API 正确处理。这需要安装 FFmpeg。

## 安装方法

### macOS
```bash
# 方法 1: 使用 Homebrew (推荐)
brew install ffmpeg

# 如果 Homebrew 有问题，先修复 Homebrew
brew doctor

# 方法 2: 直接下载二进制文件
# 访问 https://ffmpeg.org/download.html#build-mac
# 下载并解压到 /usr/local/bin/
```

### 验证安装
```bash
# 检查 FFmpeg 是否正确安装
which ffmpeg
ffmpeg -version

# 检查 AAC 解码器支持
ffmpeg -codecs | grep aac
```

期望输出应包含：
```
DEA.L. aac                  AAC (Advanced Audio Coding)
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install ffmpeg
```

### Windows
1. 下载 FFmpeg: https://ffmpeg.org/download.html#build-windows
2. 解压到 C:\ffmpeg
3. 添加 C:\ffmpeg\bin 到 PATH 环境变量

## 项目当前行为

### 当 FFmpeg 可用时：
- ✅ Safari MP4 → 自动转换为 WAV → OpenAI Whisper
- ✅ Chrome WebM → 直接发送到 OpenAI Whisper

### 当 FFmpeg 不可用时：
- ⚠️ 尝试直接发送 MP4 到 OpenAI（可能失败）
- 🛠️ 建议用户使用 Chrome/Firefox 或安装 FFmpeg

## 错误排查

### 常见错误 1: "Cannot find ffmpeg"
**解决方案：**
1. 确保 FFmpeg 已安装：`which ffmpeg`
2. 重启 Next.js 开发服务器
3. 检查 PATH 环境变量

### 常见错误 2: "FFmpeg conversion failed"
**解决方案：**
1. 检查 AAC 解码器支持：`ffmpeg -codecs | grep aac`
2. 如果缺失，重新安装完整版 FFmpeg
3. 查看服务器日志中的详细错误信息

### 常见错误 3: 权限问题
**解决方案：**
```bash
# macOS/Linux: 确保 /tmp 目录可写
ls -la /tmp
chmod 755 /tmp

# 或使用其他临时目录
export TMPDIR=~/temp
mkdir -p ~/temp
```

## 生产环境部署

### Vercel 部署
Vercel 不支持 FFmpeg。建议：
1. 使用其他支持 FFmpeg 的部署平台（如 Railway、Heroku）
2. 或在前端提示 Safari 用户使用 Chrome/Firefox

### Docker 部署
```dockerfile
FROM node:18-alpine
RUN apk add --no-cache ffmpeg
# ... 其他配置
```

### VPS/服务器部署
确保在服务器上安装 FFmpeg：
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# CentOS/RHEL
sudo yum install ffmpeg
```