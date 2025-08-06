#!/bin/bash

echo "🔍 本地开发环境配置检查"
echo "=========================="

# 检查 .env.local 文件
echo ""
echo "1️⃣ 检查环境变量文件..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local 文件存在"
    
    # 检查API密钥（不显示具体内容）
    if grep -q "ELEVENLABS_API_KEY=sk_" .env.local 2>/dev/null; then
        echo "✅ ElevenLabs API密钥已配置"
    elif grep -q "ELEVENLABS_API_KEY=" .env.local 2>/dev/null; then
        echo "⚠️  ElevenLabs API密钥存在但可能格式不正确"
    else
        echo "❌ ElevenLabs API密钥未配置"
    fi
    
    if grep -q "OPENAI_API_KEY=sk-" .env.local 2>/dev/null; then
        echo "✅ OpenAI API密钥已配置"
    elif grep -q "OPENAI_API_KEY=" .env.local 2>/dev/null; then
        echo "⚠️  OpenAI API密钥存在但可能格式不正确"
    else
        echo "❌ OpenAI API密钥未配置"
    fi
else
    echo "❌ .env.local 文件不存在"
    echo "请运行: cp env.example .env.local"
fi

# 检查 .gitignore
echo ""
echo "2️⃣ 检查Git安全配置..."
if grep -q ".env.local" .gitignore; then
    echo "✅ .env.local 已被 .gitignore 保护"
else
    echo "⚠️  .env.local 未被 .gitignore 保护"
fi

# 检查开发服务器
echo ""
echo "3️⃣ 检查开发服务器状态..."
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ 开发服务器运行在 http://localhost:3001"
elif curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 开发服务器运行在 http://localhost:3000"
else
    echo "❌ 开发服务器未运行"
    echo "请运行: npm run dev"
fi

echo ""
echo "🔒 安全检查完成!"
echo ""
echo "💡 如果API密钥配置有问题，请："
echo "   1. 检查 .env.local 格式是否正确"
echo "   2. 确保API密钥有效且有足够配额"
echo "   3. 重启开发服务器: npm run dev"