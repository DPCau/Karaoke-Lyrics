# 开发路线图与测试策略

## 目录

1. [开发阶段总览](#1-开发阶段总览)
2. [Phase 0：项目初始化与环境搭建](#2-phase-0项目初始化与环境搭建)
3. [Phase 1a：媒体导入模块](#3-phase-1a媒体导入模块)
4. [Phase 1b：歌词编辑与基础回放](#4-phase-1b歌词编辑与基础回放)
5. [Phase 2：核心打轴体验](#5-phase-2核心打轴体验)
6. [Phase 3：扫色渲染与样式](#6-phase-3扫色渲染与样式)
7. [Phase 4：注音系统](#7-phase-4注音系统)
8. [Phase 5：导出系统](#8-phase-5导出系统)
9. [Phase 6：完善与打磨](#9-phase-6完善与打磨)
10. [Phase 7：跨平台适配与发布](#10-phase-7跨平台适配与发布)
11. [测试策略](#11-测试策略)
12. [风险清单](#12-风险清单)

---

## 1. 开发阶段总览

```
Phase 0: 项目初始化         (1-2周)
Phase 1a: 媒体导入模块      (2-3周)
Phase 1b: 歌词编辑+回放     (2-3周)
Phase 2: 核心打轴体验       (4-5周)
Phase 3: 扫色渲染与样式     (4-5周)
Phase 4: 注音系统           (3-4周)
Phase 5: 导出系统           (5-6周)
Phase 6: 完善与打磨         (4-5周)
Phase 7: 跨平台适配与发布   (4-6周)
─────────────────────────────────
总计预估: 29-40周 (约7-10个月，单人全职)
```

> **注意**：以上为基础时间估算。以下情况可能导致延长至 8-12 个月：macOS 代码签名+公证流程（Apple Developer 审核）、FFmpeg 各版本兼容性调试、三平台 WebView 差异适配、Linux 视频解码兼容性处理。建议根据实际开发进展动态调整。

每个Phase结束后都有**里程碑验收标准**，确保可交付增量。

---

## 2. Phase 0：项目初始化与环境搭建

**时间**：1-2周

### 2.1 目标

搭建完整的开发环境，项目能编译运行，CI/CD就绪。

### 2.2 具体任务

#### 2.2.1 Tauri + React脚手架搭建

- [ ] 使用 `create-tauri-app` 创建项目骨架
  ```bash
  npm create tauri-app@latest karaoke-lyrics -- --template react-ts
  ```
- [ ] 配置 Vite + React + TypeScript
- [ ] 安装前端依赖：
  ```bash
  npm install zustand react-rnd tailwindcss wavesurfer.js
  npm install -D @types/react @types/node
  ```
- [ ] 配置 Tailwind CSS
- [ ] 安装 Rust 依赖（添加到 Cargo.toml）：
  ```toml
  [dependencies]
  tauri = { version = "2", features = ["tray-icon"] }
  serde = { version = "1", features = ["derive"] }
  serde_json = "1"
  zip = "0.6"
  symphonia = { version = "0.5", features = ["all"] }
  hound = "3"
  encoding_rs = "0.8"
  walkdir = "2"
  dirs = "5"
  uuid = { version = "1", features = ["v4"] }
  log = "0.4"
  env_logger = "0.10"
  ```

- [ ] 配置 `tauri.conf.json`：
  - 窗口标题、尺寸
  - 安全策略（CSP）
  - 文件关联（.klproj）
  - 允许的API权限

#### 2.2.2 项目基础结构

- [ ] 创建前端目录结构（参考 [module-design.md](./module-design.md) 的目录树）
- [ ] 创建 Rust 后端目录结构
- [ ] 配置 ESLint + Prettier
- [ ] 配置 Rust clippy + rustfmt

#### 2.2.3 CI/CD 搭建

- [ ] GitHub Actions 配置：
  - PR检查：lint + type-check + build
  - 跨平台构建矩阵（ubuntu-latest, macos-latest, windows-latest）
- [ ] 配置自动发布（release时触发构建+上传产物）

#### 2.2.4 基础UI框架

- [ ] 实现应用根布局 `<MainLayout>`（可拖拽面板）
- [ ] 实现 `<MenuBar>` 基础菜单结构（功能先为空）
- [ ] 实现 `<StatusBar>` 状态栏（版本号/时间显示）
- [ ] 实现基础主题（深色主题）
- [ ] 基础路由/面板切换

### 2.3 Phase 0 验收标准

- [x] `npm run tauri dev` 成功启动应用窗口
- [x] 应用窗口显示主布局（左/中/右面板框架）
- [x] CI 对所有平台编译通过（绿勾）
- [x] 菜单栏可点击，弹出占位对话框
- [x] 代码格式化/检查工具就绪

---

## 3. Phase 1a：媒体导入模块

**时间**：2-3周

**目标**：完成媒体文件导入、探测、波形生成和基础视频/音频播放。

### 3.1 媒体导入模块

#### 前置依赖
- Phase 0 完成

#### 任务

- [ ] **Rust端：媒体探测**
  - 实现 `probe_media()` 函数
  - 通过 ffprobe 提取视频/音频元信息
  - 返回 `MediaInfo` 结构体
  - 错误处理：文件不存在、不支持格式、损坏文件

- [ ] **Rust端：Tauri命令封装**
  - `media:open_video` → 打开文件对话框 → 探测 → 返回MediaInfo
  - `media:open_audio` → 同上，仅音频
  - `media:get_waveform` → 返回波形峰值数组

- [ ] **前端：导入UI**
  - `<ImportDialog>` / 拖拽导入
  - 格式过滤（媒体文件扩展名）
  - 加载状态指示
  - 错误提示

- [ ] **前端：视频播放器**
  - `<VideoPlayer>` 组件（使用HTML5 `<video>`）
  - 播放/暂停/Seek基础功能
  - 通过 `MediaElementAudioSourceNode` 连接 video 到 Web Audio API 获得精确时间戳
  - 使用 `requestAnimationFrame` + `audioContext.currentTime` 驱动渲染（替代不可靠的 `video.currentTime`）
  - 当前时间同步到Zustand store（毫秒精度）
  - 与Tauri的 `convertFileSrc` 集成

- [ ] **前端：媒体信息面板**
  - 显示分辨率、帧率、编码、时长
  - 显示音频信息
  - 格式兼容性警告

### 3.2 Phase 1a 验收标准

- [x] 能导入MP4视频文件，视频在预览区正常播放
- [x] 能导入MP3音频文件，波形数据生成并显示
- [x] 纯音频文件（无视频轨道）也能正常回放和打轴
- [x] 整体内存占用 < 150MB（空项目，无歌词数据）

---

## 4. Phase 1b：歌词编辑与基础回放

**时间**：2-3周

**目标**：完成歌词输入（纯文本 + LRC导入）、分字/分词、基础回放预览。

### 4.1 歌词输入模块

- [ ] **前端：纯文本解析器**
  - 实现 `TextParser.parsePlain()`
  - UTF-8编码处理
  - 按换行符分行
  - Trim首尾空白

- [ ] **前端：LRC格式解析器**
  - 实现 `TextParser.parseLRC()`
  - 支持标准行级标签 `[mm:ss.xx]`
  - 支持增强型逐字标签 `[mm:ss.xx]歌<00:12.34>词<00:12.67>`
  - 解析元数据标签（ti/ar/al/by/offset）
  - 多时间标签支持（`[00:12.34][00:45.67]重复歌词`）
  - 导入后自动填充歌词编辑器，已有时间数据恢复到 LyricChar 对象

- [ ] **前端：SRT/ASS格式解析器**（基础版）
  - 实现 `TextParser.parseSRT()` — 提取文本和时间
  - 实现 `TextParser.parseASS()` — 提取 Style 和 Dialogue 行
  - 提示"已导入X行，其中Y行包含时间信息"

- [ ] **前端：分字器（基础版）**
  - 实现 `CharSplitter.splitChinese()`（逐字）
  - 英文按词分割
  - 标点附加到前一个词

- [ ] **前端：歌词编辑器**
  - `<LyricTextEditor>` 文本区域
  - 粘贴/输入歌词
  - 实时分字预览（在侧面板显示分行/分字结果）
  - 基础编辑：增删改行
  - 支持拖放 `.lrc`/`.srt`/`.ass` 文件导入

- [ ] **前端：歌词数据模型**
  - 创建 `LyricLine` 和 `LyricChar` 对象
  - 基础时间模型（从LRC导入的时间自动填充，其余为null）

### 4.2 基础回放预览

- [ ] **前端：PlaybackClock 集成**
  - 实现 `PlaybackClock` 类（双锚点时钟追踪系统）
  - 与 VideoPlayer/AudioPlayer 组件集成
  - 支持 pause/resume/seek/playbackRate 的正确时间同步

- [ ] **前端：回放控制**
  - 播放/暂停按钮
  - Seek bar（进度条）
  - 当前时间码显示
  - 音量控制

- [ ] **前端：基础歌词叠加**
  - 在视频上方叠加一个简单Canvas层
  - 显示当前行歌词（无扫色，静态文字）
  - 行位置：底部居中

- [ ] **前端：Canvas渲染基础**
  - `<LyricsOverlay>` 组件
  - 基础文字绘制（指定字体、颜色、位置）
  - 跟随视频播放时间切换显示行

### 4.3 Phase 1b 验收标准

- [x] 能在歌词编辑器中输入/粘贴歌词
- [x] 能导入LRC歌词文件（含时间数据恢复）
- [x] 歌词正确分行和分字
- [x] 播放视频/音频时，歌词叠加显示在视频上
- [x] 歌词随播放进度切换到正确的行（基于时间）
- [x] PlaybackClock 在暂停/seek/降速播放时时间正确
- [x] 整体内存占用 < 150MB（空项目，无打轴数据）

---

## 5. Phase 2：核心打轴体验

**时间**：4-5周

**目标**：完成按键打轴全流程，这是软件最核心的交互，需要精心打磨。

### 5.1 打轴引擎

- [ ] **前端：打轴状态机**
  - 实现 `TimingEngine` 类
  - 状态：IDLE → PLAYING_AND_MARKING → PAUSED → COMPLETED
  - 实现 `startMarking()` 方法（确保首个字 startTime 不为 null）
  - 状态转换逻辑（参考 [module-design.md #4.1](./module-design.md#41-打轴状态机)）

- [ ] **前端：三种打轴模式**（TimingStrategy 接口可插拔切换）
  - **模式A：实时打轴（REALTIME）** — 播放中逐字按键标记，Space 始终=标记+继续播放
  - **模式B：Tap打轴（TAP）** — 不播放音频，用户按节奏匀速按键，系统根据间隔自动分配字时间
  - **模式C：句级均匀分配（SENTENCE_DISTRIBUTE）** — 仅标记每句起止（2次按键/行），句内均匀分配
  - 模式切换 UI（工具栏按钮/快捷键）

- [ ] **前端：打轴键盘处理**
  - `useKeyboard` hook 捕获打轴键
  - 打轴键/暂停键/退格键行为
  - 按键防抖（防止误触连发，~100ms冷却）

- [ ] **前端：标记逻辑**
  - 标记当前字：记录 `endTime = currentTime`
  - 下一个字：设置 `startTime = currentTime`
  - 游标自动前进（跳过空格/标点）

- [ ] **前端：提前量（Lead-in）**
  - 全局提前量配置（滑块 -200ms ~ 0ms）
  - 标记时间 = 按键时间 + leadIn

- [ ] **前端：吸附功能**
  - 波形峰值吸附
  - 吸附强度可调

### 5.2 时间线面板

- [ ] **前端：波形图显示**
  - `<WaveformDisplay>` Canvas组件
  - 支持缩放（+/- 按键或滚轮）
  - 支持横向滚动
  - 播放头（红色竖线）实时更新

- [ ] **前端：时间刻度尺**
  - `<TimeRuler>` 组件
  - 自适应刻度间隔（根据缩放级别）
  - 时间标签

- [ ] **前端：打轴标记轨道**
  - `<TimingTrack>` 组件
  - 显示每个字的时间标记（小竖线或菱形标记）
  - 拖拽标记调整时间
  - 不同颜色区分已标记/未标记

- [ ] **前端：歌词行轨道**
  - 在时间线上显示每行的起止范围（彩色条块）
  - 点击行条块跳转到该行

### 5.3 时间微调

- [ ] **前端：逐字拖拽调整**
  - 实现标记拖拽逻辑（mousedown → mousemove → mouseup）
  - 吸附在拖拽时也生效
  - 按住Shift连锁移动

- [ ] **前端：批量操作**
  - 选中多个标记 → 整体偏移
  - 框选功能
  - 选中后右键菜单：均匀分配时间、拉伸/压缩

- [ ] **前端：属性面板**
  - `<PropertyPanel>` 选中字/行时显示
  - 可编辑：开始时间/结束时间/持续时长
  - 播放按钮（仅播放该字/该行）

### 5.4 打轴辅助

- [ ] **前端：预卷（Pre-roll）**
  - 从标记点前2秒开始播放

- [ ] **前端：节拍器**
  - BPM输入/Tap Tempo
  - 节拍音播放（Web Audio API生成Click音）
  - 节拍网格显示

- [ ] **前端：降速打轴**
  - 播放速度选择器（0.5x/0.75x/0.9x/1.0x）
  - 降速时标记时间自动换算

- [ ] **前端：标记统计提示**
  - "已标记: 45/120 字"
  - 进度条

### 5.5 Phase 2 验收标准

- [x] 能够流畅完成一首歌的完整打轴（3-5分钟歌曲，用户测试）
- [x] 打轴键响应延迟 < 30ms（主观感觉即时）
- [x] 退格撤销标记正常工作
- [x] 波形图正确显示，播放头实时跟随
- [x] 能通过拖拽微调时间标记
- [x] 降速打轴功能正常
- [x] 时间线缩放/滚动流畅（>30fps）
- [x] 打轴数据正确保存到歌词模型中

---

## 6. Phase 3：扫色渲染与样式

**时间**：3-4周

**目标**：实现完整的歌词扫色动画和样式系统，视觉效果达到可用水平。

### 6.1 Canvas扫色渲染

- [ ] **前端：CanvasRenderer 完整实现**
  - 实现双色逐字填充
  - 四种填充方向（left-to-right 等）
  - 渐变过渡带
  - 缓动曲线（easing functions）

- [ ] **前端：文字效果**
  - 描边/轮廓（outline）：使用多次偏移绘制实现
  - 阴影（shadow）：`ctx.shadow*` API
  - 发光（glow）：模糊 + 偏移
  - 背景条：圆角矩形 + 半透明填充

- [ ] **前端：渲染性能优化**
  - 分层Canvas架构：未唱文字层 + 已唱文字层，用 clip 控制扫色可见区域
  - 离屏Canvas缓存（背景条、安全线等不变元素，每帧仅 drawImage）
  - 文字度量缓存（避免每帧 `measureText()`，性能杀手之一）
  - 避免 `shadowBlur`（极高开销），改用多次 strokeText 偏移模拟描边轮廓
  - 脏矩形检测（只重绘变化区域）
  - `{ alpha: false }` 关闭Alpha通道（不需要透明时显著提升性能）
  - 整数坐标（`Math.floor(x)` 避免亚像素抗锯齿重算）
  - FPS监控显示（开发模式）
  - **性能目标**：200字双行模式 ≥ 50fps，100字单行模式 = 60fps

### 6.2 文字排版

- [ ] **前端：TextLayout 完整实现**
  - 横排文字排版
  - 水平对齐（左/中/右）
  - 垂直定位（上/中/下 + 自定义%）  
  - 竖排模式（vertical writing mode）
  - 安全区避让
  - 双行模式（当前行+下一行）

### 6.3 样式面板

- [ ] **前端：样式属性编辑**
  - `<StylePanel>` 完整实现
  - 字体选择器（读取系统字体列表）
  - 字号、颜色、透明度等滑块
  - 描边/阴影/发光参数控件
  - 布局参数控件

- [ ] **前端：样式预设系统**
  - 5个内置预设定义
  - 预设创建/保存/删除
  - 预设导出/导入（JSON文件）
  - 样式A/B对比模式

- [ ] **前端：颜色选择器**
  - `<ColorPicker>` 组件
  - RGBA四通道（R/G/B滑块 + Alpha滑块）
  - 预设色板
  - 滴管工具（TODO V2）
  - HEX/RGBA输入框

### 6.4 Phase 3 验收标准

- [x] 播放时，歌词显示流畅的逐字扫色动画（60fps）
- [x] 扫色方向和渐变过渡带正常工作
- [x] 描边、阴影、发光效果可视
- [x] 背景条正确包围歌词文字
- [x] 样式预设可切换，实时反映在预览中
- [x] 竖排文字模式可正常显示
- [x] 100字同屏渲染帧率 > 50fps

---

## 7. Phase 4：注音系统

**时间**：2-3周

**目标**：实现汉字拼音注音和日文假名注音功能。

### 7.1 词典集成

- [ ] **Rust端：词典文件准备**
  - 获取/准备 CC-CEDICT 词典数据
  - 获取/准备 JMDict + KanjiDic2 数据
  - 转换为内部格式 → bincode序列化
  - 词典打包（通过 `include_bytes!` 或资源文件嵌入）

- [ ] **Rust端：词典加载与查询**
  - `PronunciationDict::load_from_bytes()` 加载
  - `lookup_char()` 单字查询（词优先，字回退）
  - `lookup_batch()` 批量查询

- [ ] **Rust端：Tauri命令**
  - `pronunciation:annotate_batch` 批量注音
  - `pronunciation:lookup` 单字查询

### 7.2 多音字处理（V1简化版）

- [ ] **Rust端：频率排序**
  - 词典中每个条目都有频率字段
  - 返回频率最高的读音作为默认值

- [ ] **前端：备选读音**
  - 点击注音文字显示备选读音下拉
  - 选择备选读音后更新

### 7.3 注音显示

- [ ] **前端：注音渲染器**
  - `PronunciationRenderer` 类
  - 注音文字绘制（小字号，居中对齐）
  - 注音位置计算（原文字上方）
  - 注音颜色独立设置
  - 注音参与/不参与扫色选项

- [ ] **前端：注音编辑面板**
  - `<PronunciationPanel>` 组件
  - 显示每行各字的注音状态
  - 手动编辑/清除注音
  - 批量注音按钮
  - 注音模式切换

- [ ] **前端：注音导入导出**
  - 支持导入带拼音的文本（`我{wo3}`格式）
  - 导出LRC时可选包含注音
  - 导出JSON时包含注音数据

### 7.4 Phase 4 验收标准

- [x] 中文歌词一键标注拼音（准确率 > 90%）
- [x] 日文歌词一键标注假名（准确率 > 80%）
- [x] 注音文字正确显示在原文字上方
- [x] 注音可手动编辑
- [x] 多音字可选备选读音
- [x] 注音功能不影响扫色性能

---

## 8. Phase 5：导出系统

**时间**：3-4周

**目标**：实现所有导出功能，生成成品视频和歌词文件。

### 8.1 FFmpeg集成

- [ ] **Rust端：FFmpeg检测**
  - `system:detect_ffmpeg` 命令
  - 检查 PATH / 应用数据目录 / 系统常见路径
  - 返回版本号和路径

- [ ] **前端：FFmpeg下载引导**
  - 检测到没有FFmpeg时显示引导UI
  - 提供官方下载链接
  - Windows/macOS自动下载 → 解压到应用数据目录
  - Linux提示使用包管理器

### 8.2 视频导出

- [ ] **Rust端：FFmpeg视频导出（ASS滤镜方案）**
  - `export:video` 命令
  - 从歌词数据（LyricLine/LyricChar）动态生成 ASS 字幕内容（含逐字 `\k` 卡拉OK标签）
  - 使用 `ffmpeg -vf "ass=temp.ass"` 渲染（ASS 滤镜原生支持逐字扫色）
  - 支持字体、颜色、大小、描边参数映射到 ASS 格式
  - 视频编码选项配置
  - 通过解析 FFmpeg stderr 中 `frame=` 行推送 `export:progress` event
  - 导出完成后清理临时 ASS 文件

- [ ] **Rust端：导出进度推送**
  - FFmpeg输出分析（解析 `time=` 进度信息）
  - 通过 `export:progress` event向前端推送

- [ ] **前端：导出对话框**
  - `<ExportDialog>` 组件
  - 视频格式/分辨率/帧率/码率设置
  - 导出范围选择
  - 预设保存

- [ ] **前端：导出进度UI**
  - `<ExportProgress>` 组件
  - 进度条 + 预估剩余时间
  - 取消按钮
  - 完成通知

### 8.3 LRC导出

- [ ] **Rust端：LRC导出**
  - 标准LRC格式（行级）
  - 增强LRC格式（逐字时间标签）
  - 编码选择（UTF-8/UTF-16/GBK）
  - 元数据选项

### 8.4 JSON/ASS导出

- [ ] **Rust端：JSON导出**
  - 完整格式（含元数据、注音、行级+字级时间）
  - 紧凑格式（仅逐字时间和注音）
  - 格式化输出选项

- [ ] **Rust端：ASS字幕导出**
  - ASS格式头生成
  - `\kf` 标签逐字时间
  - 样式参数映射

### 8.5 项目文件保存/加载

- [ ] **Rust端：项目保存**
  - ZIP打包（project.json + media/references.json）
  - 可选嵌入字体
  - 原子写入（写临时文件→改名）

- [ ] **Rust端：项目加载**
  - ZIP解压 → JSON解析 → 版本检查
  - 媒体文件路径验证
  - 错误恢复（路径缺失时提示手动定位）

- [ ] **前端：项目IO UI**
  - 新建项目对话框
  - 保存/另存为/自动保存
  - 最近项目列表（存储到应用配置）
  - 启动页（最近项目 + 新建 + 打开）

### 8.6 Phase 5 验收标准

- [x] 能导出MP4视频，歌词正确叠加（方式A）
- [x] 能导出标准LRC文件
- [x] 能导出带逐字时间标签的增强LRC
- [x] 能导出逐字时间戳JSON
- [x] 能导出ASS字幕文件
- [x] 项目文件正常保存和加载（含所有数据）
- [x] 自动保存功能正常
- [x] 导出进度实时更新

---

## 9. Phase 6：完善与打磨

**时间**：2-3周

**目标**：提升用户体验、稳定性、性能优化。

### 9.1 撤销/重做系统

- [ ] **前端：完整的UndoManager**
  - 支持文本编辑撤销
  - 支持打轴操作撤销
  - 支持样式修改撤销
  - 支持分字调整撤销
  - 栈深度限制 + 内存管理

### 9.2 用户引导

- [ ] **前端：首次使用引导**
  - 步骤式引导（新建项目→导入媒体→输入歌词→打轴→导出）
  - 提示气泡

- [ ] **前端：帮助文档**
  - 内置帮助面板
  - 快捷键速查表（`?`键唤起）
  - 常见问题FAQs

### 9.3 性能优化

- [ ] **前端：启动优化**
  - 懒加载非关键模块
  - 波形数据渐进加载
  - 视频缩略图延迟生成

- [ ] **前端：内存管理**
  - Canvas缓存策略优化
  - 大项目（>500行）性能测试
  - 长时间使用内存泄漏检查

- [ ] **Rust端：后台任务**
  - 波形生成使用独立线程
  - 导出使用子进程

### 9.4 错误处理与恢复

- [ ] **前端：全局错误边界**
  - React Error Boundary
  - 严重错误时不崩溃，显示错误信息 + 保存数据提示

- [ ] **前端：友好的错误提示**
  - 所有操作失败都有Toast提示
  - 区分用户可修复和不可修复错误

- [ ] **前端：崩溃恢复**
  - 异常退出后下次启动检测 autosave 文件
  - 提示"检测到未保存的恢复文件，是否恢复？"

### 9.5 功能补完

- [ ] **前端：查找替换**
  - 歌词文本中的查找/替换
  - 支持正则表达式（可选）

- [ ] **前端：节拍器完善**
  - Tap Tempo功能（按节奏点击测BPM）
  - 视觉节拍指示

- [ ] **前端：播放列表**
  - 一个项目内多个章节/段落管理

- [ ] **前端：自定义快捷键**
  - 快捷键设置面板
  - 冲突检测
  - 导入/导出快捷键配置

### 9.6 Phase 6 验收标准

- [x] 撤销/重做覆盖所有编辑操作
- [x] 首次使用引导完整可走通
- [x] 启动时间 < 1.5s（冷启动）
- [x] 5分钟歌曲 + 100行歌词项目，内存 < 200MB
- [x] 所有错误有用户友好的提示
- [x] 自动保存/恢复正常工作

---

## 10. Phase 7：跨平台适配与发布

**时间**：2-3周

**目标**：在Windows、macOS、Linux三平台上验证和发布。

### 10.1 跨平台测试

- [ ] **Windows测试**
  - Windows 10/11
  - WebView2 Runtime检测（缺少时引导安装）
  - 视频格式兼容性测试（Media Foundation支持情况）
  - 安装包签名
  - 文件关联注册

- [ ] **macOS测试**
  - macOS 13+ (Ventura+)
  - WKWebView视频兼容性测试
  - 沙箱权限配置
  - 代码签名 + 公证（Notarization）
  - DMG打包

- [ ] **Linux测试**
  - Ubuntu 22.04+ / Fedora 38+
  - WebKitGTK视频解码测试
  - gstreamer插件依赖文档
  - AppImage / deb / rpm 打包

### 10.2 发布准备

- [ ] **应用图标**
  - 设计应用图标
  - 生成所有平台所需格式（.ico, .icns, .png）

- [ ] **安装包/压缩包**
  - Windows: .msi 或 .exe installer
  - macOS: .dmg
  - Linux: .AppImage + .deb

- [ ] **自动更新**
  - Tauri updater 插件配置
  - 更新服务器/静态文件托管
  - 更新签名密钥管理

- [ ] **文档**
  - 用户手册（中文/英文）
  - 开发文档（本文档集）
  - 更新日志（CHANGELOG.md）

### 10.3 社区准备

- [ ] GitHub仓库README
- [ ] 贡献指南（CONTRIBUTING.md）
- [ ] Issue模板
- [ ] 示例项目文件（Sample.klproj）

### 10.4 Phase 7 验收标准

- [x] Windows/macOS/Linux三平台编译通过
- [x] 三平台基本功能手动测试通过
- [x] 视频格式兼容性测试报告（支持格式列表）
- [x] 安装包可正常安装/卸载
- [x] 用户手册完成

---

## 11. 测试策略

### 11.1 测试金字塔

```
            ╱─────╲
           ╱  E2E  ╲          少量端到端测试（核心流程）
          ╱─────────╲
         ╱ 集成测试   ╲        中等数量（IPC通信、模块集成）
        ╱───────────────╲
       ╱    单元测试       ╲    大量（工具函数、算法逻辑）
      ╱─────────────────────╲
```

### 11.2 单元测试

**前端（Vitest）**：

| 测试目标 | 测试内容 | 优先级 |
|----------|----------|--------|
| `textParser.ts` | LRC/SRT/ASS/纯文本解析正确性 | P0 |
| `charSplitter.ts` | 中/日/英/韩分字正确性 | P0 |
| `timeCalculator.ts` | 时间分配、均匀化算法 | P0 |
| `timingEngine.ts` | 打轴状态机转换（5种状态×多个事件）、标记逻辑、吸附算法、startMarking | P0 |
| `PlaybackClock.ts` | 双锚点时钟：暂停/恢复/seek/playbackRate 变化的时间正确性 | P0 |
| `TextLayout.ts` | 文字排版计算（位置、尺寸） | P1 |
| `UndoManager.ts` | 撤销/重做栈正确性、最大深度限制 | P1 |
| `CanvasRenderer.ts` | 渲染逻辑（mock Canvas）：fillRatio 计算、裁剪矩形、阴影/发光偏移方案 | P1 |
| `useKeyboard.ts` | 按键防抖、热键注册、上下文切换（打轴/非打轴模式） | P1 |
| `color.ts` | RGBA/HEX/ASS-BGR转换（含 alpha 反转） | P2 |
| `timeFormat.ts` | 时间格式化 | P2 |

**Rust端（cargo test）**：

| 测试目标 | 测试内容 | 优先级 |
|----------|----------|--------|
| `waveform.rs` | 波形数据生成正确性 | P0 |
| `pinyin.rs` | 拼音查询正确性 | P0 |
| `furigana.rs` | 假名查询正确性 | P0 |
| `lrc_exporter.rs` | LRC格式输出正确性 | P0 |
| `json_exporter.rs` | JSON输出正确性 | P0 |
| `project.rs` | 项目保存/加载往返一致性 | P0 |
| `encoding.rs` | 编码检测正确性 | P1 |

### 11.3 集成测试

| 测试目标 | 测试内容 | 工具 |
|----------|----------|------|
| IPC命令 | Tauri命令调用与返回 | Vitest + Tauri mock |
| 媒体探测 | 真实媒体文件探测 | `#[cfg(test)]` Rust tests |
| 导出管道 | 完整导出流程（输入→输出） | Rust integration tests |
| 状态管理 | Zustand store actions/reactions | Vitest + React Testing Library |

### 11.4 端到端测试

| 测试场景 | 步骤 | 验证点 |
|----------|------|--------|
| 完整打轴流程 | 新建项目→导入音频→输入歌词→打轴→导出LRC | 导出的LRC时间正确 |
| 项目保存恢复 | 打轴→保存→关闭→打开→继续编辑 | 数据完整一致 |
| 视频导出 | 导入视频→添加歌词→导出视频 | 视频可播放、歌词叠加正确 |
| 注音流程 | 输入中文歌词→一键注音→检查注音 | 注音准确率 > 80% |

### 11.5 性能测试

| 测试项 | 方法 | 通过标准 |
|--------|------|----------|
| Canvas渲染帧率 | Chrome DevTools Performance | 100字同屏 > 50fps |
| 波形生成速度 | Rust benchmark | 5分钟音频 < 3s |
| 视频导出速度 | 实测计时 | 1080p > 0.5x 实时 |
| 内存占用 | 系统监控 | 典型项目 < 200MB |
| 启动时间 | 计时工具 | 冷启动 < 1.5s |

### 11.6 手动测试清单

每个Phase结束后执行：

```
□ 视频导入：MP4(H.264) / MKV / MOV / WebM
□ 音频导入：MP3 / WAV / FLAC / AAC / OGG
□ 歌词输入：手动输入 / 粘贴 / 导入LRC / 导入TXT
□ 打轴：实时打轴 / Tap打轴 / 降速打轴
□ 编辑：拖拽时间标记 / 合并拆分字 / 批量调整
□ 样式：字体切换 / 颜色更改 / 描边调整 / 预设切换
□ 注音：中文拼音 / 日文假名 / 手动编辑注音
□ 导出：视频(MP4) / LRC / 增强LRC / JSON / ASS
□ 项目：保存 / 加载 / 自动保存 / 最近项目
□ 跨平台：Windows / macOS / Linux
```

---

## 12. 风险清单

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| **WebView视频格式兼容性**（Linux WebKitGTK不支持H.264） | 中 | 高 | 导入时自动转码为浏览器兼容格式；Linux下引导安装gstreamer |
| **FFmpeg依赖问题**（用户没有安装FFmpeg） | 高 | 中 | 首次导出时引导下载；支持系统包管理器安装说明 |
| **Canvas渲染性能不达标**（100字以上的复杂场景） | 中 | 中 | 脏矩形检测、离屏缓存、WebGL备选方案 |
| **Tauri生态不成熟**（遇到blocking bug） | 低 | 高 | 关键路径保留备选方案（如改用Electron的迁移成本评估） |
| **注音准确率不足**（多音字处理困难） | 高 | 低 | 允许手动编辑；V2引入更好的消歧算法 |
| **macOS代码签名困难** | 中 | 中 | 尽早（Phase 3）开始Apple Developer账号和证书申请 |
| **大文件（>4GB）处理问题** | 低 | 中 | 文档中建议先压缩视频；后期可加代理编辑模式 |
| **多语言UI翻译质量** | 低 | 低 | 初始仅中英文；社区贡献其他语言 |

---

## 附录A：每个Phase的文件交付物

### Phase 0
- 项目骨架（完整目录结构）
- `package.json` / `Cargo.toml` / `tauri.conf.json`
- CI配置文件（`.github/workflows/`）
- 基础UI组件（Layout, MenuBar, StatusBar）

### Phase 1
- `src-tauri/src/engine/media/probe.rs`
- `src-tauri/src/engine/media/waveform.rs`
- `src-tauri/src/commands/media.rs`
- `src/components/media/VideoPlayer.tsx`
- `src/components/media/MediaPanel.tsx`
- `src/services/textParser.ts`
- `src/services/charSplitter.ts`
- `src/components/lyrics/LyricTextEditor.tsx`
- `src/components/lyrics/LyricsOverlay.tsx`
- `src/engine/CanvasRenderer.ts`（基础版）
- `src/store/mediaSlice.ts`
- `src/store/lyricsSlice.ts`

### Phase 2
- `src/engine/CanvasRenderer.ts`（完整版）
- `src/store/timingSlice.ts`
- `src/hooks/useTimingMode.ts`
- `src/hooks/useKeyboard.ts`
- `src/components/timeline/TimelinePanel.tsx`
- `src/components/timeline/TimeRuler.tsx`
- `src/components/timeline/WaveformDisplay.tsx`
- `src/components/timeline/TimingTrack.tsx`

### Phase 3
- `src/engine/CanvasRenderer.ts`（效果完整版）
- `src/engine/TextLayout.ts`
- `src/engine/SweepEffect.ts`
- `src/engine/TextStyle.ts`
- `src/components/style/StylePanel.tsx`
- `src/components/style/ColorPicker.tsx`
- `src/components/style/FontPicker.tsx`
- `src/store/styleSlice.ts`

### Phase 4
- `src-tauri/src/engine/pronunciation/`（整个模块）
- `src-tauri/dictionaries/`（词典文件）
- `src-tauri/src/commands/pronunciation.rs`
- `src/components/pronunciation/PronunciationPanel.tsx`
- `src/engine/PronunciationRenderer.ts`
- `src/services/pronunciationService.ts`

### Phase 5
- `src-tauri/src/engine/export/`（整个模块）
- `src-tauri/src/commands/export.rs`
- `src-tauri/src/commands/project.rs`
- `src/components/export/ExportDialog.tsx`
- `src/components/export/ExportProgress.tsx`
- `src/services/exportService.ts`
- `src/store/projectSlice.ts`

### Phase 6
- 各模块优化和Bug修复
- `src/hooks/useUndoRedo.ts`
- 用户引导组件
- 帮助文档组件

### Phase 7
- 打包配置（各平台installer配置）
- 自动更新配置
- 用户手册
- 示例项目文件

---

## 附录B：推荐开发顺序

对于单人开发或小团队，建议按以下顺序推进（括号内为预估人天）：

```
Week 1-2:  Phase 0 全部 (10d)
Week 3-6:  Phase 1 全部 (20d)
Week 7-10: Phase 2 打轴引擎部分 (15d)
Week 11-12: Phase 2 时间线面板部分 (10d)
Week 13-16: Phase 3 扫色渲染 (20d)
Week 17-18: Phase 4 注音系统Rust端 (10d)
Week 19-20: Phase 4 注音系统前端 (10d)
Week 21-24: Phase 5 导出Rust端 (15d)
Week 25-26: Phase 5 导出前端 + 项目IO (10d)
Week 27-29: Phase 6 完善打磨 (15d)
Week 30-32: Phase 7 跨平台适配发布 (15d)
```

如果有多人协作，Phase 4和Phase 5的Rust端可以和前端并行开发。

---

## 附录C：技术资源参考

| 资源 | 用途 |
|------|------|
| [Tauri v2 Documentation](https://v2.tauri.app/) | Tauri框架官方文档 |
| [Tauri Concepts](https://v2.tauri.app/concepts/) | 进程模型、IPC、安全等核心概念 |
| [FFmpeg Documentation](https://ffmpeg.org/documentation.html) | FFmpeg命令行/滤镜参考 |
| [FFmpeg ASS/subtitles filter](https://ffmpeg.org/ffmpeg-filters.html#subtitles-1) | ASS字幕滤镜（逐字扫色渲染方案） |
| [ASS Specification](http://moodub.free.fr/video/ass-specs.doc) | ASS字幕格式规范（\k / \K / \kf 标签参考） |
| [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) | Canvas绘图API参考 |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | 音频处理（精确计时、节拍器） |
| [Symphonia](https://github.com/pdeljanov/Symphonia) | Rust音频解码库 |
| [CC-CEDICT](https://cc-cedict.org/wiki/) | 中文词典（拼音数据源） |
| [JMDict](https://www.edrdg.org/jmdict/j_jmdict.html) | 日文词典（假名数据源） |
