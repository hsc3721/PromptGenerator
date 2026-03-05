# 🎨 提示词生成器

一个轻量级的Web应用，帮助你快速生成和管理AI绘画提示词（Prompt）。
<img width="1328" height="514" alt="image" src="https://github.com/user-attachments/assets/4d4f95a3-4137-4a5a-bbd3-a5949b965e98" />
<img width="1273" height="677" alt="image" src="https://github.com/user-attachments/assets/3bad1db3-242b-4957-b2aa-08f857a2238d" />

## ✨ 主要功能

### 📝 **提示词编辑**
- 结构化的属性编辑表单
- 实时生成最终提示词
- 自定义提示词模板
- 实际应用中的灵感推荐

### 📚 **模板管理**
- 保存常用的提示词模板
- 按分类浏览模板
- 搜索和过滤功能
- 快速复制到剪贴板

### 💡 **灵感库**
- 预设的属性联想建议
- 帮助激发创意
- 快速应用建议到编辑器

### 📤 **导入导出**
- 导出为 JSON 格式
- 导出为 CSV 格式（Excel）
- 方便备份和分享

## 🚀 快速开始

### 前置要求
- Node.js 18+ 或更新版本
- npm 或 yarn 包管理器

### 安装步骤

1. **克隆或下载项目**
```bash
cd AI-Prompt-Generator
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

默认情况下，应用会在 `http://localhost:5173` 打开

### 构建生产版本
```bash
npm run build
```

生成的文件位于 `dist/` 目录

### 预览生产版本
```bash
npm run preview
```

### 导入之前的模板
1. 导出为 JSON
2. 修改 JSON 文件
3. 使用浏览器 DevTools 手动导入（或通过后续版本的导入功能）

## 🔄 后续功能规划

- [ ] 导入 JSON/CSV 模板
- [ ] AI 助手自动生成灵感建议（集成 LLM）
- [ ] 批量生成提示词
- [ ] 云同步（可选）
- [ ] 提示词对比分析
- [ ] 画廊模式展示提示词效果
- [ ] 社区分享模板

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 许可证

MIT License

## 🙏 致谢

感谢所有使用和支持这个项目的用户！

---

**需要帮助？**

- 📧 提交 Issue 报告问题
- 💬 讨论功能建议
- 🐛 报告 Bug

祝你创意无限！🚀
