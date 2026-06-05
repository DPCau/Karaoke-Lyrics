import type { LyricLine, LyricChar } from "../types/lyrics";
import type { FontConfig, LyricStyle } from "../types/style";

/** Positioned layout for a single character. */
export interface CharLayout {
  char: LyricChar;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Layout result for a full lyric line. */
export interface LineLayout {
  startX: number;
  y: number;
  width: number;
  height: number;
  chars: CharLayout[];
}

/**
 * Build a CSS font string from a FontConfig.
 *
 * @example getFontString({ family: "Inter", size: 48, weight: 700, italic: false })
 *          // "700 48px Inter"
 */
export function getFontString(font: FontConfig): string {
  const italic = font.italic ? "italic " : "";
  return `${italic}${font.weight} ${font.size}px ${font.family}`;
}

/**
 * Measure the width of a piece of text with the given font.
 * Requires a 2D canvas context (or OffscreenCanvasRenderingContext2D) for
 * measurement.
 */
export function measureCharWidth(
  text: string,
  font: FontConfig,
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
): number {
  ctx.font = getFontString(font);
  return ctx.measureText(text).width;
}

/**
 * Calculate the line height in pixels from a FontConfig.
 * Uses `font.size * font.lineHeight`.
 */
export function getLineHeight(font: FontConfig): number {
  return font.size * font.lineHeight;
}

/**
 * Calculate the total width of a lyric line in pixels.
 */
export function getLineWidth(
  line: LyricLine,
  font: FontConfig,
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
): number {
  let width = 0;
  for (const ch of line.characters) {
    width += measureCharWidth(ch.text, font, ctx);
  }
  return width;
}

/**
 * Lay out characters in a lyric line horizontally, returning their
 * individual positions and sizes relative to the line's start.
 */
export function layoutLineHorizontal(
  line: LyricLine,
  font: FontConfig,
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
): CharLayout[] {
  const layouts: CharLayout[] = [];
  let cursorX = 0;
  const height = getLineHeight(font);

  for (const ch of line.characters) {
    const charWidth = measureCharWidth(ch.text, font, ctx);
    layouts.push({
      char: ch,
      x: cursorX,
      y: 0,
      width: charWidth,
      height,
    });
    cursorX += charWidth;
  }

  return layouts;
}

/**
 * Calculate the full position of a lyric line inside the canvas.
 *
 * Returns the start X (based on alignment), Y (based on verticalPosition),
 * and positioned character layouts with absolute coordinates.
 */
export function calculateLinePosition(
  line: LyricLine,
  style: LyricStyle,
  canvasWidth: number,
  canvasHeight: number,
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
): LineLayout {
  const chars = layoutLineHorizontal(line, style.font, ctx);
  const lineWidth = chars.reduce((sum, c) => sum + c.width, 0);
  const lineHeight = getLineHeight(style.font);
  const { alignment, verticalPosition } = style.layout;

  let startX: number;
  switch (alignment) {
    case "left":
      startX = 0;
      break;
    case "right":
      startX = canvasWidth - lineWidth;
      break;
    case "center":
    default:
      startX = (canvasWidth - lineWidth) / 2;
      break;
  }

  const y = (canvasHeight * verticalPosition) / 100;

  const positionedChars = chars.map((c) => ({
    ...c,
    x: c.x + startX,
    y,
  }));

  return {
    startX,
    y,
    width: lineWidth,
    height: lineHeight,
    chars: positionedChars,
  };
}
