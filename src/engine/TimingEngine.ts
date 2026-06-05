import { useStore } from "../store";
import type { LyricLine, LyricChar } from "../types/lyrics";

export type TimingState = "IDLE" | "PLAYING_AND_MARKING" | "PAUSED" | "COMPLETED";

export type TimingStrategy = "REALTIME" | "TAP" | "SENTENCE_DISTRIBUTE";

/** Entry combining a markable character with its parent line info. */
interface MarkableEntry {
  line: LyricLine;
  char: LyricChar;
  lineGlobalIdx: number;
}

/**
 * TimingEngine — Core state machine for karaoke timing (character-level).
 *
 * States:
 *   IDLE                 — Not recording, nothing marked.
 *   PLAYING_AND_MARKING  — Actively recording character timings.
 *   PAUSED               — Recording is paused (Esc), context preserved.
 *   COMPLETED            — All characters have been marked.
 *
 * Strategies:
 *   REALTIME            — Space marks boundaries as audio plays.
 *   TAP                 — (future) Tap-beat style timing.
 *   SENTENCE_DISTRIBUTE — (future) Distribute evenly across a sentence.
 */
export class TimingEngine {
  private _state: TimingState = "IDLE";
  private _strategy: TimingStrategy = "REALTIME";

  // -- Public accessors -------------------------------------------------------

  get state(): TimingState {
    return this._state;
  }

  get strategy(): TimingStrategy {
    return this._strategy;
  }

  // -- Strategy ---------------------------------------------------------------

  setStrategy(strategy: TimingStrategy): void {
    this._strategy = strategy;
  }

  // -- Public actions ---------------------------------------------------------

  /**
   * Space / click "Mark" — the primary timing action.
   * - IDLE   → startMarking: set first char startTime, begin playback.
   * - ACTIVE → markCurrentChar: set endTime/next-startTime, advance cursor.
   * - PAUSED → same as ACTIVE (resumes marking).
   * - DONE   → no-op.
   */
  handleMarkKey(currentTime: number): void {
    switch (this._state) {
      case "IDLE":
        this.startMarking(currentTime);
        break;
      case "PLAYING_AND_MARKING":
      case "PAUSED":
        this.markCurrentChar(currentTime);
        break;
      /* COMPLETED — no-op */
    }
  }

  /**
   * Esc — Pause marking. Preserves all context (cursor position, existing
   * timings). Only meaningful in PLAYING_AND_MARKING.
   */
  handlePause(): void {
    if (this._state !== "PLAYING_AND_MARKING") return;

    this._state = "PAUSED";
    useStore.getState().setPlaying(false);
  }

  /**
   * Backspace — Undo the last mark and seek back to the previous char's
   * startTime. Works in both PLAYING_AND_MARKING and PAUSED. When undoing
   * the very first mark, the engine returns to IDLE.
   */
  handleUndoMark(): void {
    if (
      this._state !== "PLAYING_AND_MARKING" &&
      this._state !== "PAUSED" &&
      this._state !== "COMPLETED"
    )
      return;

    const state = useStore.getState();
    const { lines, currentMarkIndex } = state;
    const markable = this.getMarkableChars(lines);

    if (markable.length === 0) return;

    // Undoing the very first mark — cancel everything.
    if (currentMarkIndex <= 0) {
      const first = markable[0];
      if (first) {
        useStore.getState().updateCharTiming(first.char.id, 0, 0);
      }
      this._state = "IDLE";
      useStore.getState().setIsRecording(false);
      useStore.setState({ currentMarkIndex: 0 });
      return;
    }

    const prevIdx = currentMarkIndex - 1;
    const prev = markable[prevIdx];
    const curr = markable[currentMarkIndex];

    if (prev) {
      useStore.getState().updateCharTiming(prev.char.id, prev.char.startTime, 0);
      useStore.getState().setSeekTarget(Math.max(0, prev.char.startTime));
    }

    if (curr) {
      useStore.getState().updateCharTiming(curr.char.id, 0, curr.char.endTime);
    }

    useStore.setState({ currentMarkIndex: prevIdx });

    // If we were completed, go back to active marking.
    if (this._state === "COMPLETED") {
      this._state = "PLAYING_AND_MARKING";
      useStore.getState().setIsRecording(true);
    }
  }

  /**
   * F3 — Mark the current line as an interlude (isSkipped=true) and advance
   * to the first character of the next non-skipped line. Works during
   * PLAYING_AND_MARKING and PAUSED.
   */
  handleSkipLine(): void {
    if (this._state !== "PLAYING_AND_MARKING" && this._state !== "PAUSED")
      return;

    const state = useStore.getState();
    const { lines, currentMarkIndex } = state;
    const markable = this.getMarkableChars(lines);

    if (markable.length === 0 || currentMarkIndex >= markable.length) return;

    const currentEntry = markable[currentMarkIndex];
    const currentLineId = currentEntry.line.id;

    // Mark line as skipped and clear any existing char timings on it.
    useStore.getState().updateLine(currentLineId, { isSkipped: true });
    const line = lines.find((l) => l.id === currentLineId);
    if (line) {
      for (const c of line.characters) {
        if (c.startTime !== 0 || c.endTime !== 0) {
          useStore.getState().updateCharTiming(c.id, 0, 0);
        }
      }
    }

    // Find the last markable entry for the current line.
    let lastIdxInLine = currentMarkIndex;
    for (let i = currentMarkIndex; i < markable.length; i++) {
      if (markable[i].line.id === currentLineId) {
        lastIdxInLine = i;
      } else {
        break;
      }
    }

    const nextIdx = lastIdxInLine + 1;

    if (nextIdx >= markable.length) {
      this._state = "COMPLETED";
      useStore.getState().setIsRecording(false);
      return;
    }

    useStore.setState({ currentMarkIndex: nextIdx });
  }

