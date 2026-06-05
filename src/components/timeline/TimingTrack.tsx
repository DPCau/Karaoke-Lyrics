import { useRef, useCallback, useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../../store";
import type { LyricLine, LyricChar } from "../../types/lyrics";

interface TimingTrackProps {
  /** Total content width (duration x pxPerSec) */
  width: number;
  /** Track height (default: 30) */
  height?: number;
  /** Pixels per second for positioning */
  pxPerSec: number;
  /** Scroll offset to convert between screen and content coordinates */
  scrollLeft: number;
}

interface DragState {
  charId: string;
  /** The char's startTime when the drag started */
  startAnchor: number;
  /** The char's endTime when the drag started */
  endAnchor: number;
  /** Screen X at drag start (used to compute delta) */
  anchorScreenX: number;
}

/**
 * TimingTrack — Displays timing markers for every character across all
 * non-skipped lines. Users can drag a marker horizontally to shift its
 * timing, preserving the character's duration.
 *
 * Colour scheme:
 *   - Green (#22c55e) — character has a non-zero startTime (timed)
 *   - Gray  (#555)    — character has not been timed yet
 *   - Red   (#ef4444) — currently being dragged
 */
export function TimingTrack({
  width,
  height = 30,
  pxPerSec,
  scrollLeft: _scrollLeft,
}: TimingTrackProps) {
  const { t } = useTranslation();
  const lines = useStore((s) => s.lines);
  const updateCharTiming = useStore((s) => s.updateCharTiming);
  const snapMode = useStore((s) => s.snapMode);
  const snapStrength = useStore((s) => s.snapStrength);
  const duration = useStore((s) => s.duration);
  const waveformData = useStore((s) => s.waveformData);

  const [drag, setDrag] = useState<DragState | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Collect all markable entries (same filter as TimingEngine).
  const entries = useCallback((): { line: LyricLine; char: LyricChar }[] => {
    const result: { line: LyricLine; char: LyricChar }[] = [];
    for (const line of lines) {
      if (line.isSkipped) continue;
      for (const ch of line.characters) {
        if (ch.isSpace) continue;
        result.push({ line, char: ch });
      }
    }
    return result;
  }, [lines]);

  /** Snap a time value using the same logic as TimingEngine. */
  const applySnap = useCallback(
    (time: number): number => {
      if (
        snapMode !== "waveform_peak" ||
        snapStrength <= 0 ||
        waveformData.length === 0 ||
        duration <= 0
      )
        return time;

      const samplePerMs = waveformData.length / duration;
      const centerIdx = Math.round(time * samplePerMs);
      const range = Math.max(1, Math.round(snapStrength * samplePerMs));
      const start = Math.max(0, centerIdx - range);
      const end = Math.min(waveformData.length - 1, centerIdx + range);

      let bestIdx = centerIdx;
      let bestVal = 0;
      for (let i = start; i <= end; i++) {
        const v = waveformData[i] ?? 0;
        if (v > bestVal) {
          bestVal = v;
          bestIdx = i;
        }
      }
      return (bestIdx / waveformData.length) * duration;
    },
    [snapMode, snapStrength, waveformData, duration],
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent, char: LyricChar) => {
      e.preventDefault();
      e.stopPropagation();

      setDrag({
        charId: char.id,
        startAnchor: char.startTime,
        endAnchor: char.endTime,
        anchorScreenX: e.clientX,
      });
    },
    [],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!drag) return;

      // Compute delta from the anchor and apply to both start/end time.
      const deltaX = e.clientX - drag.anchorScreenX;
      const deltaMs = (deltaX / pxPerSec) * 1000;

      const newStart = Math.max(
        0,
        Math.min(duration, Math.round(drag.startAnchor + deltaMs)),
      );
      const newEnd = Math.max(
        0,
        Math.min(duration, Math.round(drag.endAnchor + deltaMs)),
      );

      updateCharTiming(drag.charId, newStart, newEnd);
    },
    [drag, pxPerSec, duration, updateCharTiming],
  );

  const handleDragEnd = useCallback(() => {
    if (!drag) return;

    // Apply snap on release if enabled.
    const store = useStore.getState();
    const { lines: currentLines } = store;
    for (const line of currentLines) {
      for (const c of line.characters) {
        if (c.id === drag.charId) {
          const snappedStart = applySnap(c.startTime);
          const snappedEnd = applySnap(c.endTime);
          if (snappedStart !== c.startTime || snappedEnd !== c.endTime) {
            store.updateCharTiming(c.id, snappedStart, snappedEnd);
          }
          break;
        }
      }
    }

    setDrag(null);
  }, [drag, applySnap]);

  const allEntries = entries();
  const isDragging = drag !== null;

  return (
    <div
      ref={trackRef}
      className="relative w-full overflow-hidden select-none"
      style={{ height }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[#161616]" />

      {/* Markers */}
      <div className="absolute inset-0" style={{ width }}>
        {allEntries.map(({ char }) => {
          const isTimed = char.startTime > 0;
          const isDragged = isDragging && drag?.charId === char.id;

          const x = (char.startTime / 1000) * pxPerSec;
          const color = isDragged
            ? "#ef4444"
            : isTimed
              ? "#22c55e"
              : "#555";

          return (
            <div
              key={char.id}
              className="absolute top-0 flex flex-col items-center"
              style={{
                left: x,
                height: "100%",
                cursor: isTimed ? "ew-resize" : "default",
                zIndex: isDragged ? 10 : 1,
              }}
            >
              {/* Vertical line */}
              <div
                className="w-[2px] rounded"
                style={{
                  height: "100%",
                  backgroundColor: color,
                  opacity: isDragged ? 1 : isTimed ? 0.85 : 0.35,
                }}
                onMouseDown={(e) => handleMouseDown(e, char)}
              />

              {/* Diamond handle on timed markers */}
              {isTimed && (
                <div
                  className="absolute bottom-0 w-2.5 h-2.5 rounded-sm"
                  style={{
                    backgroundColor: color,
                    transform: "translateY(50%) rotate(45deg)",
                    cursor: "ew-resize",
                  }}
                  onMouseDown={(e) => handleMouseDown(e, char)}
                />
              )}
            </div>
          );
        })}
      </div>

      {allEntries.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-700">
          {t("timing_panel.loadLyricsHint")}
        </div>
      )}
    </div>
  );
}
