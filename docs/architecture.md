# 系统架构与技术选型

## 1. 总体架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Web UI)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Video    │ │ Timeline │ │ Lyrics   │ │ Property   │ │
│  │ Player   │ │ Editor   │ │ Editor   │ │ Panel      │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Canvas Renderer (Lyrics Overlay)          │ │
│  └────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                  Tauri Bridge (IPC)                      │
├─────────────────────────────────────────────────────────┤
│                   Rust Backend                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Media    │ │ Audio    │ │ Project  │ │ Export      │ │
│  │ Engine   │ │ Engine   │ │ Manager  │ │ Engine      │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────────┐ │
│  │ Timeline │ │Pronuncia-│ │ FFmpeg Bindings          │ │
│  │ Engine   │ │tion Eng. │ │ (encode/decode/render)   │ │
│  └──────────┘ └──────────┘ └──────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 架构原则

- **关注点分离**：UI层（React）只负责展示和用户交互，所有计算密集型任务在Rust后端完成
- **异步IPC**：前端与后端通过Tauri的invoke/event机制通信，避免阻塞UI线程
- **离线优先**：所有功能不依赖网络，注音词典内置
- **插件化导出**：导出模块采用管道（Pipeline）模式，方便扩展新格式

## 2. 技术选型

### 2.1 核心框架：Tauri 2.x

**选择理由：**

| 维度 | Tauri 2.x | Electron | Flutter Desktop | Qt/C++ |
|------|-----------|----------|-----------------|--------|
| 安装包大小 | 5-15 MB | 150-250 MB | 50-100 MB | 30-80 MB |
| 内存占用 | 50-120 MB | 200-500 MB | 100-200 MB | 80-150 MB |
| 启动速度 | <1s | 2-4s | 1-2s | <1s |
| 跨平台 | ✅ 原生 | ✅ 原生 | ✅ 原生 | ✅ 需编译 |
| Web技术栈 | ✅ | ✅ | ❌ Dart | ❌ C++ |
| Rust性能 | ✅ 原生 | ❌ Node | ❌ | ❌ |
| 生态成熟度 | 较新 | 非常成熟 | 中等 | 非常成熟 |
| 视频播放 | 依赖WebView | Chromium原生 | 有限 | Qt Multimedia |

**结论**：Tauri是"资源占用小、跨平台、开发效率高"的最佳平衡点。与Electron相比，Tauri使用Rust替代Node.js，内存和存储占用大幅降低；与Flutter相比，前端使用Web技术栈降低了开发门槛。

**风险与缓解：**

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| WebView视频格式支持不一致 | 部分格式无法预览 | 导入时自动转码为H.264 MP4；提供备用的Rust视频渲染管线 |
| Tauri生态较新 | 部分功能缺少现成插件 | 核心功能用Rust实现，通过FFmpeg CLI或ffmpeg-next库处理媒体 |
| WebView跨平台差异 | Linux (WebKitGTK) 表现可能与Windows (WebView2) 不同 | 尽早建立跨平台CI测试；关键渲染路径用Canvas而非CSS |

### 2.2 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18+ | UI框架 |
| TypeScript | 5+ | 类型安全 |
| Vite | 5+ | 构建工具 |
| Zustand | 4+ | 状态管理（轻量，替代Redux） |
| Tailwind CSS | 3+ | 样式框架 |
| Canvas API | 原生 | 歌词渲染层（扫色动画） |
| WaveSurfer.js | 7+ | 音频波形可视化 |
| react-rnd | - | 可拖拽面板布局 |

#### 为什么用 Canvas 而不是 DOM 渲染歌词？

歌词扫色需要每帧更新逐字填充进度，涉及大量文字渲染和裁剪操作：

- **DOM方案**：每个字一个`<span>`，通过CSS `background-clip`或`clip-path`做填充动画。优点是开发简单；缺点是文字量大（如100+字同时显示）时DOM节点过多，动画性能差。
- **Canvas方案**：直接绘制文字，通过`globalCompositeOperation`或裁剪路径做填充。优点是渲染性能好（单次绘制调用），支持复杂文字效果；缺点是需要自行实现文字排版。

**选择Canvas**：歌词场景下文字量大（一首歌可达数百字），扫色动画需要60fps流畅运行。Canvas在此场景下有数量级的性能优势。

### 2.3 Rust后端技术栈

