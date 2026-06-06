<p align="center">
  <h1 align="center"><img src="../../icon.png" width="48" style="vertical-align:middle" alt="logo"> Karaoke Lyrics Maker</h1>
  <p align="center">跨平台卡拉OK歌詞製作軟體</p>
  <p align="center">
    <a href="../../README.md">简体中文</a> | <a href="./README.en.md">English</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ja.md">日本語</a>
  </p>
</p>

---

## ✨ 功能特色

- **媒體匯入** — 支援 MP4/MKV/MOV/AVI/FLV 影片和 MP3/WAV/FLAC/AAC/OGG 音訊
- **歌詞輸入** — 手動輸入、貼上文字、匯入 LRC/SRT/ASS 字幕檔案
- **按鍵打軸** — 播放音訊時透過按鍵（空格/自訂）標記每個字的起止時間
- **逐字掃色** — 即時預覽歌詞逐字填色動畫（雙色漸層、多種掃色方向）
- **讀音標註** — 漢字上方顯示拼音，日文漢字上方顯示假名，支援自動標註與手動編輯
- **樣式編輯** — 字型、顏色、描邊、陰影、發光、漸層等文字效果，5個內建預設
- **時間微調** — 波形圖輔助精確定位，拖曳調整時間點，波形峰值吸附
- **專案工程** — 儲存/載入專案檔（.klproj），包含所有編輯資料
- **匯出成品** — 渲染帶歌詞的影片、匯出 LRC 檔案、逐字時間戳 JSON、ASS 字幕
- **跨平台** — Windows / macOS / Linux 原生體驗
- **多語言介面** — 简体中文、繁體中文、日本語、English
- **輕量高效** — 安裝包 < 30MB，記憶體佔用 < 200MB，60fps 流暢渲染

## 📸 介面預覽

![介面預覽](../assets/screenshot-00.png)

## 🚀 快速開始

