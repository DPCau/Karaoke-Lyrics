<p align="center">
  <h1 align="center"><img src="../../icon.png" width="48" style="vertical-align:middle" alt="logo"> Karaoke Lyrics Maker</h1>
  <p align="center">Cross-Platform Karaoke Lyrics Creation Software</p>
  <p align="center">
    <a href="../../README.md">简体中文</a> | <a href="./README.en.md">English</a> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ja.md">日本語</a>
  </p>
</p>

---

## ✨ Features

- **Media Import** — Supports MP4/MKV/MOV/AVI/FLV video and MP3/WAV/FLAC/AAC/OGG audio
- **Lyrics Input** — Manual input, paste text, import LRC/SRT/ASS subtitle files
- **Key Timing** — Press a key (Space/customizable) to mark the start and end time of each word during playback
- **Character-by-Character Karaoke** — Real-time preview of per-character fill animation (dual-color gradient, multiple sweep directions)
- **Pronunciation Annotation** — Display Pinyin above Chinese characters, Kana above Japanese kanji, with automatic annotation and manual editing support
- **Style Editing** — Font, color, stroke, shadow, glow, gradient and other text effects, 5 built-in presets
- **Fine Timing Adjustment** — Waveform-assisted precise positioning, drag to adjust time points, waveform peak snapping
- **Project Management** — Save/load project files (.klproj) with all editing data
- **Export** — Render videos with embedded lyrics, export LRC files, per-character timestamp JSON, ASS subtitles
- **Cross-Platform** — Native experience on Windows / macOS / Linux
- **Multi-Language UI** — Simplified Chinese, Traditional Chinese, Japanese, English
- **Lightweight & Efficient** — Installer < 30MB, memory < 200MB, 60fps smooth rendering

## 📸 Screenshots

![Interface Preview](../assets/screenshot-00.png)

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/) 1.70+
- [FFmpeg](https://ffmpeg.org/) (required only for video export)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/karaoke-lyrics-maker.git
cd karaoke-lyrics-maker

# Install frontend dependencies
npm install

# Start development mode
npm run tauri dev
```

### Build

```bash
# Build production version
npm run tauri build
```

Build artifacts are located in `src-tauri/target/release/bundle/`.

### macOS Security Notice

macOS users will encounter a "cannot be opened" security warning when opening the app for the first time. Follow these steps to resolve it:

1. Double-click the `.dmg` installer and drag the app to the Applications folder
2. The first time you open it, you will see "cannot be opened because the developer cannot be verified"
3. Open **System Settings → Privacy & Security**, the blocked app will be shown at the bottom
4. Click **"Open Anyway"**
5. Confirm **"Open"** again
6. The app will work normally afterward with no repeated steps

## 📖 User Guide

### Basic Workflow

1. **Import Media** — Drag-and-drop or click to import video/audio files
2. **Input Lyrics** — Paste lyrics text or import LRC/SRT/ASS files
3. **Key Timing** — Press F2 to enter timing mode, then press Space during playback to mark each word
4. **Fine-Tune Timing** — Drag markers on the timeline to adjust time points
5. **Edit Styles** — Select presets or customize font, color, stroke, and other effects
6. **Export** — Export as video (requires FFmpeg), LRC, JSON, or ASS files

### Keyboard Shortcuts

| Shortcut | Function |
|----------|----------|
| `Space` | Play/Pause / Timing marker |
| `Esc` | Pause playback |
| `Backspace` | Undo last marker |
| `F2` | Enter/Exit timing mode |
| `F3` | Mark interlude line (skip) |
| `←` / `→` | Fine-tune by 100ms |
| `Ctrl+S` | Save project |
| `Ctrl+O` | Open file |
| `Ctrl+E` | Open export dialog |
| `Ctrl+,` | Open settings |

### Timing Modes

| Mode | Description | Best For |
|------|-------------|----------|
| Real-time Timing | Press a key for each word during playback | General, most common |
| Tap Timing | Tap at a steady rhythm, system assigns evenly | Songs with strong rhythm |
| Phrase Timing | Mark phrase start/end times, words distributed evenly | Quick drafts |

## 🏗️ Technical Architecture

| Layer | Technology |
|-------|------------|
| Framework | Tauri 2.x (Rust backend + WebView frontend) |
| Frontend | React 18 + TypeScript + Vite |
| State Management | Zustand |
| Styling | Tailwind CSS |
| Rendering | Canvas API (karaoke fill animation) |
| Audio | Web Audio API (precise timing) + Symphonia (waveform generation) |
| Video Export | FFmpeg (ASS subtitle filter) |
| Internationalization | react-i18next (4 languages) |

### Project Structure

```
src/                          # Frontend source
├── components/               # React components
│   ├── layout/              #   Layout (MenuBar, MainLayout, StatusBar)
│   ├── media/               #   Media (VideoPlayer, PlaybackControls)
│   ├── lyrics/              #   Lyrics (LyricTextEditor, LyricsOverlay)
│   ├── timeline/            #   Timeline (TimelinePanel, WaveformDisplay)
│   ├── style/               #   Style (StylePanel, ColorPicker)
│   ├── pronunciation/       #   Pronunciation (PronunciationPanel)
│   ├── export/              #   Export (ExportDialog)
│   └── settings/            #   Settings (SettingsDialog)
├── engine/                   # Rendering engine
│   ├── CanvasRenderer.ts   #   Canvas renderer (fill/shadow/glow)
│   ├── TimingEngine.ts     #   Timing engine (state machine)
│   ├── PlaybackClock.ts    #   Precision clock (dual anchor)
│   └── TextLayout.ts       #   Text layout
├── store/                   # Zustand state management
├── services/                # Business services
├── i18n/                    # Internationalization (en/zh-CN/zh-TW/ja-JP)
└── types/                   # TypeScript type definitions

src-tauri/                    # Rust backend
├── src/
│   ├── commands/            #   Tauri IPC commands
│   ├── engine/              #   Core engine
│   │   ├── media/          #     Media probing / waveform generation
│   │   ├── export/         #     LRC/JSON/ASS/video export
│   │   └── pronunciation/  #     Pinyin dictionary
│   └── menu.rs             #   macOS native menu
└── capabilities/            # Tauri permissions configuration

docs/                         # Development documentation (local, private)
```

## 🌍 Internationalization

The application supports the following languages:

| Language | Code | Status |
|----------|------|--------|
| Simplified Chinese | zh-CN | ✅ Complete |
| Traditional Chinese | zh-TW | ✅ Complete |
| Japanese | ja-JP | ✅ Complete |
| English | en | ✅ Complete |

Language can be switched in settings; the macOS native menu bar will also update accordingly.

## 📋 Export Formats

| Format | Description |
|--------|-------------|
| LRC | Standard lyrics file (line-level timing) |
| Enhanced LRC | With per-character timing tags |
| JSON | Per-character timestamps + pronunciation data |
| ASS | Subtitle file (karaoke fill effect) |
| Video | MP4 with embedded lyrics overlay (requires FFmpeg) |

## 🤝 Contributing

Issues and Pull Requests are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

## 🙏 Acknowledgements

- [Tauri](https://tauri.app/) — Cross-platform desktop application framework
- [Symphonia](https://github.com/pdeljanov/Symphonia) — Rust audio decoding library
- [CC-CEDICT](https://cc-cedict.org/wiki/) — Chinese dictionary
- [JMDict](https://www.edrdg.org/jmdict/j_jmdict.html) — Japanese dictionary
