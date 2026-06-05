import { useRef, useEffect, useCallback } from "react";
import type { LyricLine } from "../../types/lyrics";

interface LyricsOverlayProps {
  /** Current playback time in milliseconds */
  currentTime: number;
  /** Sorted lyrics lines to display */
  lines: LyricLine[];
  /** Canvas width (px) */
  width: number;
  /** Canvas height (px) */
  height: number;
  /** Whether to show the next upcoming line below the current line */
  dualLine?: boolean;
  /** Text color for the current line */
  activeColor?: string;
  /** Text color for the upcoming (next) line */
  inactiveColor?: string;
  /** Font family for lyrics text */
  fontFamily?: string;
  /** Font size in pixels for the current line */
  fontSize?: number;
  /** Vertical position from bottom as percentage (0-100) */
  verticalPosition?: number;
}

/**
 * Canvas-based lyrics overlay suitable for rendering on top of video/audio.
 *
 * Finds the active line by matching `currentTime` against each line's
 * [startTime, endTime) range, renders it centered near the bottom.
 */
export function LyricsOverlay({
  currentTime,
  lines,
  width,
  height,
  dualLine = false,
  activeColor = "#e0e0e0",
  inactiveColor = "#666666",
  fontFamily = "Inter, system-ui, sans-serif",
  fontSize = 48,
  verticalPosition = 25,
}: LyricsOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const findActiveLineIndex = useCallback((): number => {
    // Lines are expected to be sorted by startTime
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const start = line.startTime;
      const end = line.endTime;
      if (currentTime >= start && (end === 0 || currentTime < end)) {
        return i;
      }
    }
    return -1;
  }, [lines, currentTime]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, width, height);

    const activeIdx = findActiveLineIndex();
    if (activeIdx === -1) return;

    const activeLine = lines[activeIdx];
    const linesToRender: { line: LyricLine; color: string; alpha: number }[] = [
      { line: activeLine, color: activeColor, alpha: 1 },
    ];

    if (dualLine && activeIdx + 1 < lines.length) {
      linesToRender.push({
        line: lines[activeIdx + 1],
        color: inactiveColor,
        alpha: 0.6,
      });
    }

    const currentFontSize = fontSize;
    const nextFontSize = fontSize * 0.7;
    const gap = 12; // px gap between lines

    // Calculate total height of all lines
    let totalHeight = 0;
    linesToRender.forEach((_lr, i) => {
      const fs = i === 0 ? currentFontSize : nextFontSize;
      totalHeight += fs * 1.3; // approximate line height
    });
    totalHeight += (linesToRender.length - 1) * gap;

    // Start y position from bottom
    const bottomMargin = (height * verticalPosition) / 100;
    let y = height - bottomMargin - totalHeight;

    for (let i = 0; i < linesToRender.length; i++) {
      const { line, color, alpha } = linesToRender[i];
      const fs = i === 0 ? currentFontSize : nextFontSize;

      ctx.globalAlpha = alpha;
      ctx.font = `${fs}px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      // Shadow for readability
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = color;
      ctx.fillText(line.text, width / 2, y);

      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      y += fs * 1.3 + (i === 0 ? gap : 0);
    }
  }, [
    currentTime,
    lines,
    width,
    height,
    dualLine,
    activeColor,
    inactiveColor,
    fontFamily,
    fontSize,
    verticalPosition,
    findActiveLineIndex,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full"
      style={{ width, height }}
    />
  );
}