| Crate | 用途 |
|-------|------|
| `tauri` 2.x | 应用框架 |
| `ffmpeg-next` | 视频/音频编解码、导出渲染 |
| `symphonia` | 音频解码（纯Rust实现，无需系统依赖） |
| `hound` | WAV文件读写 |
| `serde` + `serde_json` | 序列化/反序列化 |
| `zip` | 项目文件打包（.klproj格式） |
| `regex` | 文本解析（导入各种字幕格式） |
| `encoding_rs` | 文本编码检测与转换 |
| `walkdir` | 文件系统遍历 |
| `dirs` | 跨平台目录（配置、缓存等） |

#### 为什么需要 ffmpeg-next？

- **视频导出渲染**：将歌词字幕合成到视频上，生成最终成品视频
- **音频解码**：提取音频用于波形图生成（备选方案：symphonia）
- **格式转换**：统一导入的媒体格式
- **缩略图生成**：视频时间线缩略图
- **备用视频播放**：当WebView无法播放某格式时，用FFmpeg解码帧并通过Canvas显示

### 2.4 FFmpeg捆绑策略

FFmpeg是一个较大的依赖（~80MB），有几种部署策略：

**推荐方案：按需下载 + 系统检测**

```
启动时检测:
  1. 系统PATH中是否有ffmpeg → 使用系统版本
  2. 没有 → 提示用户下载，或在首次导出时自动下载
  3. Windows/macOS: 下载预编译二进制到应用数据目录
  4. Linux: 引导用户通过包管理器安装 (apt/pacman/dnf)
```

优点：安装包保持小巧（不含FFmpeg），只在需要导出时提示下载。

## 3. 进程模型

```
┌──────────────────────────────────────────┐
│              Main Process                 │
│  (Rust - Tauri Core)                      │
│  - 窗口管理                               │
│  - 文件系统访问                            │
│  - FFmpeg子进程管理                        │
│  - 项目文件I/O                            │
│  - 应用配置/状态持久化                      │
├──────────────────────────────────────────┤
│              Renderer Process             │
│  (WebView - React App)                    │
│  - UI渲染                                 │
│  - 视频预览 (HTML5 <video>)               │
│  - Canvas歌词动画 (requestAnimationFrame) │
│  - 波形图交互                              │
│  - 用户输入处理                            │
├──────────────────────────────────────────┤
│         Worker Thread (Web Worker)        │
│  - 音频波形数据计算                        │
│  - 文本解析（LRC/ASS导入）                 │
│  - 注音字典查询                            │
├──────────────────────────────────────────┤
│       FFmpeg Subprocess (on-demand)       │
│  - 视频导出渲染                            │
│  - 媒体格式转码                            │
│  - 缩略图生成                              │
└──────────────────────────────────────────┘
```

### 关键IPC（进程间通信）通道

| 通道 | 方向 | 数据 | 频率 |
|------|------|------|------|
| `playback:seek` | Frontend→Backend | 目标时间(ms) | 低频（用户拖拽） |
| `playback:timeupdate` | Backend→Frontend | 当前时间(ms) | 高频（每~16ms，60fps） |
| `timeline:mark` | Frontend→Backend | 标记类型、时间点 | 中频（按键打轴时） |
| `project:save` | Frontend→Backend | 项目数据JSON | 低频 |
| `project:load` | Backend→Frontend | 项目数据JSON | 低频 |
| `export:progress` | Backend→Frontend | 进度百分比 | 中频（导出时每秒） |
| `media:waveform` | Backend→Frontend | 波形数据数组 | 低频（加载时一次性） |
| `dict:query` | Frontend→Backend | 文字→注音 | 中频（文本输入/导入时） |

## 4. 数据流架构

### 4.1 核心数据流

