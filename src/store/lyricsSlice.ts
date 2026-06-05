import type { StateCreator } from "zustand";
import type { AppStore } from "./store";
import type { LyricLine, LyricChar, Pronunciation } from "../types/lyrics";

let _nextId = 1;
function generateId(): string {
  return `id_${Date.now()}_${_nextId++}`;
}

export interface LyricsSlice {
  lines: LyricLine[];
  selectedLineIndex: number | null;
  selectedCharId: string | null;
  pronunciationMode: string;

  /** Replace all lyrics lines */
  setLines: (lines: LyricLine[]) => void;
  /** Update specific fields of a line by ID */
  updateLine: (lineId: string, updates: Partial<LyricLine>) => void;
  /**
   * Insert a new line after `afterIndex` (array index).
   * If afterIndex is undefined or negative, append to end.
   * `chars` (optional) provides pre-built characters; otherwise characters
   * will be empty.
   */
  addLine: (afterIndex?: number, text?: string, chars?: LyricChar[]) => void;
  /** Delete a line and its characters by line ID */
  deleteLine: (lineId: string) => void;
  /** Move a line to a new array index position */
  moveLine: (lineId: string, newIndex: number) => void;
  /** Update timing for a single character */
  updateCharTiming: (charId: string, startTime: number, endTime: number) => void;
  /** Update pronunciation for a single character */
  updateCharPronunciation: (charId: string, pronunciation: Pronunciation) => void;
  /** Select a line by array index */
  setSelectedLineIndex: (index: number | null) => void;
  /** Select a character by its ID */
  selectChar: (charId: string | null) => void;
  /** Set pronunciation display mode */
  setPronunciationMode: (mode: string) => void;
}

export const createLyricsSlice: StateCreator<
  AppStore,
  [],
  [],
  LyricsSlice
> = (set, _get) => ({
  lines: [],
  selectedLineIndex: null,
  selectedCharId: null,
  pronunciationMode: "none",

  setLines: (lines) => set({ lines, selectedLineIndex: null }),

  updateLine: (lineId, updates) =>
    set((s) => ({
      lines: s.lines.map((l) => (l.id === lineId ? { ...l, ...updates } : l)),
    })),

  addLine: (afterIndex, text, chars) =>
    set((s) => {
      const lineId = generateId();
      const newLine: LyricLine = {
        id: lineId,
        index: s.lines.length,
        text: text ?? "",
        characters: chars ?? [],
        startTime: 0,
        endTime: 0,
        isSkipped: false,
      };

      const insertAt =
        afterIndex !== undefined && afterIndex >= 0 ? afterIndex + 1 : s.lines.length;

      const lines = [...s.lines];
      lines.splice(insertAt, 0, newLine);

      // Re-index
      const reindexed = lines.map((l, i) => ({ ...l, index: i }));

      return { lines: reindexed };
    }),

  deleteLine: (lineId) =>
    set((s) => {
      const deletedIdx = s.lines.findIndex((l) => l.id === lineId);
      let newSelected = s.selectedLineIndex;

      const filtered = s.lines.filter((l) => l.id !== lineId);
      const reindexed = filtered.map((l, i) => ({ ...l, index: i }));

      if (deletedIdx !== -1) {
        if (newSelected !== null) {
          if (newSelected === deletedIdx) {
            newSelected = null;
          } else if (newSelected > deletedIdx) {
            newSelected = newSelected - 1;
          }
        }
      }

      return { lines: reindexed, selectedLineIndex: newSelected };
    }),

  moveLine: (lineId, newIndex) =>
    set((s) => {
      const currentIdx = s.lines.findIndex((l) => l.id === lineId);
      if (currentIdx === -1) return s;

      const lines = [...s.lines];
      const [moved] = lines.splice(currentIdx, 1);
      const clampedIdx = Math.min(newIndex, lines.length);
      lines.splice(clampedIdx, 0, moved);

      const reindexed = lines.map((l, i) => ({ ...l, index: i }));

      let newSelected = s.selectedLineIndex;
      if (newSelected !== null) {
        if (newSelected === currentIdx) {
          newSelected = clampedIdx;
        } else {
          // Adjust if selection moved
          const start = Math.min(currentIdx, clampedIdx);
          const end = Math.max(currentIdx, clampedIdx);
          if (newSelected >= start && newSelected <= end) {
            newSelected = newSelected + (currentIdx < clampedIdx ? -1 : 1);
          }
        }
      }

      return { lines: reindexed, selectedLineIndex: newSelected };
    }),

  updateCharTiming: (charId, startTime, endTime) =>
    set((s) => ({
      lines: s.lines.map((l) => ({
        ...l,
        characters: l.characters.map((c) =>
          c.id === charId ? { ...c, startTime, endTime } : c
        ),
      })),
    })),

  updateCharPronunciation: (charId, pronunciation) =>
    set((s) => ({
      lines: s.lines.map((l) => ({
        ...l,
        characters: l.characters.map((c) =>
          c.id === charId ? { ...c, pronunciation } : c
        ),
      })),
    })),

  setSelectedLineIndex: (index) => set({ selectedLineIndex: index }),

  selectChar: (charId) => set({ selectedCharId: charId }),

  setPronunciationMode: (mode) => set({ pronunciationMode: mode }),
});
