import { useRef, useEffect } from "react";
import { useStore } from "../../store";

interface TimeRulerProps {
  /** Width of the ruler canvas (matches the timeline content width) */
  width: number;
  /** Height of the ruler in pixels (default: 24) */
  height?: number;
  /** Pixels per second — determines tick density */
  pxPerSec: number;
  /** Scroll offset (px) to sync with the timeline */
  scrollLeft: number;
}

/**
 * TimeRuler — Canvas-based time scale ruler for the timeline.
 *
 * Draws adaptive tick marks:
 *   - Large ticks at "nice" time intervals with MM:SS.m labels.
 *   - Small ticks between them for visual guidance.
 *
 * Tick spacing adjusts to the current pxPerSec zoom level to avoid
 * overlapping labels.
 */
export function TimeRuler({
  width,
  height = 24,
  pxPerSec,
  scrollLeft,
}: TimeRulerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const duration = useStore((s) => s.duration);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(width, container.clientWidth);
    const h = height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, w, h);

    if (duration <= 0 || pxPerSec <= 0) {
      ctx.fillStyle = "#555";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText("—", w / 2, h / 2 + 3);
      return;
    }

    // Determine "nice" tick interval (in seconds) based on pxPerSec.
    // Target: roughly 80-120 px between major ticks.
    const targetPx = 100;
    const rawInterval = targetPx / pxPerSec;

    // Snap to a "nice" number: 0.1, 0.2, 0.5, 1, 2, 5, 10, 30, 60 ...
    const niceIntervals = [
      0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 15,
      30, 60,
    ];
    let majorInterval = niceIntervals[niceIntervals.length - 1];
    for (const ni of niceIntervals) {
      if (ni >= rawInterval) {
        majorInterval = ni;
        break;
      }
    }

    const minorInterval = majorInterval / 5;

    // Visible range
    const viewStartSec = scrollLeft / pxPerSec;
    const viewEndSec = Math.min(duration / 1000, (scrollLeft + w) / pxPerSec);

    // Styles
    const majorTickColor = "#888";
    const minorTickColor = "#444";
    const textColor = "#999";

    // Compute first major tick
    const firstMajor = Math.ceil(viewStartSec / majorInterval) * majorInterval;

    // Draw minor ticks
    ctx.strokeStyle = minorTickColor;
    ctx.lineWidth = 1;
    const firstMinor = Math.max(0, Math.ceil(viewStartSec / minorInterval) * minorInterval);
    for (let t = firstMinor; t <= viewEndSec; t += minorInterval) {
      const x = t * pxPerSec - scrollLeft;
      // Skip positions very close to major ticks
      const nearestMajor = Math.round(t / majorInterval) * majorInterval;
      if (Math.abs(t - nearestMajor) < minorInterval * 0.4) continue;

      ctx.beginPath();
      ctx.moveTo(x, h - 8);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Draw major ticks + labels
    ctx.strokeStyle = majorTickColor;
    ctx.lineWidth = 1;
    ctx.fillStyle = textColor;
    ctx.font = "9px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    for (let t = firstMajor; t <= viewEndSec; t += majorInterval) {
      const x = t * pxPerSec - scrollLeft;

      // Tick line
      ctx.beginPath();
      ctx.moveTo(x, h - 12);
      ctx.lineTo(x, h);
      ctx.stroke();

      // Label
      const mins = Math.floor(t / 60);
      const secs = t % 60;
      const label =
        majorInterval < 1
          ? `${mins}:${secs.toFixed(2).padStart(5, "0")}`
          : `${mins}:${Math.floor(secs).toString().padStart(2, "0")}`;
      ctx.fillText(label, x, 2);
    }
  }, [width, height, pxPerSec, scrollLeft, duration]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height }}>
      <canvas
        ref={canvasRef}
        className="block"
        style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
      />
    </div>
  );
}
