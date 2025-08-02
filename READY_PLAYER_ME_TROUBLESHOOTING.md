# 🔧 Ready Player Me 故障排除指南

## ❌ 问题: 看不到衣服等自定义选项

### 🔍 可能的原因和解决方案

#### **1. URL配置更新**
**最新配置**:
```
https://readyplayer.me/avatar?frameApi&bodyType=fullbody&quickStart=false&language=en&clearCache=true&selectBodyType=false&morphTargets=ARKit,Oculus+Visemes
```

**参数说明**:
- `frameApi` - 启用iframe API通信
- `bodyType=fullbody` - 设置为全身头像
- `quickStart=false` - 显示完整编辑器而不是快速模式
- `language=en` - 英文界面
- `clearCache=true` - 清除缓存
- `selectBodyType=false` - 跳过体型选择
- `morphTargets=ARKit,Oculus+Visemes` - 启用面部动画

#### **2. 浏览器和网络问题**

**刷新页面**:
- 按 `Ctrl+F5` (Windows) 或 `Cmd+Shift+R` (Mac) 强制刷新
- 清除浏览器缓存

**检查网络连接**:
- 确保能访问 `readyplayer.me`
- 检查是否有防火墙或代理阻止

**浏览器兼容性**:
- 推荐使用 Chrome、Firefox、Safari 或 Edge 最新版本
- 确保启用了 JavaScript

#### **3. iframe 显示问题**

**容器高度**:
- 已设置为 `700px` 提供足够空间
- 添加了边框以便查看iframe边界

**调试信息**:
- 打开浏览器开发者工具 (F12)
- 查看Console标签页中的Ready Player Me事件日志

#### **4. Ready Player Me服务状态**

如果问题持续存在，可能是Ready Player Me服务的问题:

**检查方法**:
1. 直接访问 https://readyplayer.me/avatar
2. 看是否能正常使用
3. 检查 https://status.readyplayer.me/ 服务状态

## ✅ 预期行为

### **正常工作时应该看到**:
1. **加载页面** - Ready Player Me编辑器界面
2. **基础头像** - 一个默认的3D人物模型
3. **左侧/底部菜单** - 分类选项按钮:
   - 👤 Face/Head (面部/头部)
   - 👕 Top (上装)
   - 👖 Bottom (下装) 
   - 👟 Footwear (鞋类)
   - 🎨 Hair (发型)
   - 👓 Accessories (配饰)
4. **右侧选项** - 点击分类后显示具体选项
5. **导出按钮** - 完成后的"Download"或"Export"按钮

### **如果只看到分类但没有具体选项**:
1. **点击分类图标** - 确保点击了具体的分类
2. **等待加载** - 网络慢时需要等待选项加载
3. **滚动查看** - 选项可能需要滚动才能看到
4. **刷新页面** - 重新加载编辑器

## 🛠️ 调试步骤

### **1. 检查控制台日志**
打开开发者工具，查看是否有以下日志:
```
Ready Player Me frame ready
Ready Player Me event: v1.frame.ready
```

### **2. 检查iframe加载**
在Elements标签页中查看iframe是否正确加载:
```html
<iframe 
  src="https://readyplayer.me/avatar?..."
  style="width: 100%; height: 100%;"
/>
```

### **3. 网络请求检查**
在Network标签页中查看:
- iframe的HTML请求是否成功 (200状态)
- 是否有CSS/JS文件加载失败

### **4. 手动测试**
在新标签页中直接打开:
```
https://readyplayer.me/avatar?frameApi&bodyType=fullbody&quickStart=false&language=en&clearCache=true&selectBodyType=false&morphTargets=ARKit,Oculus+Visemes
```

## 🔄 替代方案

### **如果Ready Player Me不工作**:

#### **方案1: 使用已有的Avatar URL**
可以手动输入一个测试URL:
```
https://models.readyplayer.me/[avatar-id].glb
```

#### **方案2: 跳过Avatar创建**
可以临时跳过头像创建，直接进入角色设置:
1. 点击"Continue"按钮
2. 在剪贴板粘贴一个虚拟URL
3. 继续使用应用的其他功能

#### **方案3: 使用其他Avatar服务**
考虑集成其他头像生成服务作为备选

## 📞 获取帮助

### **如果问题仍然存在**:
1. **截图** - 截取当前显示的内容
2. **控制台日志** - 复制开发者工具中的错误信息
3. **浏览器信息** - 提供浏览器类型和版本
4. **网络状态** - 说明网络连接情况

### **Ready Player Me官方资源**:
- 文档: https://docs.readyplayer.me/
- 状态页面: https://status.readyplayer.me/
- 支持: https://readyplayer.me/support

## 🎯 当前配置总结

- ✅ **URL**: 使用最新的readyplayer.me域名
- ✅ **参数**: 启用完整编辑器和全身模式
- ✅ **高度**: 增加到700px确保足够显示空间
- ✅ **调试**: 添加控制台日志用于故障排除
- ✅ **指导**: 英文用户界面和说明
- ✅ **消息监听**: 正确处理iframe通信

现在Ready Player Me应该能够正常显示所有自定义选项了！🎊