<p align="center">
  <h1 align="center"><img src="./icon.png" width="48" style="vertical-align:middle" alt="logo"> Karaoke Lyrics Maker</h1>
  <p align="center">跨平台卡拉OK歌词制作软件 | 跨平台卡拉OK歌詞製作軟體 | クロスプラットフォームカラオケ歌詞作成ソフト</p>
  <p align="center">
    <a href="./README.md">简体中文</a> | <a href="./docs/translations/README.en.md">English</a> | <a href="./docs/translations/README.zh-TW.md">繁體中文</a> | <a href="./docs/translations/README.ja.md">日本語</a>
  </p>
</p>

---

## ✨ 功能特性

- **媒体导入** — 支持 MP4/MKV/MOV/AVI/FLV 视频和 MP3/WAV/FLAC/AAC/OGG 音频
- **歌词输入** — 手动输入、粘贴文本、导入 LRC/SRT/ASS 字幕文件
- **按键打轴** — 播放音频时通过按键（空格/自定义）标记每个字的起止时间
- **逐字扫色** — 实时预览歌词逐字填充动画（双色渐变、多种扫色方向）
- **读音标注** — 汉字上方显示拼音，日文汉字上方显示假名，支持自动标注与手动编辑
- **样式编辑** — 字体、颜色、描边、阴影、发光、渐变等文字效果，5个内置预设
- **时间微调** — 波形图辅助精确定位，拖拽调整时间点，波形峰值吸附
- **项目工程** — 保存/加载项目文件（.klproj），包含所有编辑数据
- **导出成品** — 渲染带歌词的视频、导出 LRC 文件、逐字时间戳 JSON、ASS 字幕
- **跨平台** — Windows / macOS / Linux 原生体验
- **多语言界面** — 简体中文、繁體中文、日本語、English
- **轻量高效** — 安装包 < 30MB，内存占用 < 200MB，60fps 流畅渲染

## 📸 界面预览

![界面预览](./docs/assets/screenshot-00.png)

