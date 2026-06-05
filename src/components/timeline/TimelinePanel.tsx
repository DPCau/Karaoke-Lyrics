import { useRef, useCallback, useState, useEffect } from "react";
import { useStore } from "../../store";
import { WaveformDisplay } from "./WaveformDisplay";
import { TimeRuler } from "./TimeRuler";
import { TimingTrack } from "./TimingTrack";

/**
 * TimelinePanel — Horizontal timeline combining time ruler, waveform, and
 * timing markers into a single scrollable view.
 *
 * - Toolbar: zoom controls, snap mode selector, BPM input
 * - Scrollable track: TimeRuler + WaveformDisplay + TimingTrack stacked
 *
 * The content width is computed as duration (in seconds) x pxPerSec,
 * allowing the timeline to be zoomed by adjusting pxPerSec.
 */
export function TimelinePanel() {
  const duration = useStore((s) => s.duration);
  const hasMedia = useStore(
    (s) => s.videoPath !== null || s.audioPath !== null,
  );
  const lines = useStore((s) => s.lines);
  const snapMode = useStore((s) => s.snapMode);
  const bpm = useStore((s) => s.bpm);
  const setSnapMode = useStore((s) => s.setSnapMode);
  const setBpm = useStore((s) => s.setBpm);
  const currentMarkIndex = useStore((s) => s.currentMarkIndex);
  const isRecording = useStore((s) => s.isRecording);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Pixels-per-second zoom level: start at 50, range ~10 - 500.
  const pxPerSecRef = useRef(50);
  const [renderKey, setRenderKey] = useState(0);

  const getPxPerSec = useCallback(() => pxPerSecRef.current, []);

  const zoomIn = useCallback(() => {
    pxPerSecRef.current = Math.min(500, pxPerSecRef.current * 1.4);
    setRenderKey((k) => k + 1);
  }, []);

  const zoomOut = useCallback(() => {
    pxPerSecRef.current = Math.max(10, pxPerSecRef.current / 1.4);
    setRenderKey((k) => k + 1);
  }, []);

  // Listen to scroll position for child components.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => setScrollLeft(el.scrollLeft);
    el.addEventListener("scroll", onScroll, { passive: true });
    // Initial sync
    setScrollLeft(el.scrollLeft);
    return () => el.removeEventListener("scroll", onScroll);
  }, [renderKey]);

  const pxPerSec = getPxPerSec();
  const totalWidth = Math.max((duration / 1000) * pxPerSec + 200, 800);

  const hasLyrics = lines.length > 0;
  const totalMarkable = hasLyrics
    ? lines.reduce((acc, l) => {
        if (l.isSkipped) return acc;
        return acc + l.characters.filter((c) => !c.isSpace).length;
      }, 0)
    : 0;

  return (
    <div className="flex flex-col bg-surface-0 border-t border-surface-3 select-none">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-1 border-b border-surface-3">
        {/* Zoom */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={zoomOut}
            className="w-6 h-6 flex items-center justify-center rounded
                       bg-surface-2 text-gray-400 hover:text-gray-200
                       hover:bg-surface-3 transition-colors text-xs"
            title="Zoom out"
          >
            -
          </button>
          <span className="text-[10px] text-gray-500 font-mono w-10 text-center">
            {pxPerSec.toFixed(0)}px/s
          </span>
          <button
            type="button"
            onClick={zoomIn}
            className="w-6 h-6 flex items-center justify-center rounded
                       bg-surface-2 text-gray-400 hover:text-gray-200
                       hover:bg-surface-3 transition-colors text-xs"
            title="Zoom in"
          >
            +
          </button>
        </div>

        <div className="w-px h-4 bg-surface-3" />

        {/* Snap mode */}
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] text-gray-500">Snap</label>
          <select
            value={snapMode}
            onChange={(e) => setSnapMode(e.target.value as any)}
            disabled={!hasMedia}
            className="appearance-none bg-surface-2 border border-surface-3 rounded
                       px-2 py-0.5 text-xs text-gray-300 font-mono
                       focus:outline-none focus:border-accent/50
                       disabled:opacity-40 cursor-pointer"
          >
            <option value="none">None</option>
            <option value="waveform_peak">Peak</option>
            <option value="beat">Beat</option>
          </select>
        </div>

        <div className="w-px h-4 bg-surface-3" />

        {/* BPM */}
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] text-gray-500">BPM</label>
          <input
            type="number"
            min={0}
            max={300}
            step={1}
            value={bpm ?? ""}
            onChange={(e) => setBpm(e.target.value ? Number(e.target.value) : null)}
            placeholder="--"
            className="w-14 bg-surface-2 border border-surface-3 rounded px-2 py-0.5
                       text-xs text-gray-300 font-mono
                       focus:outline-none focus:border-accent/50 placeholder:text-gray-600"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Recording status */}
        {isRecording && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-red-400 font-mono">
              {currentMarkIndex}/{totalMarkable}
            </span>
          </div>
        )}
        {!isRecording && hasLyrics && (
          <span className="text-[10px] text-gray-600">
            {currentMarkIndex}/{totalMarkable} marked
          </span>
        )}
      </div>

      {/* Scrollable timeline tracks */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden"
        style={{ maxHeight: 160 }}
      >
        <div style={{ width: totalWidth, minHeight: 100 }}>
          {/* Time ruler */}
          <TimeRuler
            width={totalWidth}
            height={22}
            pxPerSec={pxPerSec}
            scrollLeft={scrollLeft}
          />

          {/* Waveform */}
          <WaveformDisplay height={60} width={totalWidth} />

          {/* Timing markers */}
          <TimingTrack
            width={totalWidth}
            height={28}
            pxPerSec={pxPerSec}
            scrollLeft={scrollLeft}
          />
        </div>
      </div>
    </div>
  );
}
