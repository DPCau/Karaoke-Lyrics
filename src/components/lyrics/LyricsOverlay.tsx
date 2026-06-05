import { useRef, useEffect, useCallback } from "react";
import { useStore } from "../../store";
import { CanvasRenderer } from "../../engine/CanvasRenderer";
import type { LyricStyle } from "../../types/style";

/**
 * Canvas-based lyrics overlay powered by CanvasRenderer.
 *
 * Reads `currentTime`, `lines`, and style configuration from the Zustand
 * store.  Runs a requestAnimationFrame loop that only draws when at least
 * one input has changed since the last frame.
 *
 * The canvas fills its parent container; use a wrapping `<div>` to control
 * dimensions.
 */
export function LyricsOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  // Track the last frame's inputs to avoid redundant draws
  const lastTimeRef = useRef<number>(-1);
  const lastLinesHashRef = useRef<string>("");
  const rafRef = useRef<number>(0);

  // Refs for values that change every frame — avoids stale closures in RAF
  const currentTimeRef = useRef(0);
  const linesRef = useRef(useStore.getState().lines);

  // Read store values individually (avoids full-store re-renders).
  // currentTime and lines are snapshotted into refs below.
  const currentTime = useStore((s) => s.currentTime);
  const lines = useStore((s) => s.lines);
  const fontConfig = useStore((s) => s.fontConfig);
  const unsungColor = useStore((s) => s.unsungColor);
  const sungColor = useStore((s) => s.sungColor);
  const sweep = useStore((s) => s.sweep);
  const outline = useStore((s) => s.outline);
  const shadow = useStore((s) => s.shadow);
  const glow = useStore((s) => s.glow);
  const background = useStore((s) => s.background);
  const backgroundBar = useStore((s) => s.backgroundBar);
  const layout = useStore((s) => s.layout);

  // Keep refs in sync on every render
  currentTimeRef.current = currentTime;
  linesRef.current = lines;

  // Build a stable style object from individual store fields
  const getStyle = useCallback((): LyricStyle => {
    return {
      font: fontConfig,
      unsungColor,
      sungColor,
      sweep,
      outline,
      shadow,
      glow,
      background,
      backgroundBar,
      layout,
    };
  }, [
    fontConfig,
    unsungColor,
    sungColor,
    sweep,
    outline,
    shadow,
    glow,
    background,
    backgroundBar,
    layout,
  ]);

  // Compute a quick hash of lines to detect structural changes
  const linesHash = useCallback((): string => {
    if (lines.length === 0) return "";
    let hash = 0;
    for (let i = 0; i < Math.min(lines.length, 20); i++) {
      const line = lines[i];
      hash = ((hash << 5) - hash + line.id.charCodeAt(0)) | 0;
      hash = ((hash << 5) - hash + line.startTime) | 0;
      hash = ((hash << 5) - hash + line.endTime) | 0;
    }
    return String(hash);
  }, [lines]);

  // Init canvas and renderer, then start the RAF loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Create renderer instance
    const renderer = new CanvasRenderer(canvas);
    rendererRef.current = renderer;

    // Resize observer to match canvas to parent container
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          const dpr = window.devicePixelRatio || 1;
          renderer.updateDpr();
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
          // Force re-render on resize
          lastTimeRef.current = -1;
        }
      }
    });
    resizeObserver.observe(container);

    // RAF render loop — reads from refs to avoid stale closures
    let needsRender = true;

    function tick() {
      const r = rendererRef.current;
      if (!r) return;

      const c = canvasRef.current;
      if (!c || c.width === 0 || c.height === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Read the freshest values from refs
      const time = currentTimeRef.current;
      const currentLines = linesRef.current;

      // Detect meaningful changes
      const timeRounded = Math.round(time);
      const currentHash = linesHash();
      const timeChanged = timeRounded !== lastTimeRef.current;
      const linesChanged = currentHash !== lastLinesHashRef.current;

      if (timeChanged || linesChanged) {
        needsRender = true;
        lastTimeRef.current = timeRounded;
        lastLinesHashRef.current = currentHash;
      }

      if (needsRender) {
        const style = getStyle();
        r.render(time, currentLines, style);
        needsRender = false;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    // Trigger initial render
    lastTimeRef.current = -1;

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      rendererRef.current = null;
    };
    // Only re-initialise when style or lines (structural) change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getStyle, linesHash]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="block"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
