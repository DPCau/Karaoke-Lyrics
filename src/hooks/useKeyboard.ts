import { useEffect, useRef } from "react";

export interface KeyboardHandlers {
  /** Space (mark key) when in recording mode */
  onMark: () => void;
  /** Space when NOT in recording mode — toggles playback */
  onPlayPause: () => void;
  /** Esc — pause/stop recording context */
  onPause: () => void;
  /** Backspace — undo last mark */
  onUndo: () => void;
  /** F3 — skip current line as interlude */
  onSkipLine: () => void;
  /** Arrow ←/→ — nudge current time (positive = forward) */
  onSeekRelative: (deltaMs: number) => void;
}

/**
 * Global keyboard event hook for the karaoke timing workflow.
 *
 * Behaviour is modulated by `isRecording` from the zustand store:
 *   - recording → Space = onMark,  Esc = onPause
 *   - playing   → Space = onPlayPause
 *
 * Handled keys are prevented from propagating.
 * A ~50 ms debounce prevents accidental double-triggers.
 */
export function useKeyboard(handlers: KeyboardHandlers): void {
  // Keep a stable ref so the effect doesn't need to re-subscribe.
  const h = useRef(handlers);
  h.current = handlers;

  useEffect(() => {
    const lastHit: Record<string, number> = {};

    const handler = (e: KeyboardEvent) => {
      // Debounce per-key (~50 ms).
      const now = performance.now();
      const { key } = e;
      if (key in lastHit && now - lastHit[key] < 50) return;
      lastHit[key] = now;

      switch (key) {
        case " ":
        case "Spacebar": {
          e.preventDefault();
          h.current.onMark();
          return;
        }

        case "Escape": {
          e.preventDefault();
          h.current.onPause();
          return;
        }

        case "Backspace": {
          e.preventDefault();
          h.current.onUndo();
          return;
        }

        case "F3": {
          e.preventDefault();
          h.current.onSkipLine();
          return;
        }

        case "ArrowLeft": {
          e.preventDefault();
          h.current.onSeekRelative(e.shiftKey ? -1000 : -100);
          return;
        }

        case "ArrowRight": {
          e.preventDefault();
          h.current.onSeekRelative(e.shiftKey ? 1000 : 100);
          return;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []); // stable — handlers read via ref
}