```
用户导入媒体文件(.mp4/.mp3)
       │
       ▼
┌─────────────────┐
│  Media Engine    │ → 提取元数据(时长/分辨率/编码)
│  (Rust)          │ → 生成波形数据(waveform peaks)
└───────┬─────────┘
        │
        ▼
┌─────────────────┐
│  State Store     │ ← 媒体路径、时长、波形数据
│  (Zustand)       │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐    用户输入/导入文本
│  Lyrics Model   │ ← ─────────────────
│                 │   文本 → 分行 → 分字 → 初始时间(均匀分布)
└───────┬─────────┘
        │
        ▼
┌─────────────────┐    用户按键打轴
│  Timing Engine  │ ← ─────────────────
│                 │   按键 → 记录时间点 → 分配给字/词
└───────┬─────────┘
        │
        ▼
┌─────────────────┐    requestAnimationFrame 循环
│  Render Engine  │ ← ─────────────────────────
│  (Canvas)       │   每帧: 获取当前时间 → 计算每个字的填充进度 → 绘制
└───────┬─────────┘
        │
        ▼
┌─────────────────┐    用户触发导出
│  Export Engine  │ ← ─────────────────
│  (Rust/FFmpeg)  │   读取Lyrics Model + 媒体文件 → 渲染输出
└─────────────────┘
```

### 4.2 状态管理架构（前端 Zustand Store）

```
Store
├── mediaSlice
│   ├── videoPath: string | null
│   ├── audioPath: string | null
│   ├── duration: number           // 毫秒
│   ├── videoWidth: number
│   ├── videoHeight: number
│   ├── waveformData: number[]     // 波形峰值数组
│   └── currentTime: number        // 毫秒
│
├── lyricsSlice
│   ├── lines: LyricLine[]         // 所有歌词行
│   ├── selectedLineIndex: number
│   ├── selectedCharIndex: number
│   └── pronunciationMode: 'none' | 'pinyin' | 'furigana' | 'romanji'
│
├── timingSlice
│   ├── isPlaying: boolean
│   ├── isRecording: boolean       // 是否在打轴模式
│   ├── currentMarkIndex: number   // 下一个待标记的字/词索引
│   ├── markKey: string            // 打轴按键(默认'Space')
│   └── leadIn: number             // 提前量(ms)
│
├── styleSlice
│   ├── fontFamily: string
│   ├── fontSize: number
│   ├── unsungColor: string        // 未唱颜色
│   ├── sungColor: string          // 已唱颜色
│   ├── sweepStyle: 'left-to-right' | 'top-to-bottom' | 'gradient'
│   ├── outline: OutlineConfig
│   ├── shadow: ShadowConfig
│   └── glow: GlowConfig
│
├── projectSlice
│   ├── filePath: string | null    // 当前项目文件路径
│   ├── isDirty: boolean           // 是否有未保存修改
│   └── recentProjects: string[]
│
└── uiSlice
    ├── activePanel: 'media' | 'lyrics' | 'style' | 'export'
    ├── timelineZoom: number
    ├── showWaveform: boolean
    └── language: 'zh-CN' | 'en' | 'ja'
```

## 5. 关键设计决策

### 5.1 时间精度

- 内部时间单位：**毫秒(ms)**，使用整数
- 显示精度：毫秒（可配置显示到10ms或1ms）
- 打轴时自动吸附：可配置吸附到最近的波形峰值（±20ms）
- 帧对齐导出：导出视频时对齐到视频帧边界（如30fps则对齐到33ms的整数倍）

### 5.2 歌词扫色模型

采用**双色逐字渐变填充**模型：

```
每个字的状态由三个参数定义:
  - charStartTime: 该字开始时间(ms)
  - charEndTime:   该字结束时间(ms)
  - currentTime:   当前播放时间(ms)

填充进度 = clamp((currentTime - charStartTime) / (charEndTime - charStartTime), 0, 1)

渲染:
  - 未唱部分: unsungColor (如白色)
  - 已唱部分: sungColor (如红色)
  - 过渡区域: 可选的渐变带(通常1-3px模糊)
```

扫色方向支持：
- `left-to-right`（从左到右）— 默认，适合横排文字
- `top-to-bottom`（从上到下）— 适合竖排文字
- `right-to-left`（从右到左）— 阿拉伯语等
- `gradient-center`（中心扩散）— 特殊效果

### 5.3 歌词排版模型

支持三种排版模式：

1. **单行模式**：一次显示一行，居中
2. **双行模式**：显示当前行和下一行，当前行高亮
3. **多行模式**：显示所有行，当前行滚动到可见区域

每行内文字排列：
- 横排（horizontal）：默认，从左到右
- 竖排（vertical）：从上到下，从右到左换列

### 5.4 注音系统架构

