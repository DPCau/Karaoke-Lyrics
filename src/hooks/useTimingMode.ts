import { useRef, useCallback } from "react";
import { useStore } from "../store";
import { TimingEngine } from "../engine/TimingEngine";
import { useKeyboard } from "./useKeyboard";

/**
 * useTimingMode — Manages the lifecycle of the TimingEngine singleton and
 * wires keyboard events to engine actions.
 *
 * Must be called once at the App root so keyboard bindings are global.
 */
export function useTimingMode(): TimingEngine {
  const engineRef = useRef<TimingEngine | null>(null);

  if (!engineRef.current) {
    engineRef.current = new TimingEngine();
  }

  const handleMark = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const currentTime = useStore.getState().currentTime;
    engine.handleMarkKey(currentTime);
  }, []);

  const handlePlayPause = useCallback(() => {
    const state = useStore.getState();
    state.setPlaying(!state.isPlaying);
  }, []);

  const handlePause = useCallback(() => {
    engineRef.current?.handlePause();
  }, []);

  const handleUndo = useCallback(() => {
    engineRef.current?.handleUndoMark();
  }, []);

  const handleSkipLine = useCallback(() => {
    engineRef.current?.handleSkipLine();
  }, []);

  const handleSeekRelative = useCallback((deltaMs: number) => {
    const state = useStore.getState();
    const newTime = Math.max(
      0,
      Math.min(state.duration, state.currentTime + deltaMs),
    );
    state.setCurrentTime(newTime);
    state.setSeekTarget(newTime);
  }, []);

  useKeyboard({
    onMark: handleMark,
    onPause: handlePause,
    onUndo: handleUndo,
    onSkipLine: handleSkipLine,
    onPlayPause: handlePlayPause,
    onSeekRelative: handleSeekRelative,
  });

  return engineRef.current;
}