## 🚀 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/) 1.70+
- [FFmpeg](https://ffmpeg.org/)（仅视频导出需要）

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/karaoke-lyrics-maker.git
cd karaoke-lyrics-maker

# 安装前端依赖
npm install

# 启动开发模式
npm run tauri dev
```

### 构建

```bash
# 构建生产版本
npm run tauri build
```

构建产物位于 `src-tauri/target/release/bundle/`。

### macOS 安全提示

macOS 用户首次打开应用时会遇到"无法打开"的安全提示，按以下步骤解决：

1. 双击 `.dmg` 安装，拖拽应用到 Applications 文件夹
2. 首次打开时会弹出"无法打开，因为无法验证开发者"
3. 打开 **系统设置 → 隐私与安全性**，底部会显示被阻止的应用
4. 点击 **"仍要打开"**
5. 再次确认 **"打开"**
6. 之后可正常使用，无需重复操作

## 📖 使用指南

### 基本工作流

1. **导入媒体** — 拖拽或点击导入视频/音频文件
2. **输入歌词** — 粘贴歌词文本或导入 LRC/SRT/ASS 文件
3. **按键打轴** — 按 F2 进入打轴模式，播放音频时按空格键逐字标记时间
4. **微调时间** — 在时间线上拖拽标记调整时间点
5. **编辑样式** — 选择预设或自定义字体、颜色、描边等效果
6. **导出成品** — 导出为视频（需 FFmpeg）、LRC、JSON 或 ASS 文件

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Space` | 播放/暂停 / 打轴标记 |
| `Esc` | 暂停播放 |
| `Backspace` | 撤销上一个标记 |
| `F2` | 进入/退出打轴模式 |
| `F3` | 标记间奏行（跳过） |
| `←` / `→` | 微调 100ms |
| `Ctrl+S` | 保存项目 |
| `Ctrl+O` | 打开文件 |
| `Ctrl+E` | 打开导出对话框 |
| `Ctrl+,` | 打开设置 |

### 打轴模式

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| 实时打轴 | 播放中逐字按键标记 | 通用，最常用 |
| Tap 打轴 | 按节奏匀速按键，系统自动分配 | 节奏感强的歌曲 |
| 句级打轴 | 标记每句起止时间，句内均匀分配 | 快速出粗稿 |

## 🏗️ 技术架构

| 层级 | 技术 |
|------|------|
| 框架 | Tauri 2.x（Rust 后端 + WebView 前端） |
| 前端 | React 18 + TypeScript + Vite |
| 状态管理 | Zustand |
| 样式 | Tailwind CSS |
| 渲染 | Canvas API（歌词扫色动画） |
| 音频 | Web Audio API（精确计时） + Symphonia（波形生成） |
| 视频导出 | FFmpeg（ASS 字幕滤镜） |
| 国际化 | react-i18next（4 语言） |

### 项目结构

```
src/                          # 前端源码
├── components/               # React 组件
│   ├── layout/              #   布局（MenuBar, MainLayout, StatusBar）
│   ├── media/               #   媒体（VideoPlayer, PlaybackControls）
│   ├── lyrics/              #   歌词（LyricTextEditor, LyricsOverlay）
│   ├── timeline/            #   时间线（TimelinePanel, WaveformDisplay）
│   ├── style/               #   样式（StylePanel, ColorPicker）
│   ├── pronunciation/       #   注音（PronunciationPanel）
│   ├── export/              #   导出（ExportDialog）
│   └── settings/            #   设置（SettingsDialog）
├── engine/                   # 渲染引擎
│   ├── CanvasRenderer.ts   #   Canvas 渲染器（扫色/阴影/发光）
│   ├── TimingEngine.ts     #   打轴引擎（状态机）
│   ├── PlaybackClock.ts    #   精确时钟（双锚点）
│   └── TextLayout.ts       #   文字排版
├── store/                   # Zustand 状态管理
├── services/                # 业务服务
├── i18n/                    # 国际化（en/zh-CN/zh-TW/ja-JP）
└── types/                   # TypeScript 类型定义

src-tauri/                    # Rust 后端
├── src/
│   ├── commands/            #   Tauri IPC 命令
│   ├── engine/              #   核心引擎
│   │   ├── media/          #     媒体探测/波形生成
│   │   ├── export/         #     LRC/JSON/ASS/视频导出
│   │   └── pronunciation/  #     拼音词典
│   └── menu.rs             #   macOS 原生菜单
└── capabilities/            # Tauri 权限配置

docs/                         # 开发文档（本地私有）
```

## 🌍 国际化

应用支持以下语言：

| 语言 | 代码 | 状态 |
|------|------|------|
| 简体中文 | zh-CN | ✅ 完整 |
| 繁體中文 | zh-TW | ✅ 完整 |
| 日本語 | ja-JP | ✅ 完整 |
| English | en | ✅ 完整 |

语言可在设置中切换，macOS 原生菜单栏也会同步更新。

## 📋 导出格式

| 格式 | 说明 |
|------|------|
| LRC | 标准歌词文件（行级时间） |
| 增强 LRC | 含逐字时间标签 |
| JSON | 逐字时间戳 + 注音数据 |
| ASS | 字幕文件（卡拉OK扫色效果） |
| 视频 | 带歌词叠加的 MP4（需 FFmpeg） |

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

提交 PR 后，CI 会自动运行以下检查：

- **TypeScript 编译检查** — 确保前端代码类型正确
- **Rust 编译检查** — 确保后端代码编译通过
- **Rust 测试** — 确保现有功能不受影响

请确保所有 CI 检查通过后再请求 review。

## 📄 许可证

本项目采用 [MIT 许可证](./LICENSE)。

## 🙏 致谢

- [Tauri](https://tauri.app/) — 跨平台桌面应用框架
- [Symphonia](https://github.com/pdeljanov/Symphonia) — Rust 音频解码库
- [CC-CEDICT](https://cc-cedict.org/wiki/) — 中文词典
- [JMDict](https://www.edrdg.org/jmdict/j_jmdict.html) — 日文词典