  // -- Private helpers --------------------------------------------------------

  /**
   * Build a flat list of all markable characters across all non-skipped lines.
   * Characters with isSpace === true are excluded from marking.
   */
  private getMarkableChars(lines: LyricLine[]): MarkableEntry[] {
    const result: MarkableEntry[] = [];
    for (const line of lines) {
      if (line.isSkipped) continue;
      for (const char of line.characters) {
        if (char.isSpace) continue;
        result.push({ line, char, lineGlobalIdx: line.index });
      }
    }
    return result;
  }

  /**
   * Start marking from the very first character. Sets its startTime
   * (adjusted by leadIn), advances to PLAYING_AND_MARKING, and begins
   * playback.
   */
  private startMarking(currentTime: number): void {
    const state = useStore.getState();
    const markable = this.getMarkableChars(state.lines);

    if (markable.length === 0) return;

    const first = markable[0];
    const adjustedTime = Math.max(0, currentTime + state.leadIn);

    useStore.getState().updateCharTiming(first.char.id, adjustedTime, 0);

    this._state = "PLAYING_AND_MARKING";
    useStore.getState().setIsRecording(true);
    useStore.setState({ currentMarkIndex: 0 });
    useStore.getState().setPlaying(true);
  }

  /**
   * Mark the character at currentMarkIndex:
   * 1. Sets its endTime (with optional snap).
   * 2. If a next character exists, sets its startTime.
   * 3. Advances the cursor.
   * 4. If no more characters, transitions to COMPLETED.
   */
  private markCurrentChar(currentTime: number): void {
    const state = useStore.getState();
    const { lines, currentMarkIndex } = state;
    const markable = this.getMarkableChars(lines);

    if (markable.length === 0) return;

    if (currentMarkIndex >= markable.length) {
      this._state = "COMPLETED";
      useStore.getState().setIsRecording(false);
      return;
    }

    const entry = markable[currentMarkIndex];
    const nextEntry = markable[currentMarkIndex + 1];

    // Apply snap if enabled.
    const snappedTime = this.applySnap(currentTime);

    // Set current char's endTime.
    useStore
      .getState()
      .updateCharTiming(entry.char.id, entry.char.startTime, snappedTime);

    if (nextEntry) {
      // Set next char's startTime.
      useStore
        .getState()
        .updateCharTiming(nextEntry.char.id, snappedTime, nextEntry.char.endTime);

      useStore.setState({ currentMarkIndex: currentMarkIndex + 1 });
      this._state = "PLAYING_AND_MARKING";
    } else {
      // No more characters — all done.
      this._state = "COMPLETED";
      useStore.getState().setIsRecording(false);
      useStore.setState({ currentMarkIndex: currentMarkIndex + 1 });
    }
  }

  /**
   * If snapMode is enabled, snap the given time to the nearest alignment
   * feature (waveform peak, beat grid, etc.).
   */
  private applySnap(time: number): number {
    const state = useStore.getState();

    if (state.snapMode === "none" || state.snapStrength <= 0) return time;

    if (state.snapMode === "waveform_peak") {
      return this.snapToNearestPeak(time, state.waveformData, state.snapStrength);
    }

    // beat mode — not yet implemented, pass through.
    return time;
  }

  /**
   * Snap a time value (ms) to the nearest waveform peak within a ±strengthMs
   * window. Searches the waveform array for the highest amplitude sample.
   *
   * Returns the original time when there is no snap target or no waveform data.
   */
  private snapToNearestPeak(
    time: number,
    peaks: number[],
    strengthMs: number,
  ): number {
    if (peaks.length === 0) return time;

    const state = useStore.getState();
    const duration = state.duration;
    if (duration <= 0) return time;

    const samplePerMs = peaks.length / duration;

    // Clamp search range to valid indices.
    const centerIdx = Math.round(time * samplePerMs);
    const range = Math.max(1, Math.round(strengthMs * samplePerMs));
    const start = Math.max(0, centerIdx - range);
    const end = Math.min(peaks.length - 1, centerIdx + range);

    // Find the strongest peak within the window.
    let bestIdx = centerIdx;
    let bestVal = 0;

    for (let i = start; i <= end; i++) {
      const v = peaks[i] ?? 0;
      if (v > bestVal) {
        bestVal = v;
        bestIdx = i;
      }
    }

    return (bestIdx / peaks.length) * duration;
  }
}
