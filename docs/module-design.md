# 模块设计详细说明

## 目录

1. [前端模块概览](#1-前端模块概览)
2. [Canvas渲染引擎](#2-canvas渲染引擎)
3. [歌词编辑模块](#3-歌词编辑模块)
4. [打轴引擎](#4-打轴引擎)
5. [音频波形模块](#5-音频波形模块)
6. [视频播放模块](#6-视频播放模块)
7. [时间线面板](#7-时间线面板)
8. [注音引擎](#8-注音引擎)
9. [样式管理模块](#9-样式管理模块)
10. [项目IO模块（Rust）](#10-项目io模块rust)
11. [导出引擎（Rust）](#11-导出引擎rust)
12. [媒体引擎（Rust）](#12-媒体引擎rust)
13. [状态管理设计](#13-状态管理设计)

---

## 1. 前端模块概览

### 1.1 React组件树

```
<App>
├── <TitleBar />                          # 自定义标题栏（可选，macOS用原生）
├── <MenuBar />                           # 菜单栏
│   ├── File (新建/打开/保存/导出/最近项目)
│   ├── Edit (撤销/重做/查找替换)
│   ├── View (面板布局/缩放/全屏)
│   ├── Timing (打轴设置/模式切换)
│   ├── Style (样式预设/字体/颜色)
│   ├── Tools (注音/批量操作)
│   └── Help (帮助/关于)
│
├── <MainLayout>                          # 主布局（可拖拽面板）
│   ├── <LeftPanel>                       # 左侧面板组
│   │   ├── <MediaPanel />               #   媒体库/文件信息
│   │   └── <LyricTextEditor />          #   歌词文本编辑器
│   │
│   ├── <CenterPanel>                     # 中央面板组
│   │   ├── <PreviewArea>                #   预览区
│   │   │   ├── <VideoPlayer />          #     视频播放器
│   │   │   └── <LyricsOverlay />        #     歌词Canvas叠加层
│   │   └── <TimelinePanel>              #   时间线面板
│   │       ├── <TimeRuler />            #     时间刻度尺
│   │       ├── <WaveformDisplay />      #     波形图显示
│   │       └── <TimingTrack />          #     打轴标记轨道
│   │
│   └── <RightPanel>                     # 右侧面板组
│       ├── <StylePanel />               #   样式编辑
│       ├── <TimingPanel />              #   打轴控制/属性
│       ├── <PronunciationPanel />       #   注音编辑
│       ├── <ExportPanel />              #   导出设置
│       └── <PropertyPanel />            #   属性检查器（选中字符/行详情）
│
├── <StatusBar />                         # 状态栏
│   ├── 播放状态 / 时间码
│   ├── 打轴模式指示
│   ├── 项目修改标记
│   └── 导出进度
│
└── <Dialogs />                           # 模态对话框容器
    ├── <NewProjectDialog />
    ├── <ExportDialog />
    ├── <SettingsDialog />
    ├── <ShortcutEditor />
    └── <AboutDialog />
```

### 1.2 目录结构

```
src/
├── main.tsx                              # React入口
├── App.tsx                               # 根组件
├── vite-env.d.ts
│
├── components/                           # React组件
│   ├── layout/                           #   布局组件
│   │   ├── MainLayout.tsx               #     主布局（可拖拽面板）
│   │   ├── PanelContainer.tsx           #     面板容器（封装react-rnd）
│   │   ├── TitleBar.tsx                 #     自定义标题栏
│   │   ├── MenuBar.tsx                  #     菜单栏
│   │   └── StatusBar.tsx                #     状态栏
│   │
│   ├── media/                            #   媒体相关
│   │   ├── VideoPlayer.tsx              #     视频播放器
│   │   ├── AudioPlayer.ts               #     音频控制hook
│   │   ├── MediaPanel.tsx               #     媒体信息面板
│   │   └── ImportDialog.tsx             #     导入对话框
│   │
│   ├── lyrics/                           #   歌词相关
│   │   ├── LyricTextEditor.tsx          #     歌词文本编辑器
│   │   ├── LyricsOverlay.tsx            #     歌词Canvas叠加层
│   │   ├── LyricLine.tsx                #     单行歌词编辑组件
│   │   └── CharEditor.tsx               #     单字编辑组件
│   │
│   ├── timeline/                         #   时间线相关
│   │   ├── TimelinePanel.tsx            #     时间线面板
│   │   ├── TimeRuler.tsx                #     时间刻度尺
│   │   ├── WaveformDisplay.tsx          #     波形显示
│   │   ├── TimingTrack.tsx              #     打轴轨道
│   │   └── TimingMarker.tsx             #     时间标记
│   │
│   ├── style/                            #   样式相关
│   │   ├── StylePanel.tsx               #     样式编辑面板
│   │   ├── FontPicker.tsx               #     字体选择器
│   │   ├── ColorPicker.tsx              #     颜色选择器（RGBA）
│   │   ├── EffectControls.tsx           #     效果控件（描边/阴影/发光）
│   │   └── StylePresetManager.tsx       #     样式预设管理
│   │
│   ├── pronunciation/                    #   注音相关
│   │   ├── PronunciationPanel.tsx       #     注音编辑面板
│   │   └── PinyinEditor.tsx             #     拼音编辑器
│   │
│   ├── export/                           #   导出相关
│   │   ├── ExportDialog.tsx             #     导出对话框
│   │   └── ExportProgress.tsx           #     导出进度条
│   │
│   └── common/                           #   通用组件
│       ├── Button.tsx
│       ├── Slider.tsx
│       ├── Dropdown.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Tooltip.tsx
│       ├── ContextMenu.tsx
│       └── HotkeyInput.tsx              #     快捷键输入器
│
├── engine/                               # 渲染引擎（纯逻辑，非React）
│   ├── CanvasRenderer.ts                #   Canvas渲染主控
│   ├── TextLayout.ts                    #   文字排版计算
│   ├── SweepEffect.ts                   #   扫色效果计算
│   ├── TextStyle.ts                     #   文字样式应用
│   ├── PronunciationRenderer.ts         #   注音渲染
│   └── PerformanceMonitor.ts            #   性能监控
│
├── store/                                # Zustand状态管理
│   ├── index.ts                         #   store组合
│   ├── mediaSlice.ts                    #   媒体状态
│   ├── lyricsSlice.ts                   #   歌词状态
│   ├── timingSlice.ts                   #   打轴状态
│   ├── styleSlice.ts                    #   样式状态
│   ├── projectSlice.ts                  #   项目状态
│   └── uiSlice.ts                       #   UI状态
│
├── services/                             # 业务逻辑层
│   ├── textParser.ts                    #   文本解析（LRC/SRT/ASS/纯文本）
│   ├── charSplitter.ts                  #   分字/分词逻辑
│   ├── timeCalculator.ts               #   时间计算/分配
│   ├── pronunciationService.ts         #   注音服务
│   ├── exportService.ts                #   导出服务封装
│   └── ipcBridge.ts                    #   Tauri IPC桥接封装
│
├── hooks/                                # 自定义React Hooks
│   ├── useVideoSync.ts                 #   视频同步hook
│   ├── usePlayback.ts                  #   播放控制hook
│   ├── useTimingMode.ts               #   打轴模式hook
│   ├── useKeyboard.ts                  #   全局键盘事件hook
│   ├── useCanvasRenderer.ts           #   Canvas渲染hook
│   ├── useWaveform.ts                  #   波形数据hook
│   ├── useAutoSave.ts                  #   自动保存hook
│   └── useUndoRedo.ts                  #   撤销重做hook
│
├── utils/                                # 工具函数
│   ├── timeFormat.ts                   #   时间格式化
│   ├── color.ts                        #   颜色处理（RGBA/HEX/HSL转换）
│   ├── uuid.ts                         #   UUID生成
│   ├── deepClone.ts                    #   深拷贝
│   └── debounce.ts                     #   防抖
│
└── types/                                # TypeScript类型定义
    ├── lyrics.ts                        #   歌词类型
    ├── media.ts                         #   媒体类型
    ├── style.ts                         #   样式类型
    ├── project.ts                       #   项目类型
    ├── export.ts                        #   导出类型
    └── ipc.ts                           #   IPC类型
```

### 1.3 Rust后端目录结构

```
src-tauri/
├── Cargo.toml
├── tauri.conf.json
├── build.rs
│
├── src/
│   ├── main.rs                          #   入口
│   ├── lib.rs                           #   库根
│   │
│   ├── commands/                        #   Tauri命令处理器
│   │   ├── mod.rs
│   │   ├── media.rs                     #     媒体相关命令
│   │   ├── project.rs                   #     项目IO命令
│   │   ├── export.rs                    #     导出命令
│   │   ├── pronunciation.rs            #     注音命令
│   │   └── system.rs                    #     系统命令
│   │
│   ├── engine/                          #   核心引擎
│   │   ├── mod.rs
│   │   ├── media/                       #     媒体引擎
│   │   │   ├── mod.rs
│   │   │   ├── probe.rs               #       媒体探测（格式/编码/时长）
│   │   │   ├── waveform.rs            #       波形生成
│   │   │   ├── thumbnail.rs           #       缩略图生成
│   │   │   └── transcode.rs           #       转码
│   │   │
│   │   ├── export/                      #     导出引擎
│   │   │   ├── mod.rs
│   │   │   ├── video_exporter.rs      #       视频导出（ASS滤镜方案）
│   │   │   ├── ass_generator.rs       #       ASS字幕内容生成（歌词→ASS）
│   │   │   ├── lrc_exporter.rs        #       LRC导出
│   │   │   ├── json_exporter.rs       #       JSON导出
│   │   │   ├── ass_exporter.rs        #       ASS文件导出
│   │   │   └── ffmpeg_pipeline.rs     #       FFmpeg进程管理与进度解析
│   │   │
│   │   └── pronunciation/              #     注音引擎
│   │       ├── mod.rs
│   │       ├── dictionary.rs          #       词典加载与查询
│   │       ├── pinyin.rs              #       拼音转换
│   │       ├── furigana.rs            #       假名转换
│   │       └── tokenizer.rs           #       分词器
│   │
│   ├── models/                          #   数据模型（Rust）
│   │   ├── mod.rs
│   │   ├── project.rs
│   │   ├── lyrics.rs
│   │   └── media.rs
│   │
│   └── utils/                           #   工具
│       ├── mod.rs
│       ├── encoding.rs                 #     编码检测
│       └── file_lock.rs               #     文件锁
│
├── dictionaries/                        #   内置注音词典
│   ├── pinyin_dict.bincode             #     拼音词典（编译时嵌入）
│   └── furigana_dict.bincode          #     假名词典（编译时嵌入）
│
└── icons/                               #   应用图标
    ├── icon.ico
    ├── icon.icns
    └── icon.png
```

---

## 2. Canvas渲染引擎

这是最重要的前端模块，负责在Canvas上绘制歌词及扫色动画。

### 2.1 CanvasRenderer 类

```typescript
class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number;                      // devicePixelRatio

  // 离屏Canvas缓存
  private backgroundCache: OffscreenCanvas | null;
  private staticCache: OffscreenCanvas | null;

  // 性能相关
  private lastFrameTime: number;
  private frameCount: number;
  private fps: number;

  // 当前渲染状态
  private currentTime: number;
  private lines: LyricLine[];
  private style: LyricStyle;

  constructor(canvas: HTMLCanvasElement) { ... }

  /** 每帧调用，绘制完整画面 */
  render(currentTime: number, lines: LyricLine[], style: LyricStyle): void {
    this.currentTime = currentTime;
    this.lines = lines;
    this.style = style;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. 清屏
    ctx.clearRect(0, 0, w, h);

    // 2. 绘制视频帧（如果需要，由VideoPlayer合成层负责）
    //    通常情况下Canvas是叠加在video上的透明层

    // 3. 确定可见行范围
    const visibleLines = this.getVisibleLines();

    // 4. 逐行绘制
    for (const line of visibleLines) {
      this.renderLine(line, line.styleOverride ?? style);
    }

    // 5. 绘制安全区（可选）
    if (this.showSafeArea) {
      this.renderSafeArea();
    }

    // 6. FPS统计
    this.updateFPS();
  }

  /** 绘制单行歌词 */
  private renderLine(line: LyricLine, style: LyricStyle): void {
    const ctx = this.ctx;
    const layout = style.layout;

    // 计算该行的位置
    const linePos = TextLayout.calculateLinePosition(
      line, style, this.canvas.width, this.canvas.height
    );

    // 绘制背景条
    if (style.backgroundBar.enabled) {
      this.renderBackgroundBar(linePos, style.backgroundBar);
    }

    // 绘制每个字的扫色效果
    let xOffset = linePos.startX;
    for (const char of line.characters) {
      const charStyle = { ...style, ...char.styleOverride };
      const charWidth = TextLayout.measureCharWidth(char, charStyle);

      // 判断是否需要绘制（在可见区域内）
      if (xOffset + charWidth > 0 && xOffset < this.canvas.width) {
        this.renderChar(char, xOffset, linePos.y, charWidth, linePos.height, charStyle);
      }

      xOffset += charWidth + charStyle.font.letterSpacing;
    }

    // 绘制该行的注音
    if (style.pronunciationStyle) {
      this.renderPronunciationForLine(line, linePos, style);
    }
  }

  /** 绘制单个字（含扫色效果） */
  private renderChar(
    char: LyricChar,
    x: number,
    y: number,
    width: number,
    height: number,
    style: LyricStyle
  ): void {
    const ctx = this.ctx;
    const fillRatio = this.calculateFillRatio(char, this.currentTime, style);
    const sweepDir = char.fillDirection ?? style.sweep.direction;
    const gradientWidth = style.sweep.gradientWidth;

    ctx.save();

    // === 阴影（使用 strokeText 偏移替代 shadowBlur，避免性能杀手） ===
    if (style.shadow.enabled) {
      const shadowAlpha = style.shadow.color.a;
      const shadowColor = rgbaToString({ ...style.shadow.color, a: 1 });
      // 2-3 层偏移叠加模拟模糊效果
      // 内层实心：无模糊的核心阴影
      ctx.fillStyle = rgbaToString({ ...style.shadow.color });
      ctx.fillText(char.text, x + style.shadow.offsetX, y + height + style.shadow.offsetY);
      // 外层半透明：模拟模糊扩散（仅当 blur > 0）
      if (style.shadow.blur > 0) {
        ctx.globalAlpha = shadowAlpha * 0.3;
        const spread = Math.ceil(style.shadow.blur / 2);
        for (let i = -spread; i <= spread; i += Math.max(1, spread)) {
          for (let j = -spread; j <= spread; j += Math.max(1, spread)) {
            if (i === 0 && j === 0) continue;
            ctx.fillText(char.text,
              x + style.shadow.offsetX + i,
              y + height + style.shadow.offsetY + j);
          }
        }
        ctx.globalAlpha = 1;
      }
    }

    // === 描边 ===
    if (style.outline.enabled) {
      ctx.strokeStyle = rgbaToString(style.outline.color);
      ctx.lineWidth = style.outline.width;
      ctx.lineJoin = 'round';
      // 通过多次偏移 strokeText 模拟外描边，避免依赖 shadowBlur
      const strokeCount = Math.ceil(style.outline.width);
      for (let sx = -strokeCount; sx <= strokeCount; sx++) {
        for (let sy = -strokeCount; sy <= strokeCount; sy++) {
          if (Math.abs(sx) + Math.abs(sy) > strokeCount * 1.5) continue;
          ctx.strokeText(char.text, x + sx, y + height + sy);
        }
      }
    }

    // === 绘制文字（两次：未唱+已唱） ===
    ctx.font = buildFontString(style.font);
    ctx.textBaseline = 'alphabetic';

    // 裁剪区域计算
    const clipRect = this.calculateClipRect(x, y, width, height, fillRatio, sweepDir);

    // 1. 先绘制未唱颜色（整个文字）
    ctx.fillStyle = rgbaToString(style.unsungColor);
    ctx.fillText(char.text, x, y + height);

    // 2. 使用裁剪区域绘制已唱颜色
    ctx.save();
    ctx.beginPath();
    ctx.rect(clipRect.x, clipRect.y, clipRect.w, clipRect.h);
    ctx.clip();

    // 如果有渐变过渡带
    if (gradientWidth > 0 && fillRatio > 0 && fillRatio < 1) {
      const gradient = this.createSweepGradient(
        x, y, width, height, fillRatio, gradientWidth, sweepDir, style
      );
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = rgbaToString(style.sungColor);
    }

    ctx.fillText(char.text, x, y + height);

    ctx.restore();

    // === 发光效果（用多次半透明 strokeText 逐级放大模拟，避免 shadowBlur） ===
    if (style.glow.enabled && fillRatio > 0) {
      const glowColor = style.glow.color;
      const steps = Math.ceil(style.glow.radius * style.glow.intensity);
      for (let i = 1; i <= steps; i++) {
        const alpha = glowColor.a * (1 - i / steps) * 0.5;
        ctx.strokeStyle = rgbaToString({ ...glowColor, a: alpha });
        ctx.lineWidth = i * 1.5;
        ctx.lineJoin = 'round';
        ctx.strokeText(char.text, x, y + height);
      }
    }

    ctx.restore();
  }

  /** 计算填充比例 */
  private calculateFillRatio(
    char: LyricChar,
    currentTime: number,
    style: LyricStyle
  ): number {
    if (char.startTime === null || char.endTime === null) return 0;

    const raw = clamp(
      (currentTime - char.startTime) / (char.endTime - char.startTime),
      0, 1
    );

    // 应用缓动曲线
    return applyEasing(raw, char.easing ?? style.sweep.defaultEasing);
  }

  /** 计算裁剪矩形（用于扫色） */
  private calculateClipRect(
    x: number, y: number, width: number, height: number,
    fillRatio: number, direction: FillDirection
  ): { x: number; y: number; w: number; h: number } {
    switch (direction) {
      case 'left-to-right':
        return { x: x, y: y - 10, w: width * fillRatio, h: height + 20 };
      case 'right-to-left':
        return { x: x + width * (1 - fillRatio), y: y - 10,
                 w: width * fillRatio, h: height + 20 };
      case 'top-to-bottom':
        return { x: x - 10, y: y, w: width + 20, h: height * fillRatio };
      case 'bottom-to-top':
        return { x: x - 10, y: y + height * (1 - fillRatio),
                 w: width + 20, h: height * fillRatio };
    }
  }

  /** 创建扫色渐变 */
  private createSweepGradient(
    x: number, y: number, width: number, height: number,
    fillRatio: number, gradientWidth: number,
    direction: FillDirection, style: LyricStyle
  ): CanvasGradient {
    // 计算渐变起止坐标
    const { x0, y0, x1, y1 } = this.getGradientCoords(
      x, y, width, height, fillRatio, gradientWidth, direction
    );

    const gradient = this.ctx.createLinearGradient(x0, y0, x1, y1);
    gradient.addColorStop(0, rgbaToString(style.sungColor));
    gradient.addColorStop(1, rgbaToString(style.unsungColor));
    return gradient;
  }
}
```

### 2.2 渲染循环

```typescript
class RenderLoop {
  private renderer: CanvasRenderer;
  private animationId: number | null = null;
  private isRunning: boolean = false;

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private tick = (): void => {
    if (!this.isRunning) return;

    const currentTime = this.getCurrentPlaybackTime(); // 从store获取
    const lines = this.getVisibleLines();               // 从store获取
    const style = this.getActiveStyle();                // 从store获取

    // 只在有变化时渲染
    if (this.hasChanged(currentTime, lines, style)) {
      this.renderer.render(currentTime, lines, style);
    }

    this.animationId = requestAnimationFrame(this.tick);
  };

  private hasChanged(time: number, lines: LyricLine[], style: LyricStyle): boolean {
    // 播放中总是渲染；暂停且无变化时跳过
    if (this.isPlaying) return true;
    return time !== this.lastTime
      || lines !== this.lastLines
      || style !== this.lastStyle;
  }
}
```

### 2.3 文字排版模块（TextLayout）

```typescript
namespace TextLayout {
  /** 计算一行歌词的布局信息 */
  function calculateLinePosition(
    line: LyricLine,
    style: LyricStyle,
    canvasWidth: number,
    canvasHeight: number
  ): LineLayout {
    const layout = style.layout;
    const safeMargin = layout.safeAreaMargin;

    // 计算整行的宽度
    const totalWidth = calculateLineWidth(line, style);

    // 水平位置
    let startX: number;
    switch (layout.horizontalAlign) {
      case 'left':
        startX = safeMargin;
        break;
      case 'center':
        startX = (canvasWidth - totalWidth) / 2;
        break;
      case 'right':
        startX = canvasWidth - totalWidth - safeMargin;
        break;
    }

    // 垂直位置
    let y: number;
    if (layout.customYPercent !== null) {
      y = (canvasHeight * layout.customYPercent) / 100;
    } else {
      switch (layout.verticalAlign) {
        case 'top':
          y = safeMargin;
          break;
        case 'center':
          y = (canvasHeight - getLineHeight(style)) / 2;
          break;
        case 'bottom':
          y = canvasHeight - getLineHeight(style) - safeMargin;
          break;
      }
    }

    // 多行偏移（根据行索引计算）
    const lineIndexOffset = calculateLineOffset(line, layout.lineDisplayMode);
    y += lineIndexOffset * (getLineHeight(style) + style.font.lineSpacing);

    return {
      startX,
      y,
      width: totalWidth,
      height: getLineHeight(style),
    };
  }

  /** 度量单个字的宽度 */
  function measureCharWidth(char: LyricChar, style: LyricStyle): number {
    // 使用缓存的度量结果
    const cacheKey = `${char.text}_${style.font.family}_${style.font.size}_${style.font.weight}_${style.font.italic}`;
    if (measureCache.has(cacheKey)) {
      return measureCache.get(cacheKey)!;
    }

    const ctx = getMeasureContext();
    ctx.font = buildFontString(style.font);
    const metrics = ctx.measureText(char.text);
    const width = metrics.width;

    measureCache.set(cacheKey, width);
    return width;
  }

  /** 计算一行中所有字的布局（横排） */
  function layoutLineHorizontal(
    line: LyricLine,
    style: LyricStyle
  ): CharLayout[] {
    let x = 0;
    const layouts: CharLayout[] = [];

    for (const char of line.characters) {
      const width = measureCharWidth(char, style);
      layouts.push({
        char,
        x,
        y: 0,
        width,
        height: style.font.size,
      });
      x += width + style.font.letterSpacing;
    }

    return layouts;
  }

  /** 竖向排版（竖排模式） */
  function layoutLineVertical(
    line: LyricLine,
    style: LyricStyle
  ): CharLayout[] {
    let y = 0;
    const layouts: CharLayout[] = [];

    for (const char of line.characters) {
      const height = style.font.size; // 竖排时每字等高
      layouts.push({
        char,
        x: 0,
        y,
        width: style.font.size,
        height,
      });
      y += height + style.font.lineSpacing;
    }

    return layouts;
  }
}

interface LineLayout {
  startX: number;
  y: number;
  width: number;
  height: number;
}

interface CharLayout {
  char: LyricChar;
  x: number;       // 相对于行起始的X偏移
  y: number;       // 相对于行起始的Y偏移
  width: number;
  height: number;
}
```

---

## 3. 歌词编辑模块

### 3.1 文本解析器（textParser.ts）

```typescript
class TextParser {
  /**
   * 解析导入的文本，识别格式并返回结构化数据
   */
  static parse(input: string, fileName?: string): ParseResult {
    // 1. 编码检测与转换（在Rust端完成，这里假设已经是UTF-8字符串）
    // 2. 格式检测
    const format = this.detectFormat(input);
    // 3. 按格式解析
    switch (format) {
      case 'lrc':  return this.parseLRC(input);
      case 'srt':  return this.parseSRT(input);
      case 'ass':  return this.parseASS(input);
      case 'plain':
      default:      return this.parsePlain(input);
    }
  }

  private static detectFormat(input: string): TextFormat {
    const trimmed = input.trim();

    // LRC检测: 有 [mm:ss.xx] 时间标签
    if (/^\[(\d{2}):(\d{2})\.(\d{2,3})\]/.test(trimmed)) return 'lrc';

    // SRT检测: 有序号+时间范围
    if (/^\d+\s*\n\d{2}:\d{2}:\d{2}[.,]\d{3}\s*-->/.test(trimmed)) return 'srt';

    // ASS检测: 有 [Script Info] 或 [V4+ Styles]
    if (/^\[Script Info\]/m.test(trimmed) || /^\[V4\+ Styles\]/m.test(trimmed)) return 'ass';

    return 'plain';
  }

  private static parseLRC(input: string): ParseResult {
    const lines = input.split(/\r?\n/);
    const metadata: Record<string, string> = {};
    const lyricLines: LyricLineData[] = [];

    const TIME_TAG_RE = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
    const META_TAG_RE = /^\[(ti|ar|al|by|offset|re):(.+)\]$/i;

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed) { lyricLines.push({ text: '', isBlank: true }); continue; }

      // 元数据标签
      const metaMatch = trimmed.match(META_TAG_RE);
      if (metaMatch) {
        metadata[metaMatch[1].toLowerCase()] = metaMatch[2].trim();
        continue;
      }

      // 时间标签 + 文本
      const times: number[] = [];
      let match: RegExpExecArray | null;
      TIME_TAG_RE.lastIndex = 0;
      while ((match = TIME_TAG_RE.exec(trimmed)) !== null) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const centiseconds = parseInt(match[3], 10);
        times.push(minutes * 60000 + seconds * 1000 + centiseconds * 10);
      }

      // 提取纯文本（去除所有 [mm:ss.xx] 和 <mm:ss.xx> 标签）
      let text = trimmed.replace(/\[(\d{2}):(\d{2})\.(\d{2,3})\]/g, '');
      text = text.replace(/<(\d{2}):(\d{2})\.(\d{2,3})>/g, '').trim();

      lyricLines.push({
        text,
        startTime: times[0] ?? null,
        rawLine: trimmed,
        isBlank: false,
      });
    }

    return {
      format: 'lrc',
      metadata,
      lines: lyricLines,
    };
  }

  private static parsePlain(input: string): ParseResult {
    const rawLines = input.split(/\r?\n/);
    const lines: LyricLineData[] = [];

    for (const raw of rawLines) {
      const text = raw.trim();
      if (!text) {
        // 保留一个空行标记
        if (lines.length > 0 && !lines[lines.length - 1].isBlank) {
          lines.push({ text: '', isBlank: true });
        }
      } else {
        lines.push({ text, isBlank: false });
      }
    }

    // 去除首尾空行
    while (lines.length > 0 && lines[0].isBlank) lines.shift();
    while (lines.length > 0 && lines[lines.length - 1].isBlank) lines.pop();

    return { format: 'plain', lines };
  }
}

interface ParseResult {
  format: TextFormat;
  metadata?: Record<string, string>;
  lines: LyricLineData[];
}

interface LyricLineData {
  text: string;
  startTime?: number | null;
  isBlank: boolean;
  rawLine?: string;
}

type TextFormat = 'lrc' | 'srt' | 'ass' | 'plain';
```

### 3.2 分字器（charSplitter.ts）

```typescript
class CharSplitter {
  /**
   * 将一行文本分割为逐字/逐词单元
   */
  static split(text: string, language: Language): LyricCharData[] {
    if (!text.trim()) return [];

    const chars: LyricCharData[] = [];

    switch (language) {
      case 'zh-CN':
      case 'zh-TW':
        return this.splitChinese(text);
      case 'ja':
        return this.splitJapanese(text);
      case 'ko':
        return this.splitKorean(text);
      default:
        return this.splitByWord(text);
    }
  }

  /** 中文逐字分割 */
  private static splitChinese(text: string): LyricCharData[] {
    const chars: LyricCharData[] = [];

    // 逐个字符处理
    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      // 跳过空格
      if (char === ' ' || char === '　') {
        chars.push({ text: ' ', isPunctuation: false, isSpace: true });
        continue;
      }

      // 英文/数字序列作为一个词
      if (/[a-zA-Z0-9]/.test(char)) {
        let word = char;
        let j = i + 1;
        while (j < text.length && /[a-zA-Z0-9]/.test(text[j])) {
          word += text[j];
          j++;
        }
        i = j - 1;
        chars.push({ text: word, isPunctuation: false, isSpace: false });
        continue;
      }

      // 标点符号
      if (isPunctuation(char)) {
        // 如果前一个字存在，标点附加到前一个字
        if (chars.length > 0 && !chars[chars.length - 1].isSpace) {
          chars[chars.length - 1].text += char;
        } else {
          chars.push({ text: char, isPunctuation: true, isSpace: false });
        }
        continue;
      }

      // 汉字/假名/韩文：每个字符独立
      chars.push({ text: char, isPunctuation: false, isSpace: false });
    }

    return chars;
  }

  /** 日文分割（可以调整为按词分割） */
  private static splitJapanese(text: string): LyricCharData[] {
    // V1: 逐字分割（类似中文）
    // V2: 使用分词器按词分割
    return this.splitChinese(text); // 复用同样的逻辑
  }

  /** 韩文分割 */
  private static splitKorean(text: string): LyricCharData[] {
    return this.splitChinese(text);
  }

  /** 英文/按词分割 */
  private static splitByWord(text: string): LyricCharData[] {
    const words = text.split(/(\s+)/);
    const chars: LyricCharData[] = [];

    for (const word of words) {
      if (word.trim() === '') {
        chars.push({ text: word, isPunctuation: false, isSpace: true });
      } else {
        // 分离词尾标点
        const match = word.match(/^(.+?)([.,!?;:'"]+)$/);
        if (match) {
          chars.push({ text: match[1], isPunctuation: false, isSpace: false });
          chars.push({ text: match[2], isPunctuation: true, isSpace: false });
        } else {
          chars.push({ text: word, isPunctuation: false, isSpace: false });
        }
      }
    }

    return chars;
  }
}

interface LyricCharData {
  text: string;
  isPunctuation: boolean;
  isSpace: boolean;
}

type Language = 'zh-CN' | 'zh-TW' | 'ja' | 'ko' | 'en' | 'auto';
```

### 3.3 撤销/重做系统

```typescript
class UndoManager {
  private undoStack: UndoEntry[] = [];
  private redoStack: UndoEntry[] = [];
  private maxStackSize: number = 100;

  /** 记录一个操作 */
  push(entry: UndoEntry): void {
    this.undoStack.push(entry);
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }
    // 新操作清空重做栈
    this.redoStack = [];
  }

  /** 撤销 */
  undo(): UndoEntry | null {
    const entry = this.undoStack.pop();
    if (entry) {
      this.redoStack.push(entry);
    }
    return entry ?? null;
  }

  /** 重做 */
  redo(): UndoEntry | null {
    const entry = this.redoStack.pop();
    if (entry) {
      this.undoStack.push(entry);
    }
    return entry ?? null;
  }

  canUndo(): boolean { return this.undoStack.length > 0; }
  canRedo(): boolean { return this.redoStack.length > 0; }
}
```

---

## 4. 打轴引擎

### 4.1 打轴状态机

```typescript
type TimingState =
  | 'IDLE'
  | 'PLAYING_AND_MARKING'   // 正在播放+等待按键
  | 'PAUSED'                // 暂停中
  | 'PLAYING'               // 纯播放（不打轴）
  | 'COMPLETED';            // 所有字已标记完

class TimingEngine {
  private state: TimingState = 'IDLE';
  private store: UseStore;
  private timingStrategy: TimingStrategy = 'REALTIME';

  /** 处理打轴按键 */
  handleMarkKey(currentTime: number): void {
    switch (this.state) {
      case 'IDLE':
        this.startMarking(currentTime);
        break;

      case 'PLAYING_AND_MARKING':
        this.markCurrentChar(currentTime);
        break;

      case 'PAUSED':
        this.resumeMarking(currentTime);
        break;

      case 'PLAYING':
        // 在纯播放模式下按打轴键 -> 切换到打轴模式
        this.state = 'PLAYING_AND_MARKING';
        this.markCurrentChar(currentTime);
        break;
    }
  }

  /** 处理暂停键 */
  handlePause(): void {
    if (this.state === 'PLAYING_AND_MARKING') {
      this.state = 'PAUSED';
      this.store.setPlaying(false);
    }
  }

  /** 处理退格键（撤销上一个标记）—— 在 PAUSED 和 PLAYING_AND_MARKING 状态均可工作 */
  handleUndoMark(currentTime: number): void {
    if (this.state === 'IDLE' || this.state === 'COMPLETED') return;

    const { lines } = this.store.getState().lyrics;
    const { currentMarkIndex } = this.store.getState().timing;

    if (currentMarkIndex > 0) {
      const newIndex = currentMarkIndex - 1;
      const char = this.getCharByGlobalIndex(lines, newIndex);
      if (char) {
        // 清除该字及后续所有字的时间标记（连锁撤销）
        this.store.updateCharTiming(char.id, null, null);
        this.store.setCurrentMarkIndex(newIndex);

        // 如果在播放中撤销，回退音频到上一个字的 startTime
        if (this.state === 'PLAYING_AND_MARKING' && char.startTime !== null) {
          this.store.setSeekTarget(char.startTime);
        }
      }
    }
  }

  /** 标记当前行为间奏行并跳到下一行 */
  handleSkipLine(): void {
    const { lines, selectedLineIndex } = this.store.getState().lyrics;
    const { currentMarkIndex } = this.store.getState().timing;
    if (selectedLineIndex < 0 || selectedLineIndex >= lines.length) return;
    this.store.updateLine(lines[selectedLineIndex].id, { isSkipped: true });
    // 跳到下一个非间奏行的第一个字
    this.advanceToNextNonSkippedLine(selectedLineIndex);
  }

  /** 标记当前字 */
  private markCurrentChar(currentTime: number): void {
    const { lines } = this.store.getState().lyrics;
    const { currentMarkIndex, leadIn } = this.store.getState().timing;

    const char = this.getCharByGlobalIndex(lines, currentMarkIndex);
    if (!char) {
      // 所有字已标记完
      this.state = 'COMPLETED';
      this.store.setPlaying(false);
      return;
    }

    // 应用提前量
    const adjustedTime = currentTime + leadIn;

    // 应用吸附
    const snappedTime = this.applySnap(adjustedTime);

    // 设置当前字的结束时间
    this.store.updateCharTiming(char.id, char.startTime, snappedTime);

    // 游标前进
    const nextIndex = currentMarkIndex + 1;
    const nextChar = this.getCharByGlobalIndex(lines, nextIndex);

    if (nextChar) {
      // 设置下一个字的开始时间
      this.store.updateCharTiming(nextChar.id, snappedTime, null);
      this.store.setCurrentMarkIndex(nextIndex);
    } else {
      this.state = 'COMPLETED';
      this.store.setPlaying(false);
    }
  }

  /** 应用吸附 */
  private applySnap(time: number): number {
    const { snapMode, snapStrength } = this.store.getState().timing;
    if (snapMode === 'none') return time;

    if (snapMode === 'waveform_peak') {
      // 在 ±snapStrength ms 内找到最近的波形峰值
      const peaks = this.store.getState().media.waveformData;
      return this.snapToNearestPeak(time, peaks, snapStrength);
    }

    if (snapMode === 'beat') {
      const bpm = this.store.getState().lyrics.timeline?.bpm;
      if (bpm) {
        const beatIntervalMs = 60000 / bpm;
        return Math.round(time / beatIntervalMs) * beatIntervalMs;
      }
    }

    return time;
  }

  /** 吸附到最近的波形峰值 */
  private snapToNearestPeak(
    time: number, peaks: number[], strengthMs: number
  ): number {
    const sampleRate = this.store.getState().media.waveformSampleRate || 100;
    const startIdx = Math.max(0, Math.floor((time - strengthMs) / sampleRate));
    const endIdx = Math.min(
      peaks.length - 1,
      Math.ceil((time + strengthMs) / sampleRate)
    );

    let maxPeak = -Infinity;
    let maxPeakTime = time;

    for (let i = startIdx; i <= endIdx; i++) {
      if (Math.abs(peaks[i]) > maxPeak) {
        maxPeak = Math.abs(peaks[i]);
        maxPeakTime = i * sampleRate;
      }
    }

    return maxPeakTime;
  }

  /** 获取全局索引对应的字 */
  private getCharByGlobalIndex(
    lines: LyricLine[], globalIndex: number
  ): LyricChar | null {
    let count = 0;
    for (const line of lines) {
      for (const char of line.characters) {
        if (char.isSpace || char.isPunctuation) continue;
        if (count === globalIndex) return char;
        count++;
      }
    }
    return null;
  }

  /** 开始打轴——为第一个字设置 startTime */
  private startMarking(currentTime: number): void {
    const { lines } = this.store.getState().lyrics;
    const firstChar = this.getCharByGlobalIndex(lines, 0);
    if (!firstChar) return;

    const adjusted = this.applySnap(currentTime);
    this.store.updateCharTiming(firstChar.id, adjusted, null);
    this.store.setCurrentMarkIndex(0);
    this.store.setPlaying(true);
    this.state = 'PLAYING_AND_MARKING';
  }

  /** 恢复打轴（从 PAUSED 状态） */
  private resumeMarking(currentTime: number): void {
    this.store.setPlaying(true);
    this.state = 'PLAYING_AND_MARKING';
  }

  /** 跳转到下一个非间奏行 */
  private advanceToNextNonSkippedLine(fromIndex: number): void {
    const { lines } = this.store.getState().lyrics;
    for (let i = fromIndex + 1; i < lines.length; i++) {
      if (!lines[i].isSkipped) {
        this.store.selectLine(i);
        const firstChar = lines[i].characters.find(c => !c.isSpace && !c.isPunctuation);
        if (firstChar) {
          this.store.setCurrentMarkIndex(this.getGlobalIndex(lines, firstChar.id));
        }
        return;
      }
    }
  }

  /** 获取指定 charId 的全局索引 */
  private getGlobalIndex(lines: LyricLine[], charId: string): number {
    let count = 0;
    for (const line of lines) {
      for (const char of line.characters) {
        if (char.isSpace || char.isPunctuation) continue;
        if (char.id === charId) return count;
        count++;
      }
    }
    return -1;
  }
}

/** 打轴策略类型 */
type TimingStrategy = 'REALTIME' | 'TAP' | 'SENTENCE_DISTRIBUTE';
```

---

## 5. 音频波形模块

### 5.1 波形数据生成（Rust端）

```rust
// src-tauri/src/engine/media/waveform.rs

use symphonia::core::audio::SampleBuffer;
use symphonia::core::codecs::DecoderOptions;
use symphonia::core::formats::FormatOptions;
use symphonia::core::io::MediaSourceStream;
use symphonia::core::meta::MetadataOptions;
use symphonia::core::probe::Hint;
use std::fs::File;

pub struct WaveformData {
    /// 归一化峰值数组 [-1.0, 1.0]
    pub peaks: Vec<f32>,
    /// 音频总时长（毫秒）
    pub duration_ms: u64,
    /// 采样率
    pub sample_rate: u32,
    /// 声道数
    pub channels: u16,
}

/// 生成用于时间线显示的波形数据
///
/// # Arguments
/// * `file_path` - 音频文件路径
/// * `pixels_per_second` - 每秒钟音频对应的像素数
/// * `target_width` - 目标显示宽度（像素）
///
/// # Returns
/// WaveformData 波形峰值数组，长度 = target_width
pub fn generate_waveform(
    file_path: &str,
    pixels_per_second: f32,
    target_width: u32,
) -> Result<WaveformData, Box<dyn std::error::Error>> {
    let file = File::open(file_path)?;
    let mss = MediaSourceStream::new(Box::new(file), Default::default());

    let hint = Hint::new();
    let format_opts = FormatOptions::default();
    let metadata_opts = MetadataOptions::default();
    let decoder_opts = DecoderOptions::default();

    let probed = symphonia::default::get_probe().format(&hint, mss, &format_opts, &metadata_opts)?;
    let mut format = probed.format;

    // 找到第一个音频轨
    let track = format
        .tracks()
        .iter()
        .find(|t| t.codec_params.codec != symphonia::core::codecs::CODEC_TYPE_NULL)
        .ok_or("No audio track found")?;

    let track_id = track.id;
    let codec_params = track.codec_params.clone();
    let sample_rate = codec_params.sample_rate.unwrap_or(44100);
    let channels = codec_params.channels.unwrap_or(2).count() as u16;

    let mut decoder = symphonia::default::get_codecs().make(&codec_params, &decoder_opts)?;

    // 计算需要的采样精度
    let total_duration_sec = if let Some(n_frames) = codec_params.n_frames {
        n_frames as f64 / sample_rate as f64
    } else {
        // 如果没有总帧数信息，基于文件大小估算
        300.0  // 默认5分钟
    };

    let samples_per_peak = (sample_rate as f32 / pixels_per_second) as usize;
    let total_peaks = (total_duration_sec * pixels_per_second as f64) as usize;

    let mut peaks: Vec<f32> = vec![0.0; total_peaks.min(target_width as usize)];
    let mut peak_index: usize = 0;
    let mut sample_count: usize = 0;
    let mut current_max: f32 = 0.0;
    let mut total_samples_processed: u64 = 0;

    // 解码并计算峰值
    loop {
        let packet = match format.next_packet() {
            Ok(packet) => packet,
            Err(_) => break,
        };

        if packet.track_id() != track_id {
            continue;
        }

        let decoded = match decoder.decode(&packet) {
            Ok(decoded) => decoded,
            Err(_) => continue,
        };

        let spec = *decoded.spec();
        let duration = decoded.capacity() as u64;

        let mut sample_buf = SampleBuffer::<f32>::new(duration, spec);
        sample_buf.copy_interleaved_ref(decoded);

        for sample in sample_buf.samples() {
            let abs_val = sample.abs();
            if abs_val > current_max {
                current_max = abs_val;
            }
            sample_count += 1;

            if sample_count >= samples_per_peak {
                if peak_index < peaks.len() {
                    peaks[peak_index] = current_max;
                }
                peak_index += 1;
                sample_count = 0;
                current_max = 0.0;
            }
        }

        total_samples_processed += duration;
    }

    // 计算实际时长
    let duration_ms = (total_samples_processed as f64 / sample_rate as f64 * 1000.0) as u64;

    Ok(WaveformData {
        peaks,
        duration_ms,
        sample_rate,
        channels,
    })
}
```

### 5.2 波形显示组件（前端）

```typescript
class WaveformRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  /** 绘制波形 */
  render(
    peaks: number[],
    duration: number,
    currentTime: number,
    zoomLevel: number,
    scrollOffset: number,
    timingLines: TimingLine[],
  ): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 计算可视范围
    const visibleStartMs = scrollOffset;
    const visibleEndMs = scrollOffset + (duration / zoomLevel);
    const visibleDurationMs = visibleEndMs - visibleStartMs;

    // 波形颜色
    const waveColor = '#4A9EFF';
    const playedColor = '#FF4444';

    const centerY = h / 2;
    const samplesPerPixel = peaks.length / w * zoomLevel;
    const startSample = Math.floor(scrollOffset / duration * peaks.length);

    // 当前播放位置线
    const playheadX = ((currentTime - visibleStartMs) / visibleDurationMs) * w;

    // 批量绘制以提高性能
    ctx.beginPath();

    for (let px = 0; px < w; px++) {
      const sampleIdx = Math.floor(startSample + px * samplesPerPixel);
      if (sampleIdx >= peaks.length) break;

      const amplitude = peaks[sampleIdx] * centerY * 0.9;
      const x = px;

      // 已播放部分用不同颜色
      ctx.strokeStyle = x < playheadX ? playedColor : waveColor;
      ctx.moveTo(x, centerY - amplitude);
      ctx.lineTo(x, centerY + amplitude);
    }

    ctx.stroke();

    // 绘制播放头
    if (playheadX >= 0 && playheadX <= w) {
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, h);
      ctx.stroke();
    }

    // 绘制打轴标记线
    for (const mark of timingLines) {
      const markX = ((mark.time - visibleStartMs) / visibleDurationMs) * w;
      if (markX >= 0 && markX <= w) {
        ctx.strokeStyle = mark.color;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(markX, 0);
        ctx.lineTo(markX, h);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }
}
```

---

## 6. 视频播放模块

### 6.0 时间源架构（关键设计）

**问题**：HTML5 `video.currentTime` 精度不足（~250ms更新间隔），且 seek 后可能跳变。不适合需要精确计时的打轴和扫色场景。

**解决方案**：使用 **Web Audio API** 的 `AudioContext.currentTime` 作为精确时钟源，但需要通过 **PlaybackClock** 类将其映射到视频播放位置。

#### 关键认知：AudioContext.currentTime ≠ 视频播放位置

`AudioContext.currentTime` 是从 AudioContext 创建时刻开始单调递增的硬件时钟——它**不会在暂停时停止，也不会在 seek 时跳转**。直接将 `ctx.currentTime * 1000` 用作播放时间会导致：
1. 暂停时时间继续推进（用户看到歌词持续扫色）
2. seek 后时间偏移错乱（AudioContext 不感知 `video.currentTime` 被设置）
3. 降速播放时 AudioContext 仍以 1x 前进（0.5x 播放时扫色速度快两倍）

#### PlaybackClock：双锚点时钟追踪系统

```typescript
/**
 * PlaybackClock — 将 AudioContext 单调时钟映射到视频/音频播放位置。
 *
 * 核心原理：维护"基底视频时间"和"基底音频时钟时间"两个锚点。
 * Seek/Pause/Resume/PlaybackRate 变化时重新锚定，确保时间始终正确。
 *
 * 真实播放位置 = baseVideoTime + (audioCtx.currentTime - baseAudioTime) * playbackRate
 */
class PlaybackClock {
  private audioCtx: AudioContext;
  private baseVideoTime: number = 0;   // 锚点：上一次 seek/恢复时的视频位置(ms)
  private baseAudioTime: number = 0;   // 锚点：对应时刻的 audioCtx.currentTime(ms)
  private playbackRate: number = 1.0;
  private isPlaying: boolean = false;
  private frozenTime: number = 0;      // 暂停时冻结的时间(ms)

  constructor(audioCtx: AudioContext) {
    this.audioCtx = audioCtx;
  }

  /** 获取当前精确播放位置（毫秒） */
  getCurrentTimeMs(): number {
    if (!this.isPlaying) {
      return this.frozenTime;
    }
    const elapsed = (this.audioCtx.currentTime * 1000 - this.baseAudioTime) * this.playbackRate;
    return this.baseVideoTime + elapsed;
  }

  /** Seek：重新锚定到新的视频位置 */
  seekTo(videoTimeMs: number): void {
    this.baseVideoTime = videoTimeMs;
    this.baseAudioTime = this.audioCtx.currentTime * 1000;
    this.frozenTime = videoTimeMs;
  }

  /** 开始播放/从暂停恢复 */
  play(): void {
    if (this.isPlaying) return;
    // 重新锚定：baseVideoTime = 当前冻结时间，baseAudioTime = 当前 audioCtx 时间
    this.baseVideoTime = this.frozenTime;
    this.baseAudioTime = this.audioCtx.currentTime * 1000;
    this.isPlaying = true;
  }

  /** 暂停 */
  pause(): void {
    if (!this.isPlaying) return;
    // 冻结当前计算出的时间
    this.frozenTime = this.getCurrentTimeMs();
    this.isPlaying = false;
  }

  /** 设置播放速率 */
  setPlaybackRate(rate: number): void {
    // 重锚点以避免速率变化导致的时间跳变
    this.frozenTime = this.getCurrentTimeMs();
    this.baseVideoTime = this.frozenTime;
    this.baseAudioTime = this.audioCtx.currentTime * 1000;
    this.playbackRate = rate;
  }

  reset(): void {
    this.baseVideoTime = 0;
    this.baseAudioTime = this.audioCtx.currentTime * 1000;
    this.frozenTime = 0;
    this.isPlaying = false;
    this.playbackRate = 1.0;
  }
}
```

#### 渲染循环中的使用

```typescript
// 将 video 元素连接到 AudioContext
const audioCtx = new AudioContext();
const source = audioCtx.createMediaElementSource(videoElement);
source.connect(audioCtx.destination);

const clock = new PlaybackClock(audioCtx);

// Seek 事件 → 重新锚定
videoElement.addEventListener('seeked', () => {
  clock.seekTo(videoElement.currentTime * 1000);
});

// 渲染循环使用 PlaybackClock 获取正确时间
function renderLoop() {
  const preciseTimeMs = clock.getCurrentTimeMs();
  store.setCurrentTime(preciseTimeMs);
  canvasRenderer.render(preciseTimeMs, lyrics, style);
  requestAnimationFrame(renderLoop);
}

// 播放/暂停通过 PlaybackClock 管理
function onPlay()  { clock.play();  store.setPlaying(true);  }
function onPause() { clock.pause(); store.setPlaying(false); }
```

**平台兼容性**：Web Audio API 在所有主流 WebView 中均支持（WebView2/WKWebView/WebKitGTK）。Firefox 指纹保护降精度模式下仍有 2ms 精度，对歌词扫色（100-500ms/字）完全够用。

### 6.1 VideoPlayer组件（含纯音频回退路径）

```typescript
interface VideoPlayerProps {
  videoPath: string | null;
  audioPath: string | null;  // 纯音频导入（无视频轨道）
}

function VideoPlayer({ videoPath, audioPath }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);        // 纯音频回退元素
  const clockRef = useRef<PlaybackClock | null>(null);
  const store = useStore();
  const isAudioOnly = !videoPath && !!audioPath;

  // 根据媒体类型选择播放元素
  const getMediaElement = (): HTMLMediaElement | null =>
    videoRef.current ?? audioRef.current;

  // 初始化 AudioContext + PlaybackClock
  useEffect(() => {
    const mediaEl = getMediaElement();
    if (!mediaEl) return;

    const initClock = () => {
      if (clockRef.current) return;
      const ctx = new AudioContext();
      const source = ctx.createMediaElementSource(mediaEl);
      source.connect(ctx.destination);
      clockRef.current = new PlaybackClock(ctx);
    };

    mediaEl.addEventListener('play', initClock, { once: true });
    return () => mediaEl.removeEventListener('play', initClock);
  }, [videoPath, audioPath]);

  // Seek 事件 → PlaybackClock 重新锚定
  useEffect(() => {
    const mediaEl = getMediaElement();
    if (!mediaEl) return;
    const onSeeked = () => {
      clockRef.current?.seekTo(mediaEl.currentTime * 1000);
    };
    mediaEl.addEventListener('seeked', onSeeked);
    return () => mediaEl.removeEventListener('seeked', onSeeked);
  }, [videoPath, audioPath]);

  // 渲染循环：通过 PlaybackClock 获取精确时间
  useEffect(() => {
    let animId: number;
    const loop = () => {
      const clock = clockRef.current;
      const mediaEl = getMediaElement();
      if (clock && mediaEl && !mediaEl.paused) {
        store.setCurrentTime(clock.getCurrentTimeMs());
      } else if (mediaEl) {
        // 还未初始化 AudioContext 时回退到 mediaEl.currentTime
        store.setCurrentTime(mediaEl.currentTime * 1000);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // 播放/暂停 → PlaybackClock 同步
  useEffect(() => {
    const mediaEl = getMediaElement();
    if (!mediaEl) return;
    const onPlay  = () => { clockRef.current?.play();  store.setPlaying(true);  };
    const onPause = () => { clockRef.current?.pause(); store.setPlaying(false); };
    mediaEl.addEventListener('play', onPlay);
    mediaEl.addEventListener('pause', onPause);
    return () => {
      mediaEl.removeEventListener('play', onPlay);
      mediaEl.removeEventListener('pause', onPause);
    };
  }, [videoPath, audioPath]);

  // 外部 seek → 同步到媒体元素
  useEffect(() => {
    const mediaEl = getMediaElement();
    if (!mediaEl) return;
    const target = store.seekTarget;
    if (target !== null && Math.abs(mediaEl.currentTime * 1000 - target) > 50) {
      mediaEl.currentTime = target / 1000;
      store.clearSeekTarget();
    }
  }, [store.seekTarget]);

  // 外部播放/暂停控制
  useEffect(() => {
    const mediaEl = getMediaElement();
    if (!mediaEl) return;
    if (store.isPlaying && mediaEl.paused) mediaEl.play().catch(() => {});
    else if (!store.isPlaying && !mediaEl.paused) mediaEl.pause();
  }, [store.isPlaying]);

  // 播放速度同步
  useEffect(() => {
    const mediaEl = getMediaElement();
    if (mediaEl) {
      mediaEl.playbackRate = store.playbackSpeed;
      clockRef.current?.setPlaybackRate(store.playbackSpeed);
    }
  }, [store.playbackSpeed]);

  // 错误状态处理
  const [loadError, setLoadError] = useState<string | null>(null);
  const handleError = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    const el = e.currentTarget;
    const code = el.error?.code;
    const messages: Record<number, string> = {
      1: '媒体加载被用户中止',
      2: '网络错误',
      3: '媒体解码失败——文件可能已损坏或编码格式不支持',
      4: '媒体文件未找到或格式不受支持',
    };
    setLoadError(messages[code ?? 0] || `播放错误 (code: ${code})`);
  };

  if (!videoPath && !audioPath) {
    return <div className="no-media-placeholder">请导入视频或音频文件</div>;
  }

  if (loadError) {
    return <div className="media-error">媒体错误：{loadError}</div>;
  }

  // 纯音频模式：隐藏 <audio> + Canvas 歌词叠加
  if (isAudioOnly) {
    return (
      <audio
        ref={audioRef}
        src={convertFileSrc(audioPath!)}
        preload="auto"
        onError={handleError}
      />
    );
  }

  // 视频模式：<video> + Canvas 歌词叠加
  return (
    <video
      ref={videoRef}
      src={convertFileSrc(videoPath!)}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      crossOrigin="anonymous"
      preload="auto"
      onError={handleError}
    />
  );
}
```

### 6.2 视频兼容性检测与转码

```rust
// Rust端：检测视频是否需要转码
pub fn check_video_compatibility(path: &str) -> VideoCompatResult {
    // 使用ffprobe探测编码
    let output = Command::new("ffprobe")
        .args(["-v", "quiet", "-print_format", "json", "-show_streams", path])
        .output()?;

    let info: FFprobeOutput = serde_json::from_slice(&output.stdout)?;

    let video_stream = info.streams.iter()
        .find(|s| s.codec_type == "video");

    let codec = video_stream.map(|s| s.codec_name.as_str()).unwrap_or("unknown");

    // 检查编码器是否被WebView支持
    let supported = matches!(codec, "h264" | "avc1");
    // Linux下的额外检测...

    VideoCompatResult {
        needs_transcoding: !supported,
        codec: codec.to_string(),
        transcode_target: if !supported { Some("h264".to_string()) } else { None },
    }
}
```

---

## 7. 时间线面板

### 7.1 组件设计

时间线面板是多轨道的横向滚动+缩放视图：

```
┌──────────────────────────────────────────────────┐
│ [🔍-] [🔍+] [吸附: ▼] [BPM: 120] [⚙]           │  ← 工具栏
├──────────────────────────────────────────────────┤
│ 00:00│00:05│00:10│00:15│00:20│00:25│00:30│00:35│  ← 时间刻度尺
│     │     │     │     │     │     │     │     │
├──────────────────────────────────────────────────┤
│ ▓▓▓▓▓░░░░▓▓▓▓▓▓░░░░▓▓▓▓▓▓▓░░░░░▓▓▓▓░░░░▓▓▓░░░│  ← 波形轨道
│                                                  │
├──────────────────────────────────────────────────┤
│ ═══════════           ═══════════════            │  ← 歌词行轨道
│ ─┬──┬──┬──┬─          ─┬──┬──┬──┬──┬──        │  ← 逐字标记轨道
├──────────────────────────────────────────────────┤
│ [前奏]──────────── [副歌]────────────            │  ← 段落标记轨道
└──────────────────────────────────────────────────┘
```

### 7.2 时间刻度尺

```typescript
function TimeRuler({
  duration,
  zoomLevel,
  scrollOffset,
}: {
  duration: number;
  zoomLevel: number;
  scrollOffset: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 根据缩放级别选择合适的刻度间隔
    const pixelsPerMs = (w / duration) * zoomLevel;
    const viewStartMs = scrollOffset;
    const viewEndMs = viewStartMs + duration / zoomLevel;

    // 自适应刻度间隔
    const majorInterval = calculateMajorInterval(viewEndMs - viewStartMs, w);
    const minorInterval = majorInterval / 5;

    // 绘制大刻度
    for (let t = Math.floor(viewStartMs / majorInterval) * majorInterval;
         t <= viewEndMs; t += majorInterval) {
      const x = ((t - viewStartMs) / (viewEndMs - viewStartMs)) * w;
      ctx.strokeStyle = '#888';
      ctx.beginPath();
      ctx.moveTo(x, h * 0.5);
      ctx.lineTo(x, h);
      ctx.stroke();

      // 时间标签
      ctx.fillStyle = '#ccc';
      ctx.font = '10px monospace';
      ctx.fillText(formatTime(t), x + 2, h * 0.45);
    }

    // 绘制小刻度
    for (let t = Math.floor(viewStartMs / minorInterval) * minorInterval;
         t <= viewEndMs; t += minorInterval) {
      if (Math.abs(t % majorInterval) < 0.001) continue; // 跳过大刻度位置
      const x = ((t - viewStartMs) / (viewEndMs - viewStartMs)) * w;
      ctx.strokeStyle = '#444';
      ctx.beginPath();
      ctx.moveTo(x, h * 0.75);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
  }, [duration, zoomLevel, scrollOffset]);

  return <canvas ref={canvasRef} className="time-ruler-canvas" />;
}
```

---

## 8. 注音引擎

### 8.1 词典结构（Rust端）

```rust
// src-tauri/src/engine/pronunciation/dictionary.rs

use std::collections::HashMap;
use serde::{Deserialize, Serialize};

/// 词典条目
#[derive(Debug, Serialize, Deserialize)]
pub struct DictEntry {
    /// 原文
    pub text: String,
    /// 读音（拼音/假名）
    pub reading: String,
    /// 声调（仅拼音，1-5）
    pub tone: Option<u8>,
    /// 使用频率（用于多音字消歧）
    pub frequency: u32,
}

/// 注音词典
pub struct PronunciationDict {
    /// 单字 → 读音列表（多音字有多个条目）
    char_dict: HashMap<String, Vec<DictEntry>>,
    /// 词组 → 读音（词组查询更准确）
    word_dict: HashMap<String, DictEntry>,
}

impl PronunciationDict {
    /// 从bincode字节加载
    pub fn load_from_bytes(bytes: &[u8]) -> Result<Self, bincode::Error> {
        bincode::deserialize(bytes)
    }

    /// 查询单个字的读音
    pub fn lookup_char(&self, text: &str, context: Option<&str>) -> Option<Pronunciation> {
        // 1. 先查词组（更准确）
        if let Some(context_text) = context {
            if let Some(entry) = self.word_dict.get(&format!("{}{}", context_text, text)) {
                return Some(Pronunciation::from_entry(entry));
            }
        }

        // 2. 查单字词典
        if let Some(entries) = self.char_dict.get(text) {
            // 按频率排序，返回最常见的读音
            let best = entries.iter()
                .max_by_key(|e| e.frequency)
                .unwrap();
            return Some(Pronunciation::from_entry(best));
        }

        None
    }

    /// 批量查询
    pub fn lookup_batch(
        &self,
        texts: &[(String, Option<String>)],
    ) -> Vec<Option<Pronunciation>> {
        texts.iter()
            .map(|(text, ctx)| self.lookup_char(text, ctx.as_deref()))
            .collect()
    }
}
```

### 8.2 拼音自动标注服务

```typescript
// 前端：注音服务封装

class PronunciationService {
  private cache: Map<string, Pronunciation | null> = new Map();

  /**
   * 为所有歌词行自动标注读音
   */
  async annotateAll(lines: LyricLine[], mode: PronunciationMode): Promise<void> {
    // 收集所有需要注音的字
    const charsToLookup: { charId: string; text: string; context: string | null }[] = [];

    for (const line of lines) {
      for (let i = 0; i < line.characters.length; i++) {
        const char = line.characters[i];
        if (char.isSpace || char.isPunctuation) continue;

        const context = i > 0 ? line.characters[i - 1].text : null;

        // 检查缓存
        const cacheKey = `${char.text}_${context}_${mode}`;
        if (!this.cache.has(cacheKey)) {
          charsToLookup.push({ charId: char.id, text: char.text, context });
        }
      }
    }

    // 批量查询（通过Tauri IPC到Rust端）
    const results = await invoke<{ id: string; pronunciation: Pronunciation | null }[]>(
      'pronunciation:annotate_batch',
      { chars: charsToLookup.map(c => ({ id: c.charId, text: c.text, context: c.context })), mode }
    );

    // 更新缓存
    for (const r of results) {
      this.cache.set(r.id, r.pronunciation);
    }
  }

  /**
   * 查询单个字
   */
  async lookup(text: string, mode: PronunciationMode): Promise<Pronunciation | null> {
    const cacheKey = `${text}_${mode}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

    const result = await invoke<Pronunciation | null>('pronunciation:lookup', { text, mode });
    this.cache.set(cacheKey, result);
    return result;
  }

  /** 清除缓存 */
  clearCache(): void {
    this.cache.clear();
  }
}
```

---

## 9. 样式管理模块

### 9.1 预设管理

```typescript
// 内置预设定义
const BUILT_IN_PRESETS: StylePreset[] = [
  {
    id: 'preset_classic_karaoke',
    name: '经典卡拉OK',
    isBuiltIn: true,
    style: {
      font: {
        family: 'Microsoft YaHei, sans-serif',
        size: 48,
        weight: 700,
        italic: false,
        letterSpacing: 4,
        lineSpacing: 16,
      },
      unsungColor: { r: 255, g: 255, b: 255, a: 1 },
      sungColor: { r: 255, g: 60, b: 60, a: 1 },
      sweep: {
        direction: 'left-to-right',
        gradientWidth: 3,
        gradientType: 'linear',
        defaultEasing: 'linear',
        sungGlow: false,
        animateScale: false,
        scaleAmount: 1.0,
      },
      outline: {
        enabled: true,
        width: 3,
        color: { r: 0, g: 0, b: 0, a: 1 },
        style: 'outer',
      },
      shadow: {
        enabled: true,
        offsetX: 2,
        offsetY: 2,
        blur: 4,
        color: { r: 0, g: 0, b: 0, a: 0.6 },
      },
      glow: { enabled: false, radius: 0, color: { r: 0, g: 0, b: 0, a: 0 }, intensity: 0 },
      backgroundBar: {
        enabled: true,
        color: { r: 0, g: 0, b: 0, a: 0.5 },
        heightMode: 'auto',
        fixedHeight: 60,
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 10,
        widthMode: 'text',
        fixedWidth: 800,
      },
      layout: {
        horizontalAlign: 'center',
        verticalAlign: 'center',
        customYPercent: 80,
        textDirection: 'horizontal',
        lineDisplayMode: 'single',
        safeAreaMargin: 20,
      },
      pronunciationStyle: {
        fontSizeRatio: 0.4,
        spacingRatio: 0.1,
        color: { r: 255, g: 255, b: 200, a: 0.9 },
        participateSweep: false,
        alignment: 'center',
      },
    },
  },
  // ...更多预设
];
```

---

## 10. 项目IO模块（Rust）

### 10.1 保存项目

```rust
// src-tauri/src/commands/project.rs

use tauri::command;
use std::fs;
use std::io::Write;
use zip::write::FileOptions;
use zip::ZipWriter;

#[command]
pub async fn save_project(
    path: String,
    data: String,  // JSON序列化的Project
) -> Result<(), String> {
    // 1. 验证数据
    let project: Project = serde_json::from_str(&data)
        .map_err(|e| format!("数据验证失败: {}", e))?;

    // 2. 创建临时文件
    let temp_path = format!("{}.tmp", path);
    let file = fs::File::create(&temp_path)
        .map_err(|e| format!("无法创建文件: {}", e))?;

    // 3. 写入ZIP
    let mut zip = ZipWriter::new(file);
    let options = FileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated);

    // 写入project.json
    zip.start_file("project.json", options)
        .map_err(|e| format!("ZIP错误: {}", e))?;
    zip.write_all(data.as_bytes())
        .map_err(|e| format!("写入错误: {}", e))?;

    // 写入媒体引用
    let media_ref = serde_json::to_string_pretty(&project.meta.media)
        .map_err(|e| format!("序列化错误: {}", e))?;
    zip.start_file("media/references.json", options)
        .map_err(|e| format!("ZIP错误: {}", e))?;
    zip.write_all(media_ref.as_bytes())
        .map_err(|e| format!("写入错误: {}", e))?;

    let _ = zip.finish();

    // 4. 原子替换
    fs::rename(&temp_path, &path)
        .map_err(|e| format!("保存失败: {}", e))?;

    Ok(())
}
```

### 10.2 加载项目

```rust
#[command]
pub async fn load_project(path: String) -> Result<String, String> {
    let file = fs::File::open(&path)
        .map_err(|e| format!("无法打开文件: {}", e))?;

    let mut archive = zip::ZipArchive::new(file)
        .map_err(|e| format!("无效的项目文件: {}", e))?;

    // 读取project.json
    let mut project_file = archive.by_name("project.json")
        .map_err(|_| "项目文件损坏：缺少 project.json".to_string())?;

    let mut data = String::new();
    project_file.read_to_string(&mut data)
        .map_err(|e| format!("读取错误: {}", e))?;

    // 验证JSON
    let project: Project = serde_json::from_str(&data)
        .map_err(|e| format!("项目数据格式错误: {}", e))?;

    // 版本检查
    let version_parts: Vec<u32> = project.meta.version
        .split('.')
        .filter_map(|s| s.parse().ok())
        .collect();

    let current_version = (1, 0, 0); // 当前支持的版本
    if version_parts.len() >= 2 {
        let (major, minor) = (version_parts[0], version_parts[1]);
        if major > current_version.0 {
            return Err(format!(
                "此项目由更新版本(v{})创建，请升级软件后打开",
                project.meta.version
            ));
        }
        if minor > current_version.1 {
            // 警告但不阻止
            log::warn!("项目包含此版本可能不支持的功能");
        }
    }

    Ok(data)
}
```

---

## 11. 导出引擎（Rust）

### 11.1 FFmpeg视频导出（ASS滤镜方案）

**设计决策**：经过调研确认，FFmpeg `drawtext` 滤镜无法实现逐字扫色（最小操作单位是整个字符串）。正确方案是**生成ASS字幕文件 + FFmpeg `ass` 滤镜渲染**。

```rust
// src-tauri/src/engine/export/video_exporter.rs

use std::process::Command;
use std::fs;

pub struct VideoExportConfig {
    pub input_video: String,
    pub output_path: String,
    pub width: u32,
    pub height: u32,
    pub frame_rate: f32,
    pub video_bitrate: String,     // 如 "8M"
    pub audio_bitrate: String,     // 如 "192k"
    pub encoder_preset: String,    // 如 "medium"
    pub lyrics_data: String,       // JSON歌词数据
    pub font_dir: Option<String>,  // 字体目录（可选）
}

/// 使用FFmpeg + ASS滤镜导出带卡拉OK字幕的视频
///
/// 流程：
///   1. 从歌词数据生成临时 ASS 文件（包含逐字 \\k 扫色标签）
///   2. 调用 ffmpeg -vf "ass=temp.ass" 渲染
///   3. 清理临时 ASS 文件
pub fn export_video(config: VideoExportConfig) -> Result<(), String> {
    let lyrics: Vec<LyricLineForExport> = parse_lyrics_for_export(&config.lyrics_data)?;

    // 1. 生成 ASS 内容
    let ass_content = generate_ass_content(&lyrics, &config);

    // 2. 写入临时 ASS 文件
    let ass_path = format!("{}.ass", config.output_path);
    fs::write(&ass_path, &ass_content)
        .map_err(|e| format!("无法写入临时ASS文件: {}", e))?;

    // 3. 构建 FFmpeg 命令
    let mut cmd = Command::new("ffmpeg");
    cmd.args(["-y", "-i", &config.input_video]);

    // ASS滤镜（支持逐字卡拉OK扫色）
    let ass_filter = if let Some(ref font_dir) = config.font_dir {
        format!("ass={}:fontsdir={}", ass_path, font_dir)
    } else {
        format!("ass={}", ass_path)
    };
    cmd.args(["-vf", &ass_filter]);

    // 视频编码
    cmd.args([
        "-c:v", "libx264",
        "-preset", &config.encoder_preset,
        "-b:v", &config.video_bitrate,
        "-s", &format!("{}x{}", config.width, config.height),
        "-r", &format!("{}", config.frame_rate),
    ]);
    // 音频编码
    cmd.args(["-c:a", "aac", "-b:a", &config.audio_bitrate]);
    cmd.arg(&config.output_path);

    // 4. 执行
    let output = cmd.output()
        .map_err(|e| format!("FFmpeg执行失败: {}. 请确认FFmpeg已安装", e))?;

    // 5. 清理临时文件
    let _ = fs::remove_file(&ass_path);

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("FFmpeg错误: {}", stderr));
    }

    Ok(())
}

/// 从歌词数据生成 ASS 字幕内容（含逐字 \\k 卡拉OK标签）
fn generate_ass_content(
    lyrics: &[LyricLineForExport],
    config: &VideoExportConfig,
) -> String {
    let mut ass = String::new();

    // === [Script Info] ===
    ass.push_str(&format!(
        "[Script Info]\n\
         ; Generated by Karaoke Lyrics Maker\n\
         Title: {}\n\
         ScriptType: v4.00+\n\
         PlayResX: {}\n\
         PlayResY: {}\n\
         WrapStyle: 0\n\
         ScaledBorderAndShadow: yes\n\n",
        "Karaoke Video", config.width, config.height
    ));

    // === [V4+ Styles] ===
    ass.push_str(
        "[V4+ Styles]\n\
         Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, \
         OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, \
         ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, \
         Alignment, MarginL, MarginR, MarginV, Encoding\n\
         Style: KLM,Microsoft YaHei,48,&H00FFFFFF,&H0000FFFF,&H00000000,\
         &H80000000,0,0,0,0,100,100,2,0,1,3,0,2,10,10,50,1\n\n"
    );

    // === [Events] ===
    ass.push_str(
        "[Events]\n\
         Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n"
    );

    for line in lyrics {
        let start = format_ass_time(line.start_time_ms);
        let end = format_ass_time(line.end_time_ms);

        // 行首显式设置 SecondaryColour（未填充色=\\2c）和 PrimaryColour（已填充色=\\1c）
        // 确保 \\k 标签的扫色行为确定（从未填充色过渡到已填充色）
        let unsung_bgr = rgba_to_ass_bgr(&line.unsung_color);
        let sung_bgr = rgba_to_ass_bgr(&line.sung_color);
        let mut ass_text = format!(
            "{{\\2c&{}}}{{\\1c&{}}}",
            unsung_bgr, sung_bgr
        );

        // 生成逐字 \\K 标签（平滑渐隐，比 \\k 更自然）
        for char in &line.characters {
            let duration_cs = ((char.end_time_ms - char.start_time_ms) / 10) as u32;
            ass_text.push_str(&format!(
                "{{\\K{}}}",
                duration_cs.max(1), // 至少1厘秒
            ));
            ass_text.push_str(&char.text);
        }

        ass.push_str(&format!(
            "Dialogue: 0,{},{},KLM,,0,0,0,,{}\n",
            start, end, ass_text
        ));
    }

    ass
}

/// 毫秒 → ASS时间格式 H:MM:SS.cc
fn format_ass_time(ms: u64) -> String {
    let total_secs = ms as f64 / 1000.0;
    let h = (total_secs / 3600.0) as u32;
    let m = ((total_secs % 3600.0) / 60.0) as u32;
    let s = total_secs % 60.0;
    format!("{}:{:02}:{:05.2}", h, m, s)
}

/// RGBA → ASS ABGR十六进制颜色（&HAABBGGRR）
/// **重要**：ASS 的 Alpha 通道是反的！
///   - RGBA 中 a=1.0 = 完全不透明
///   - ASS 中 &H00 = 完全不透明, &HFF = 完全透明
///   必须做 1.0 - alpha 反转
fn rgba_to_ass_bgr(color: &RGBA) -> String {
    let a_inverted = ((1.0 - color.a) * 255.0) as u8;
    format!("{:02X}{:02X}{:02X}{:02X}", a_inverted, color.b, color.g, color.r)
}
```

**ASS标签说明**：
- `\K<N>`：音节持续 N 厘秒，结束时带平滑渐隐过渡（推荐，比 `\k` 更自然）
- `\k<N>`：音节持续 N 厘秒，立即开始→立即结束（边界清晰但稍突兀）
- `\kf<N>`：扫色完成后渐隐，适合平滑的卡拉OK效果
- `\2c&HBBGGRR&`：SecondaryColour（未填充色），`\k/\K` 扫色的起始颜色
- `\1c&HBBGGRR&`：PrimaryColour（已填充色），`\k/\K` 扫色的目标颜色
- **Alpha 反转**：RGBA `a=1.0`=不透明，ASS `&H00`=不透明 `&HFF`=透明，需反转
- **标准语法**：`\kf123`（数字直接跟标签，不要加 `$` 等分隔符，否则参数解析失败）

如果需要完全复刻 Canvas 预览的渐变过渡带效果，使用 `\K` 标签替代 `\k`。

### 11.2 LRC导出

```rust
// src-tauri/src/engine/export/lrc_exporter.rs

pub fn export_lrc(
    path: &str,
    lines: &[LyricLineForExport],
    options: &LrcExportOptions,
) -> Result<(), String> {
    let mut output = String::new();

    // 元数据
    if options.include_metadata {
        if let Some(title) = &options.title {
            output.push_str(&format!("[ti:{}]\n", title));
        }
        if let Some(artist) = &options.artist {
            output.push_str(&format!("[ar:{}]\n", artist));
        }
        output.push_str("[by:Karaoke Lyrics Maker]\n\n");
    }

    // 歌词行
    for line in lines {
        if line.is_blank {
            output.push('\n');
            continue;
        }

        let time_tag = format_time_tag(line.start_time, options.time_format);

        if options.word_level {
            // 增强LRC：逐字时间标签
            let mut text_with_tags = String::new();
            for char in &line.characters {
                let char_time = format_time_tag(char.start_time, options.time_format);
                text_with_tags.push_str(&format!("{}{}", char_time, char.text));
            }
            output.push_str(&format!("{}{}\n", time_tag, text_with_tags));
        } else {
            // 标准LRC：仅行级时间
            output.push_str(&format!("{}{}\n", time_tag, line.text));
        }
    }

    // 写入文件
    let encoding = match options.encoding {
        "utf-8" => write_file_utf8(path, &output)?,
        "utf-16" => write_file_utf16(path, &output)?,
        "gbk" => write_file_gbk(path, &output)?,
        _ => write_file_utf8(path, &output)?,
    };

    Ok(())
}

fn format_time_tag(ms: u64, format: &TimeFormat) -> String {
    let total_secs = ms as f64 / 1000.0;
    let minutes = (total_secs / 60.0).floor() as u64;
    let seconds = (total_secs % 60.0).floor() as u64;

    match format {
        TimeFormat::Hundredths => {
            let hundredths = ((total_secs * 100.0).round() as u64) % 100;
            format!("[{:02}:{:02}.{:02}]", minutes, seconds, hundredths)
        }
        TimeFormat::Thousandths => {
            let thousandths = ((total_secs * 1000.0).round() as u64) % 1000;
            format!("[{:02}:{:02}.{:03}]", minutes, seconds, thousandths)
        }
    }
}
```

---

## 12. 媒体引擎（Rust）

### 12.1 媒体探测

```rust
// src-tauri/src/engine/media/probe.rs

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct MediaInfo {
    pub format_name: String,
    pub duration_ms: u64,
    pub bit_rate: u64,
    pub video_streams: Vec<VideoStreamInfo>,
    pub audio_streams: Vec<AudioStreamInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoStreamInfo {
    pub index: u32,
    pub codec_name: String,
    pub width: u32,
    pub height: u32,
    pub frame_rate: f32,
    pub bit_rate: u64,
    pub pixel_format: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AudioStreamInfo {
    pub index: u32,
    pub codec_name: String,
    pub sample_rate: u32,
    pub channels: u16,
    pub bit_rate: u64,
    pub channel_layout: String,
}

/// 使用ffprobe探测媒体文件信息
pub fn probe_media(path: &str) -> Result<MediaInfo, String> {
    let output = Command::new("ffprobe")
        .args([
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            path,
        ])
        .output()
        .map_err(|e| format!("无法执行ffprobe: {}", e))?;

    if !output.status.success() {
        return Err("ffprobe无法读取该文件".to_string());
    }

    let raw: serde_json::Value = serde_json::from_slice(&output.stdout)
        .map_err(|e| format!("解析媒体信息失败: {}", e))?;

    // 解析视频流
    let mut video_streams = Vec::new();
    let mut audio_streams = Vec::new();

    if let Some(streams) = raw["streams"].as_array() {
        for stream in streams {
            let codec_type = stream["codec_type"].as_str().unwrap_or("");

            match codec_type {
                "video" => {
                    let frame_rate_str = stream["r_frame_rate"].as_str().unwrap_or("30/1");
                    let frame_rate = parse_frame_rate(frame_rate_str);

                    video_streams.push(VideoStreamInfo {
                        index: stream["index"].as_u64().unwrap_or(0) as u32,
                        codec_name: stream["codec_name"].as_str().unwrap_or("unknown").to_string(),
                        width: stream["width"].as_u64().unwrap_or(0) as u32,
                        height: stream["height"].as_u64().unwrap_or(0) as u32,
                        frame_rate,
                        bit_rate: stream["bit_rate"].as_str()
                            .and_then(|s| s.parse().ok()).unwrap_or(0),
                        pixel_format: stream["pix_fmt"].as_str().unwrap_or("unknown").to_string(),
                    });
                }
                "audio" => {
                    audio_streams.push(AudioStreamInfo {
                        index: stream["index"].as_u64().unwrap_or(0) as u32,
                        codec_name: stream["codec_name"].as_str().unwrap_or("unknown").to_string(),
                        sample_rate: stream["sample_rate"].as_str()
                            .and_then(|s| s.parse().ok()).unwrap_or(44100),
                        channels: stream["channels"].as_u64().unwrap_or(2) as u16,
                        bit_rate: stream["bit_rate"].as_str()
                            .and_then(|s| s.parse().ok()).unwrap_or(0),
                        channel_layout: stream["channel_layout"].as_str()
                            .unwrap_or("stereo").to_string(),
                    });
                }
                _ => {}
            }
        }
    }

    let format = &raw["format"];
    let duration_str = format["duration"].as_str().unwrap_or("0");
    let duration_ms = (duration_str.parse::<f64>().unwrap_or(0.0) * 1000.0) as u64;

    Ok(MediaInfo {
        format_name: format["format_name"].as_str().unwrap_or("unknown").to_string(),
        duration_ms,
        bit_rate: format["bit_rate"].as_str()
            .and_then(|s| s.parse().ok()).unwrap_or(0),
        video_streams,
        audio_streams,
    })
}

fn parse_frame_rate(rate_str: &str) -> f32 {
    let parts: Vec<&str> = rate_str.split('/').collect();
    if parts.len() == 2 {
        let num: f32 = parts[0].parse().unwrap_or(30.0);
        let den: f32 = parts[1].parse().unwrap_or(1.0);
        num / den
    } else {
        parts[0].parse().unwrap_or(30.0)
    }
}
```

---

## 13. 状态管理设计

### 13.1 Zustand Store组合

```typescript
// src/store/index.ts

import { create } from 'zustand';
import { createMediaSlice, MediaSlice } from './mediaSlice';
import { createLyricsSlice, LyricsSlice } from './lyricsSlice';
import { createTimingSlice, TimingSlice } from './timingSlice';
import { createStyleSlice, StyleSlice } from './styleSlice';
import { createProjectSlice, ProjectSlice } from './projectSlice';
import { createUISlice, UISlice } from './uiSlice';

export type AppStore = MediaSlice & LyricsSlice & TimingSlice
  & StyleSlice & ProjectSlice & UISlice;

export const useStore = create<AppStore>()((...args) => ({
  ...createMediaSlice(...args),
  ...createLyricsSlice(...args),
  ...createTimingSlice(...args),
  ...createStyleSlice(...args),
  ...createProjectSlice(...args),
  ...createUISlice(...args),
}));
```

### 13.2 各Slice示例

```typescript
// src/store/lyricsSlice.ts

export interface LyricsSlice {
  lines: LyricLine[];
  selectedLineIndex: number;
  selectedCharIndex: number;
  pronunciationMode: PronunciationMode;
  language: Language;

  // Actions
  setLines: (lines: LyricLine[]) => void;
  updateLine: (lineId: string, updates: Partial<LyricLine>) => void;
  addLine: (afterIndex: number, text: string) => void;
  deleteLine: (lineId: string) => void;
  moveLine: (lineId: string, newIndex: number) => void;
  updateCharTiming: (charId: string, startTime: number | null, endTime: number | null) => void;
  updateCharPronunciation: (charId: string, pronunciation: Pronunciation | null) => void;
  setPronunciationMode: (mode: PronunciationMode) => void;
  selectLine: (index: number) => void;
  selectChar: (lineIndex: number, charIndex: number) => void;
}

export const createLyricsSlice = (set: any, get: any): LyricsSlice => ({
  lines: [],
  selectedLineIndex: -1,
  selectedCharIndex: -1,
  pronunciationMode: 'none',
  language: 'auto',

  setLines: (lines) => set({ lines }),

  updateLine: (lineId, updates) => set((state: LyricsSlice) => ({
    lines: state.lines.map(line =>
      line.id === lineId ? { ...line, ...updates } : line
    ),
  })),

  addLine: (afterIndex, text) => set((state: LyricsSlice) => {
    const newLine = createLyricLine(text, state.lines.length, state.pronunciationMode);
    const newLines = [...state.lines];
    newLines.splice(afterIndex + 1, 0, newLine);
    // 重新索引
    return { lines: reindexLines(newLines) };
  }),

  deleteLine: (lineId) => set((state: LyricsSlice) => ({
    lines: reindexLines(state.lines.filter(l => l.id !== lineId)),
  })),

  updateCharTiming: (charId, startTime, endTime) => set((state: LyricsSlice) => ({
    lines: state.lines.map(line => ({
      ...line,
      characters: line.characters.map(char =>
        char.id === charId ? { ...char, startTime, endTime } : char
      ),
    })),
  })),

  // ...其他actions
});
```

### 13.3 与Rust后端的交互模式

```typescript
// 前端通过invoke调用后端，并通过event监听异步事件

// 调用后端命令
const result = await invoke<T>('command_name', { arg1, arg2 });

// 监听后端事件
import { listen } from '@tauri-apps/api/event';

const unlisten = await listen<ExportProgress>('export:progress', (event) => {
  store.setExportProgress(event.payload);
});

// 组件卸载时取消监听
// unlisten();
```
