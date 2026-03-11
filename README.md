<p align="center">
  <strong>◆ MarkMask 码印</strong>
</p>

<p align="center">
  纯前端图片安全工具 — 水印 & 马赛克 · 图片不离开你的设备
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0-6366f1" alt="version" />
  <img src="https://img.shields.io/badge/License-MIT-10b981" alt="license" />
  <img src="https://img.shields.io/badge/Privacy-100%25_Local-success" alt="privacy" />
</p>

---

## ✨ 特性

- 🛡️ **绝对隐私** — 所有图片处理在浏览器端完成，不上传任何服务器
- 🎨 **三种马赛克** — 像素化 / 高斯模糊 / 纯色遮挡，参数可调
- 💧 **水印系统** — 单点拖拽定位 / 满屏倾斜平铺，字体·颜色·透明度·角度·密度全部可调
- 📋 **剪贴板增强** — `Ctrl+V` 直接粘贴截图，一键复制处理后的图片
- ↩️ **撤销/重做** — `Ctrl+Z` / `Ctrl+Y`，最多 30 步历史
- 🌙 **暗色主题** — 现代 Glassmorphism UI

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

打开 `http://localhost:3000` 即可使用。

## 📸 使用方式

1. **导入图片** — 拖拽 / 粘贴 / 点击选择（支持 JPG / PNG / WebP，≤20MB）
2. **马赛克遮挡** — 切换到「马赛克」面板，选择样式，在图片上拖拽绘制遮挡区域
3. **添加水印** — 切换到「水印」面板，输入文字，选择单点或平铺模式
4. **导出** — 点击「下载图片」或「复制」到剪贴板

> 遮挡块可点击选中后 **移动、缩放**，按 `Delete` 删除。

## 🏗️ 技术栈

| 层面 | 技术 |
|------|------|
| 构建工具 | Vite 5.x |
| 语言 | Vanilla JavaScript (ES Module) |
| Canvas 引擎 | Fabric.js 5.x |
| 样式 | CSS Variables + Glassmorphism |
| 字体 | Inter + Noto Sans SC |

## 📁 项目结构

```
src/
├── main.js          # 入口，初始化所有模块
├── style.css        # 设计系统 & 全局样式
├── canvas.js        # Fabric.js Canvas 管理器
├── importer.js      # 图片导入（拖拽/粘贴/选择）
├── mask.js          # 马赛克遮挡引擎
├── watermark.js     # 水印渲染引擎
├── history.js       # 撤销/重做状态管理
├── exporter.js      # 导出下载/剪贴板
└── ui.js            # UI 控件绑定
```

## 🌐 浏览器支持

| 浏览器 | 支持 |
|--------|------|
| Chrome 90+ | ✅ |
| Edge 90+ | ✅ |
| Safari 15+ | ✅ |
| 移动端 | ⚠️ 降级提示 |

## 📄 License

MIT