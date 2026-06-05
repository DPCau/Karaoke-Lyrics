import type { StateCreator } from "zustand";
import type { AppStore } from "./store";
import type { LyricLine } from "../types/lyrics";

export interface LyricsSlice {
  lines: LyricLine[];
  selectedLineIndex: number | null;
  pronunciationMode: string;

  setLines: (lines: LyricLine[]) => void;
  addLine: (line: LyricLine) => void;
  updateLine: (index: number, line: Partial<LyricLine>) => void;
  removeLine: (index: number) => void;
  setSelectedLineIndex: (index: number | null) => void;
  setPronunciationMode: (mode: string) => void;
}

export const createLyricsSlice: StateCreator<AppStore, [], [], LyricsSlice> = (
  set
) => ({
  lines: [],
  selectedLineIndex: null,
  pronunciationMode: "disabled",

  setLines: (lines) => set({ lines }),
  addLine: (line) => set((s) => ({ lines: [...s.lines, line] })),
  updateLine: (index, partial) =>
    set((s) => ({
      lines: s.lines.map((l, i) => (i === index ? { ...l, ...partial } : l)),
    })),
  removeLine: (index) =>
    set((s) => ({
      lines: s.lines.filter((_, i) => i !== index),
      selectedLineIndex:
        s.selectedLineIndex === index
          ? null
          : s.selectedLineIndex !== null && s.selectedLineIndex > index
            ? s.selectedLineIndex - 1
            : s.selectedLineIndex,
    })),
  setSelectedLineIndex: (index) => set({ selectedLineIndex: index }),
  setPronunciationMode: (mode) => set({ pronunciationMode: mode }),
});