```
┌──────────────────────────────────────┐
│         Pronunciation Engine          │
│                                       │
│  ┌────────────┐   ┌────────────────┐ │
│  │ Dictionary  │   │  Rule Engine   │ │
│  │  Lookup     │   │  (多音字消歧)   │ │
│  │             │   │                │ │
│  │ 汉字→拼音   │   │  上下文分析     │ │
│  │ 汉字→假名   │   │  词频统计      │ │
│  └──────┬─────┘   └───────┬────────┘ │
│         │                 │           │
│         └────┬────────────┘           │
│              ▼                        │
│       ┌──────────────┐               │
│       │  Annotation  │               │
│       │   Result     │               │
│       └──────────────┘               │
└──────────────────────────────────────┘
```

内置词典：
- 中文：CC-CEDICT + pinyin词典（约12万词条），打包为bincode格式（~8MB）
- 日文：JMDict + kanjidic2（约15万词条），打包为bincode格式（~12MB）
- 词典在编译时嵌入，运行时加载到内存（约20-30MB，现代机器完全可接受）

多音字消歧策略（V1简化版）：
- 优先使用最常见读音
- 用户可手动修正
- V2预留：基于词上下文的消歧

### 5.5 项目文件格式

采用 **ZIP压缩包** 格式，后缀名 `.klproj`：

```
MySong.klproj (ZIP Archive)
├── project.json          # 项目元数据与歌词数据
├── thumbnails/           # 视频缩略图（可选）
│   ├── thumb_001.jpg
│   └── ...
├── fonts/                # 嵌入字体文件（可选，用户选择嵌入时）
│   └── custom_font.ttf
└── media/                # 媒体文件引用（默认不嵌入，仅存路径）
    └── references.json   # 媒体文件的相对/绝对路径映射
```

**project.json** 结构详见 [data-models.md](./data-models.md)。

## 6. 跨平台适配策略

### 6.1 桌面平台差异处理

| 功能 | Windows | macOS | Linux |
|------|---------|-------|-------|
| WebView | WebView2 (Chromium) | WKWebView (Safari) | WebKitGTK |
| 视频硬解 | ✅ Media Foundation | ✅ VideoToolbox | ⚠️ VAAPI (需检测) |
| 文件对话框 | 原生 | 原生 | 原生(GTK/Qt) |
| 字体目录 | C:\Windows\Fonts | /System/Library/Fonts + ~/Library/Fonts | /usr/share/fonts + ~/.fonts |
| 菜单栏 | 窗口内 | 系统顶部 | 窗口内 |
| 托盘 | ✅ | ✅ | ⚠️ 依赖桌面环境 |

### 6.2 WebView视频兼容性方案

不同平台的WebView对视频编码支持不同：

| 编码 | WebView2 (Win) | WKWebView (Mac) | WebKitGTK (Linux) |
|------|----------------|-----------------|-------------------|
| H.264/AVC | ✅ | ✅ | ⚠️ 需额外安装gstreamer |
| H.265/HEVC | ✅ (Win10+) | ✅ (High Sierra+) | ❌ |
| VP8/VP9 | ✅ | ❌ | ✅ |
| AV1 | ✅ (Win10+) | ❌ | ⚠️ |

**应对策略**：
1. 导入时检测格式，不支持的格式自动转码（FFmpeg → H.264 MP4）
2. 转码后的文件缓存到应用数据目录
3. 导出时使用原始高质量文件
4. Linux下引导用户安装必要的gstreamer插件包

## 7. 性能目标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 应用启动时间 | < 1.5s (冷启动) | 不含FFmpeg下载 |
| 视频加载 | < 2s (1080p, 5分钟) | 到可播放状态 |
| 波形图生成 | < 3s (5分钟音频) | 后台线程，不阻塞UI |
| 扫色动画帧率 | 60fps (100字同屏) | Canvas绑定，掉帧<5% |
| 打轴响应延迟 | < 30ms | 按键到记录时间 |
| 视频导出速度 | ≥ 0.5x 实时 (1080p) | 即5分钟视频<10分钟导出 |
| 内存占用 | < 200MB (典型项目) | 含视频/音频加载 |
| 安装包大小 | < 30MB (不含FFmpeg) | zip/tar包 |

## 8. 安全考虑

- 不执行导入文本中的任何脚本（纯文本解析）
- 媒体文件解码使用沙箱化的FFmpeg子进程
- 项目文件反序列化时验证所有字段类型与范围
- 用户数据（配置、缓存、最近项目列表）存储在应用标准数据目录
- 字体文件仅读取，不安装到系统