### 環境要求

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/) 1.70+
- [FFmpeg](https://ffmpeg.org/)（僅影片匯出需要）

### 安裝

```bash
# 克隆倉庫
git clone https://github.com/your-username/karaoke-lyrics-maker.git
cd karaoke-lyrics-maker

# 安裝前端依賴
npm install

# 啟動開發模式
npm run tauri dev
```

### 建置

```bash
# 建置生產版本
npm run tauri build
```

建置產物位於 `src-tauri/target/release/bundle/`。

### macOS 安全提示

macOS 使用者首次打開應用程式時會遇到「無法打開」的安全提示，按以下步驟解決：

1. 雙擊 `.dmg` 安裝，拖曳應用到 Applications 資料夾
2. 首次打開時會彈出「無法打開，因為無法驗證開發者」
3. 打開 **系統設定 → 隱私與安全性**，底部會顯示被封鎖的應用
4. 點擊 **「仍要打開」**
5. 再次確認 **「打開」**
6. 之後可正常使用，無需重複操作

## 📖 使用指南

### 基本工作流程

1. **匯入媒體** — 拖曳或點擊匯入影片/音訊檔案
2. **輸入歌詞** — 貼上歌詞文字或匯入 LRC/SRT/ASS 檔案
3. **按鍵打軸** — 按 F2 進入打軸模式，播放音訊時按空白鍵逐字標記時間
4. **微調時間** — 在時間軸上拖曳標記調整時間點
5. **編輯樣式** — 選擇預設或自訂字型、顏色、描邊等效果
6. **匯出成品** — 匯出為影片（需 FFmpeg）、LRC、JSON 或 ASS 檔案

### 快速鍵

| 快速鍵 | 功能 |
|--------|------|
| `Space` | 播放/暫停 / 打軸標記 |
| `Esc` | 暫停播放 |
| `Backspace` | 復原上一個標記 |
| `F2` | 進入/退出打軸模式 |
| `F3` | 標記間奏行（跳過） |
| `←` / `→` | 微調 100ms |
| `Ctrl+S` | 儲存專案 |
| `Ctrl+O` | 開啟檔案 |
| `Ctrl+E` | 開啟匯出對話框 |
| `Ctrl+,` | 開啟設定 |

### 打軸模式

| 模式 | 說明 | 適用場景 |
|------|------|----------|
| 即時打軸 | 播放中逐字按鍵標記 | 通用，最常用 |
| Tap 打軸 | 按節奏勻速按鍵，系統自動分配 | 節奏感強的歌曲 |
| 句級打軸 | 標記每句起止時間，句內均勻分配 | 快速出草稿 |

## 🏗️ 技術架構

| 層級 | 技術 |
|------|------|
| 框架 | Tauri 2.x（Rust 後端 + WebView 前端） |
| 前端 | React 18 + TypeScript + Vite |
| 狀態管理 | Zustand |
| 樣式 | Tailwind CSS |
| 渲染 | Canvas API（歌詞掃色動畫） |
| 音訊 | Web Audio API（精確計時） + Symphonia（波形生成） |
| 影片匯出 | FFmpeg（ASS 字幕濾鏡） |
| 國際化 | react-i18next（4 語言） |

### 專案結構

```
src/                          # 前端原始碼
├── components/               # React 元件
│   ├── layout/              #   佈局（MenuBar, MainLayout, StatusBar）
│   ├── media/               #   媒體（VideoPlayer, PlaybackControls）
│   ├── lyrics/              #   歌詞（LyricTextEditor, LyricsOverlay）
│   ├── timeline/            #   時間軸（TimelinePanel, WaveformDisplay）
│   ├── style/               #   樣式（StylePanel, ColorPicker）
│   ├── pronunciation/       #   注音（PronunciationPanel）
│   ├── export/              #   匯出（ExportDialog）
│   └── settings/            #   設定（SettingsDialog）
├── engine/                   # 渲染引擎
│   ├── CanvasRenderer.ts   #   Canvas 渲染器（掃色/陰影/發光）
│   ├── TimingEngine.ts     #   打軸引擎（狀態機）
│   ├── PlaybackClock.ts    #   精確時鐘（雙錨點）
│   └── TextLayout.ts       #   文字排版
├── store/                   # Zustand 狀態管理
├── services/                # 業務服務
├── i18n/                    # 國際化（en/zh-CN/zh-TW/ja-JP）
└── types/                   # TypeScript 型別定義

src-tauri/                    # Rust 後端
├── src/
│   ├── commands/            #   Tauri IPC 命令
│   ├── engine/              #   核心引擎
│   │   ├── media/          #     媒體探測/波形生成
│   │   ├── export/         #     LRC/JSON/ASS/影片匯出
│   │   └── pronunciation/  #     拼音辭典
│   └── menu.rs             #   macOS 原生選單
└── capabilities/            # Tauri 權限設定

docs/                         # 開發文件（本地私有）
```

## 🌍 國際化

應用程式支援以下語言：

| 語言 | 代碼 | 狀態 |
|------|------|------|
| 簡體中文 | zh-CN | ✅ 完整 |
| 繁體中文 | zh-TW | ✅ 完整 |
| 日本語 | ja-JP | ✅ 完整 |
| English | en | ✅ 完整 |

語言可在設定中切換，macOS 原生選單列也會同步更新。

## 📋 匯出格式

| 格式 | 說明 |
|------|------|
| LRC | 標準歌詞檔案（行級時間） |
| 增強 LRC | 含逐字時間標籤 |
| JSON | 逐字時間戳 + 注音資料 |
| ASS | 字幕檔案（卡拉OK掃色效果） |
| 影片 | 帶歌詞疊加的 MP4（需 FFmpeg） |

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

1. Fork 此倉庫
2. 建立特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 建立 Pull Request

## 📄 授權條款

本專案採用 [MIT 授權條款](./LICENSE)。

## 🙏 致謝

- [Tauri](https://tauri.app/) — 跨平台桌面應用框架
- [Symphonia](https://github.com/pdeljanov/Symphonia) — Rust 音訊解碼庫
- [CC-CEDICT](https://cc-cedict.org/wiki/) — 中文辭典
- [JMDict](https://www.edrdg.org/jmdict/j_jmdict.html) — 日文辭典
