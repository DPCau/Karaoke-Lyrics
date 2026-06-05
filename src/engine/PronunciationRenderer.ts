import type { LyricChar } from "../types/lyrics";

/**
 * Configuration for rendering pronunciation annotations above characters.
 */
export interface PronunciationRenderConfig {
  /** Ratio of pronunciation font size to character font size. */
  fontSizeRatio: number;
  /** Vertical spacing ratio (relative to character font size). */
  spacingRatio: number;
  /** Color of the pronunciation text. */
  color: string;
  /** Whether to show pronunciation annotations. */
  enabled: boolean;
}

const DEFAULT_CONFIG: PronunciationRenderConfig = {
  fontSizeRatio: 0.4,
  spacingRatio: 0.1,
  color: "#888888",
  enabled: true,
};

/**
 * PronunciationRenderer — draws pinyin / furigana / romaji / bopomofo
 * annotations above the corresponding characters on a canvas.
 *
 * This is a stateless utility; the caller provides the canvas context and
 * the character layout positions.
 */
export class PronunciationRenderer {
  private config: PronunciationRenderConfig;

  constructor(config?: Partial<PronunciationRenderConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Update the render configuration. */
  updateConfig(config: Partial<PronunciationRenderConfig>): void {
    Object.assign(this.config, config);
  }

  /** Get the current configuration. */
  getConfig(): Readonly<PronunciationRenderConfig> {
    return this.config;
  }

  /**
   * Draw pronunciation annotations above a single character.
   *
   * @param ctx     - The canvas 2D rendering context.
   * @param ch      - The LyricChar (may have .pronunciation).
   * @param charX   - X position of the character (top-left).
   * @param charY   - Y position of the character (top-left).
   * @param charWidth  - Width of the character in pixels.
   * @param fontSize - The font size (px) of the character text.
   */
  renderChar(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    ch: LyricChar,
    charX: number,
    charY: number,
    charWidth: number,
    fontSize: number,
  ): void {
    if (!this.config.enabled || !ch.pronunciation) return;

    const pron = ch.pronunciation;
    const pronSize = fontSize * this.config.fontSizeRatio;
    const spacing = fontSize * this.config.spacingRatio;

    ctx.save();

    ctx.font = `${pronSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = this.config.color;

    const centerX = charX + charWidth / 2;
    const pronY = charY - spacing;

    ctx.fillText(pron.text, centerX, pronY);

    ctx.restore();
  }

  /**
   * Compute the total vertical height consumed by the character plus its
   * pronunciation annotation.
   *
   * @param fontSize - The font size (px) of the character text.
   * @returns The total height in pixels.
   */
  getTotalHeight(fontSize: number): number {
    if (!this.config.enabled) return fontSize;
    const pronSize = fontSize * this.config.fontSizeRatio;
    const spacing = fontSize * this.config.spacingRatio;
    return fontSize + spacing + pronSize;
  }

  /**
   * Compute the baseline offset needed to vertically centre a line that
   * includes pronunciation annotations.
   *
   * @param fontSize - The font size (px) of the character text.
   * @returns The Y offset to apply to character positions.
   */
  getVerticalOffset(fontSize: number): number {
    if (!this.config.enabled) return 0;
    const pronSize = fontSize * this.config.fontSizeRatio;
    const spacing = fontSize * this.config.spacingRatio;
    return pronSize + spacing;
  }
}
