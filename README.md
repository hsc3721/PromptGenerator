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

## 📁 项目结构

```
project/
├── src/
│   ├── components/           # React 组件
│   │   ├── PromptEditor.tsx  # 提示词编辑器
│   │   ├── TemplateLibrary.tsx # 模板库
│   │   ├── TemplateManager.tsx # 模板管理
│   │   ├── PromptPreview.tsx    # 提示词预览
│   │   └── InspirationPanel.tsx # 灵感面板
│   ├── db.ts                 # Dexie 数据库配置
│   ├── store.ts              # Zustand 状态管理
│   ├── App.tsx               # 主应用组件
│   ├── App.css               # 应用样式
│   ├── index.css             # 全局样式
│   └── main.tsx              # 入口文件
├── index.html                # HTML 模板
├── package.json              # 项目依赖
├── tsconfig.json             # TypeScript 配置
├── vite.config.ts            # Vite 配置
├── tailwind.config.js        # Tailwind CSS 配置
└── postcss.config.js         # PostCSS 配置
```

## 🛠️ 技术栈

- **框架**：React 18
- **言语**：TypeScript
- **构建工具**：Vite
- **样式**：Tailwind CSS
- **状态管理**：Zustand
- **数据库**：Dexie (IndexedDB)

## 💾 数据存储

所有的提示词模板都保存在浏览器的 IndexedDB 中，**完全本地存储**，不上传到服务器。

### 数据库结构

**Prompts 表**
```
{
  id: string,
  name: string,                    // 模板名称
  category: string,                 // 分类（portrait/scene/style/other）
  attributes: Record<string, any>,  // 属性对象
  template: string,                 // 提示词模板
  finalPrompt: string,              // 最终生成的提示词
  tags: string[],                   // 标签数组
  createdAt: string,                // 创建时间
  updatedAt: string                 // 更新时间
}
```

## 📖 使用指南

### 基础工作流

1. **编辑属性**
   - 在左侧编辑栏中填写或修改属性（主体、服装、发型等）
   - 实时预览会自动更新最终提示词

2. **浏览灵感**
   - 右侧灵感面板提供每个属性的建议
   - 点击建议可快速应用到当前编辑的属性

3. **自定义模板**
   - 编辑"提示词模板"文本框
   - 使用 `{attribute_name}` 格式插入属性
   - 模板会实时生成最终提示词

4. **保存模板**
   - 点击"💾 保存为模板"按钮
   - 输入模板名称和分类
   - 添加标签便于后续搜索

5. **管理模板**
   - 在"📚 模板库"标签页查看所有保存的模板
   - 使用搜索和分类过滤
   - 点击模板卡片查看详情

6. **导出数据**
   - 在"⚙️ 管理"标签页中选择导出格式
   - 支持 JSON 和 CSV 两种格式
   - 方便备份或在其他设备中导入

## 🎯 功能示例

### 示例：生成美女写真提示词

1. **设置属性**
   ```
   Subject: A beautiful woman
   Clothing Type: dress
   Clothing Color: red
   Clothing Style: elegant
   Hairstyle: long wavy hair
   Makeup: professional makeup
   Pose: standing pose
   Background: studio background
   Lighting: soft lighting
   Quality: 8k, ultra-detailed, masterpiece
   ```

2. **最终生成**
   ```
   A beautiful woman, wearing elegant red dress, long wavy hair, 
   professional makeup, standing pose, studio background, 
   soft lighting, 8k, ultra-detailed, masterpiece
   ```

3. **保存使用**
   - 复制提示词到 AI 绘画工具
   - 保存为模板便于后续使用
   - 修改单个属性生成变体

## 💡 高级技巧

### 批量生成变体
1. 保存基础模板
2. 修改单个属性（如衣服颜色）
3. 复制新的提示词
4. 重复步骤2-3生成不同变体

### 自定义灵感库
编辑 `src/db.ts` 中的 `initializeInspirations` 函数来添加自己的建议

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
