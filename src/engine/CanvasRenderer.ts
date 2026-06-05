import type { LyricLine } from "../types/lyrics";
import type {
  LyricStyle,
  FontConfig,
  ShadowConfig,
  GlowConfig,
  OutlineConfig,
  FillDirection,
} from "../types/style";
import {
  getFontString,
  calculateLinePosition,
  type CharLayout,
} from "./TextLayout";
import {
  calculateFillRatio,
  calculateClipRect,
  type EasingType,
  type ClipRect,
} from "./SweepEffect";
import { PronunciationRenderer } from "./PronunciationRenderer";

type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type CanvasType = HTMLCanvasElement | OffscreenCanvas;

/**
 * Cache key for text measurement.
 */
function measureKey(text: string, font: FontConfig): string {
  return `${font.family}|${font.size}|${font.weight}|${font.italic}|${text}`;
}

/**
 * CanvasRenderer — A full-featured karaoke lyrics renderer.
 *
 * Rendering pipeline per character:
 * 1. Shadow  (strokeText offset — no shadowBlur for performance)
 * 2. Glow    (multi-layer semi-transparent strokeText)
 * 3. Outline (multi-offset strokeText for outer border)
 * 4. Unsung fill
 * 5. Clip to sung region + sung fill
 */
export class CanvasRenderer {
  private canvas: CanvasType;
  private ctx: Ctx2D;
  private dpr: number;
  private measureCache: Map<string, number>;
  private pronunciationRenderer: PronunciationRenderer | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("CanvasRenderer: failed to get 2d context");
    }
    this.ctx = ctx;
    this.dpr = window.devicePixelRatio || 1;
    this.measureCache = new Map();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Main render entry-point.
   *
   * Clears the canvas, finds the active lyric line(s), and renders them
   * with the configured style.
   */
  render(currentTime: number, lines: LyricLine[], style: LyricStyle): void {
    const ctx = this.ctx;
    const w = this.canvas.width / this.dpr;
    const h = this.canvas.height / this.dpr;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Find active line
    const activeIdx = this.findActiveLine(lines, currentTime);
    if (activeIdx === -1) return;

    // Collect lines to render
    const linesToRender: LyricLine[] = [lines[activeIdx]];
    if (style.layout.dualLine && activeIdx + 1 < lines.length) {
      linesToRender.push(lines[activeIdx + 1]);
    }

    // Render background bar if enabled
    if (style.backgroundBar?.enabled) {
      this.renderBackgroundBar(linesToRender, style, w, h);
    }

    // Render each line
    for (let i = 0; i < linesToRender.length; i++) {
      const line = linesToRender[i];
      const isActive = i === 0;
      const scale = isActive
        ? style.layout.currentLineScale
        : style.layout.nextLineScale;

      // Build the line layout for positioning
      const layout = calculateLinePosition(line, style, w, h, ctx);

      // Apply line-level scaling for the non-active line
      ctx.save();
      if (scale !== 1 && !isActive) {
        const cx = layout.startX + layout.width / 2;
        const cy = layout.y + layout.height / 2;
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);
      }

      // Render each character in the line
      for (const cl of layout.chars) {
        this.renderChar(cl, currentTime, style);
      }

      ctx.restore();

      if (style.layout.dualLine && i === 0) {
        // The next line will be positioned below by calculateLinePosition
        // using verticalPosition; we offset by adding lineGap
      }
    }
  }

  /**
   * Measure a character's width, using an internal cache to avoid repeated
   * `measureText` calls between frames.
   */
  measureCharWidth(text: string, font: FontConfig): number {
    const key = measureKey(text, font);
    const cached = this.measureCache.get(key);
    if (cached !== undefined) return cached;

    const ctx = this.ctx;
    ctx.font = getFontString(font);
    const width = ctx.measureText(text).width;
    this.measureCache.set(key, width);
    return width;
  }

  /**
   * Clear the measurement cache. Call when font configuration changes
   * significantly to avoid stale entries.
   */
  clearMeasureCache(): void {
    this.measureCache.clear();
  }

  /**
   * Set (or clear) the pronunciation renderer for annotating characters.
   */
  setPronunciationRenderer(renderer: PronunciationRenderer | null): void {
    this.pronunciationRenderer = renderer;
  }

  /**
   * Update the device pixel ratio. Call on window resize or DPR change.
   */
  updateDpr(): void {
    this.dpr = window.devicePixelRatio || 1;
  }

  // ---------------------------------------------------------------------------
  // Line helpers
  // ---------------------------------------------------------------------------

  private findActiveLine(
    lines: LyricLine[],
    currentTime: number
  ): number {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const start = line.startTime;
      const end = line.endTime;
      if (currentTime >= start && (end === 0 || currentTime < end)) {
        return i;
      }
    }
    return -1;
  }

  // ---------------------------------------------------------------------------
  // Background bar
  // ---------------------------------------------------------------------------

  private renderBackgroundBar(
    linesToRender: LyricLine[],
    style: LyricStyle,
    canvasWidth: number,
    _canvasHeight: number
  ): void {
    const ctx = this.ctx;
    const bar = style.backgroundBar;

    // Calculate bounding box of all text in these lines
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const line of linesToRender) {
      const layout = calculateLinePosition(line, style, canvasWidth, 1, ctx);
      for (const cl of layout.chars) {
        const charWidth = this.measureCharWidth(cl.char.text, style.font);
        const right = cl.x + charWidth;
        if (cl.x < minX) minX = cl.x;
        if (right > maxX) maxX = right;
        if (cl.y < minY) minY = cl.y;
        if (cl.y + cl.height > maxY) maxY = cl.y + cl.height;
      }
    }

    if (!Number.isFinite(minX)) return;

    const pad = bar.padding;
    const rx = bar.borderRadius;

    ctx.save();
    ctx.globalAlpha = bar.opacity;
    ctx.fillStyle = bar.color;
    ctx.beginPath();
    this.roundRect(
      ctx,
      minX - pad,
      minY - pad,
      maxX - minX + pad * 2,
      maxY - minY + pad * 2,
      rx
    );
    ctx.fill();
    ctx.restore();
  }

  private roundRect(
    ctx: Ctx2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    r = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ---------------------------------------------------------------------------
  // Char rendering
  // ---------------------------------------------------------------------------

  private renderChar(
    cl: CharLayout,
    currentTime: number,
    style: LyricStyle
  ): void {
    const { char, x, y, width, height } = cl;

    // Skip spaces and empty text
    if (char.isSpace || char.text.length === 0) return;

    const ctx = this.ctx;

    // Set font once
    ctx.font = getFontString(style.font);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const text = char.text;

    // Resolve easing from char override or style default
    const easing = (char.easing as EasingType) || undefined;

    // Calculate fill ratio for this character
    const fillRatio = calculateFillRatio(char, currentTime, easing);

    // --- Effect layers applied to the full character area ---

    // Shadow (always renders, respects shadow.enabled inside)
    if (style.shadow.enabled) {
      this.renderShadow(text, x, y, style.shadow);
    }

    // Glow
    if (style.glow.enabled) {
      this.renderGlow(text, x, y, style.glow, fillRatio);
    }

    // Outline
    if (style.outline.enabled) {
      this.renderOutline(text, x, y, style.outline);
    }

    // --- Sweep (sung/unsung fill) ---

    if (fillRatio <= 0) {
      // Fully unsung
      ctx.save();
      ctx.fillStyle = style.unsungColor;
      ctx.fillText(text, x, y);
      ctx.restore();
    } else if (fillRatio >= 1) {
      // Fully sung
      ctx.save();
      ctx.fillStyle = style.sungColor;
      ctx.fillText(text, x, y);
      ctx.restore();
    } else {
      // Partially sung — clip the sung portion
      ctx.save();

      // 1. Draw unsung background
      ctx.fillStyle = style.unsungColor;
      ctx.fillText(text, x, y);

      // 2. Clip to sung region
      const clipRect: ClipRect = calculateClipRect(
        x,
        y,
        width,
        height,
        fillRatio,
        this.resolveDirection(style.sweep.direction)
      );
      ctx.beginPath();
      ctx.rect(clipRect.x, clipRect.y, clipRect.width, clipRect.height);
      ctx.clip();

      // 3. Draw sung text (only visible inside clip)
      ctx.fillStyle = style.sungColor;
      ctx.fillText(text, x, y);

      ctx.restore();
    }

    // Pronunciation annotation above the character
    if (this.pronunciationRenderer) {
      this.pronunciationRenderer.renderChar(
        ctx,
        char,
        x,
        y,
        width,
        style.font.size,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Shadow — strokeText offset simulation (no shadowBlur)
  // ---------------------------------------------------------------------------

  /**
   * Render a soft shadow using multiple offset strokeText calls with varying
   * opacity. 3 layers simulate Gaussian blur without the performance cost of
   * `shadowBlur`.
   */
  private renderShadow(
    text: string,
    x: number,
    y: number,
    shadow: ShadowConfig
  ): void {
    const ctx = this.ctx;
    const { color, blur, offsetX, offsetY } = shadow;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(0.5, blur * 0.3);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (blur <= 0.5) {
      // Sharp shadow — single stroke at full offset
      ctx.globalAlpha = 1;
      ctx.strokeText(text, x + offsetX, y + offsetY);
    } else {
      // 3 layers with increasing spread, decreasing alpha
      const step = blur / 3;
      const layers = [
        { spread: step, alpha: 0.35 },
        { spread: step * 2, alpha: 0.2 },
        { spread: step * 3, alpha: 0.1 },
      ];
      for (const layer of layers) {
        ctx.globalAlpha = layer.alpha;
        ctx.strokeText(
          text,
          x + offsetX + layer.spread * 0.3,
          y + offsetY + layer.spread * 0.3
        );
      }
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Glow — multi-layer semi-transparent strokeText
  // ---------------------------------------------------------------------------

  /**
   * Render a glow effect by drawing multiple expanding strokeText layers with
   * decreasing opacity. The `fillRatio` can modulate intensity so the glow
   * follows the sweep.
   */
  private renderGlow(
    text: string,
    x: number,
    y: number,
    glow: GlowConfig,
    fillRatio: number
  ): void {
    const ctx = this.ctx;
    const { color, radius, intensity } = glow;

    // Scale intensity by fill ratio so glow is stronger on sung portion
    const effectiveIntensity = (intensity / 100) * (0.3 + 0.7 * fillRatio);
    if (effectiveIntensity <= 0) return;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const steps = Math.min(8, Math.max(3, Math.round(radius / 2)));
    const stepWidth = radius / Math.max(1, steps);

    for (let i = steps; i >= 0; i--) {
      const w = stepWidth * i;
      const alpha = effectiveIntensity * (1 - i / (steps + 1));
      if (alpha <= 0) continue;

      ctx.globalAlpha = Math.min(1, alpha);
      ctx.lineWidth = Math.max(1, w);
      ctx.strokeText(text, x, y);
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Outline — multi-offset strokeText
  // ---------------------------------------------------------------------------

  /**
   * Render an outer stroke (outline) by drawing strokeText at multiple
   * offsets. Uses 8 directional offsets for full coverage.
   */
  private renderOutline(
    text: string,
    x: number,
    y: number,
    outline: OutlineConfig
  ): void {
    const ctx = this.ctx;
    const { color, width } = outline;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width * 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const offsets: [number, number][] = [
      [0, 0],
      [width, 0],
      [-width, 0],
      [0, width],
      [0, -width],
      [width * 0.7, width * 0.7],
      [-width * 0.7, width * 0.7],
      [width * 0.7, -width * 0.7],
      [-width * 0.7, -width * 0.7],
    ];

    for (const [dx, dy] of offsets) {
      ctx.strokeText(text, x + dx, y + dy);
    }

    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------

  private resolveDirection(
    d: string | undefined
  ): FillDirection {
    const valid: FillDirection[] = [
      "left-to-right",
      "right-to-left",
      "top-to-bottom",
      "bottom-to-top",
    ];
    if (valid.includes(d as FillDirection)) return d as FillDirection;
    return "left-to-right";
  }
}
