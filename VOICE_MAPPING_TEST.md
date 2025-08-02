# Voice Mapping 测试文档

## 🎤 问题描述
之前所有Profile Bubble中的用户都使用同样的AI Voice（Aria - 9BWtsMINqrJLrRacOk9x），导致不同用户的声音听起来都一样。

## ✅ 解决方案
创建了voice映射系统，为不同用户分配不同的AI Voice。

## 🗺️ Voice映射表

| 用户Voice名称 | ElevenLabs Voice ID | Voice名称 | 特点 |
|--------------|-------------------|-----------|------|
| elevenlabs-aria | 9BWtsMINqrJLrRacOk9x | Aria | 女性，温暖 |
| elevenlabs-domi | AZnzlk1XvdvUeBnXmlld | Domi | 女性，充满活力 |
| elevenlabs-bella | EXAVITQu4vr4xnSDxMaL | Bella | 女性，柔和 |
| elevenlabs-echo | 21m00Tcm4TlvDq8ikWAM | Echo | 男性，深沉 |
| elevenlabs-onyx | pNInz6obpgDQGcFmaJgB | Onyx | 男性，严肃 |
| elevenlabs-nova | piTKgcLEGmPE4e6mEKli | Nova | 女性，清晰 |
| elevenlabs-shimmer | VR6AewLTigWG4xSOukaG | Shimmer | 女性，明亮 |
| elevenlabs-cyber | 2EiwWnXFnvU5JabPnv8n | Cyber | 男性，机器人风格 |
| elevenlabs-cosmo | oWAxZDx7w5VEj9dCyTzz | Cosmo | 男性，友好 |
| elevenlabs-scarlet | wViIeQp4X7XZg8fAllTk | Scarlet | 女性，热情 |

## 👥 用户Voice分配

### 当前用户配置（来自mockUsers.ts）：
1. **Sarah** - `elevenlabs-aria` → Aria (女性，温暖)
2. **Alex** - `elevenlabs-domi` → Domi (女性，充满活力)  
3. **Maya** - `elevenlabs-bella` → Bella (女性，柔和)
4. **Jordan** - `elevenlabs-echo` → Echo (男性，深沉)

## 🔧 技术实现

### 1. Voice映射函数
```typescript
// utils/voiceUtils.ts
export const getVoiceId = (userVoice: string): string => {
  return VOICE_MAPPING[userVoice] || "9BWtsMINqrJLrRacOk9x"; // Default to Aria
};

export const playUserVoice = async (
  text: string,
  userVoice: string
): Promise<void> => {
  const voiceId = getVoiceId(userVoice);
  console.log(`🎤 Playing voice for ${userVoice} using voice ID: ${voiceId}`);
  await speakWithElevenLabs(text, voiceId);
};
```

### 2. 更新的playVoiceIntro函数
```typescript
// pages/app.tsx
const playVoiceIntro = async (
  voiceUrl: string | null | undefined, 
  text?: string, 
  user?: UserProfile
) => {
  // 使用用户的voice偏好
  if (text && user) {
    await playUserVoice(text, user.voice);
  }
  // ...
};
```

## 🧪 测试步骤

### 1. 访问应用
- 打开 `http://localhost:3000/app`
- 确保开发服务器正在运行

### 2. 测试不同用户的Voice
- 浏览不同的Profile Bubble
- 点击每个用户的"🎵 Play Voice Intro"按钮
- 点击每个用户的"🎵 Play Mood Voice"按钮
- 观察控制台日志，确认使用了不同的voice ID

### 3. 验证Voice差异
- Sarah应该使用Aria voice (9BWtsMINqrJLrRacOk9x)
- Alex应该使用Domi voice (AZnzlk1XvdvUeBnXmlld)
- Maya应该使用Bella voice (EXAVITQu4vr4xnSDxMaL)
- Jordan应该使用Echo voice (21m00Tcm4TlvDq8ikWAM)

## 📊 预期结果

### 控制台日志示例：
```
🎤 Playing voice for elevenlabs-aria using voice ID: 9BWtsMINqrJLrRacOk9x
🎤 Playing voice for elevenlabs-domi using voice ID: AZnzlk1XvdvUeBnXmlld
🎤 Playing voice for elevenlabs-bella using voice ID: EXAVITQu4vr4xnSDxMaL
🎤 Playing voice for elevenlabs-echo using voice ID: 21m00Tcm4TlvDq8ikWAM
```

### 听觉差异：
- 每个用户应该有独特的声音特征
- Sarah: 温暖、友好的女性声音
- Alex: 充满活力、年轻的女性声音
- Maya: 柔和、艺术感的女性声音
- Jordan: 深沉、专业的男性声音

## ⚠️ 注意事项

### ElevenLabs API配额
- 当前API配额已超限（116 credits remaining）
- 可能需要等待配额重置或升级账户
- 可以测试voice映射逻辑，但可能无法听到实际声音

### 后备方案
- 如果ElevenLabs API失败，会回退到浏览器语音合成
- 浏览器语音合成可能无法区分不同用户的声音

## 🚀 后续改进

1. **添加更多Voice选项**
   - 为每个用户提供更多voice选择
   - 允许用户在设置中更改voice

2. **Voice个性化**
   - 根据用户角色和性格选择更合适的voice
   - 添加voice预览功能

3. **性能优化**
   - 缓存生成的语音文件
   - 预加载常用voice

4. **错误处理**
   - 更好的API错误处理
   - 用户友好的错误提示

---

*这个voice映射系统确保了每个Profile Bubble中的用户都有独特的声音特征，提升了用户体验的真实感和个性化。* 