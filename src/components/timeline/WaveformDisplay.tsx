import { useRef, useEffect, useCallback } from "react";
import { useStore } from "../../store";

interface WaveformDisplayProps {
  /** Optional override for the canvas height (default: 80) */
  height?: number;
}

/**
 * WaveformDisplay — Canvas-based waveform visualization.
 *
 * Draws the waveform peaks from store data, overlays a playhead at the
 * current playback position, and colours the played portion differently.
 */
export function WaveformDisplay({ height = 80 }: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const waveformData = useStore((s) => s.waveformData);
  const currentTime = useStore((s) => s.currentTime);
  const duration = useStore((s) => s.duration);
  const videoPath = useStore((s) => s.videoPath);
  const audioPath = useStore((s) => s.audioPath);

  const hasMedia = videoPath !== null || audioPath !== null;

  /** Map a time value to an x-coordinate on the canvas. */
  const timeToX = useCallback(
    (timeMs: number, width: number): number => {
      if (duration <= 0) return 0;
      return (timeMs / duration) * width;
    },
    [duration],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = "#141414";
    ctx.fillRect(0, 0, w, h);

    if (!hasMedia || waveformData.length === 0) {
      // Empty state hint
      ctx.fillStyle = "#333";
      ctx.font = "11px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(waveformData.length === 0 ? "No waveform data" : "", w / 2, h / 2);
      return;
    }

    const barCount = waveformData.length;
    const barWidth = w / barCount;
    const centerY = h / 2;

    // Determine played boundaries
    const playedEndX = timeToX(currentTime, w);

    for (let i = 0; i < barCount; i++) {
      const x = i * barWidth;
      const peak = Math.abs(waveformData[i] ?? 0);
      const barHeight = Math.max(1, peak * centerY * 0.9);

      // Decide colour: played vs unplayed
      const barCenterX = x + barWidth / 2;
      if (barCenterX <= playedEndX) {
        ctx.fillStyle = "#3b82f6";
      } else {
        ctx.fillStyle = "#555";
      }

      // Symmetrical bar around center
      ctx.fillRect(x, centerY - barHeight, Math.max(1, barWidth - 1), barHeight * 2);
    }

    // Playhead line
    if (duration > 0) {
      const playheadX = timeToX(currentTime, w);

      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, h);
      ctx.stroke();

      // Small diamond on top of the playhead
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(playheadX, 4);
      ctx.lineTo(playheadX - 4, 10);
      ctx.lineTo(playheadX, 16);
      ctx.lineTo(playheadX + 4, 10);
      ctx.closePath();
      ctx.fill();
    }
  }, [waveformData, currentTime, duration, hasMedia, height, timeToX]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded"
      style={{ height }}
    >
      <canvas
        ref={canvasRef}
        className="block"
      />
    </div>
  );
}
