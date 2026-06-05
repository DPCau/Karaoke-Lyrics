import type { StateCreator } from "zustand";
import type { AppStore } from "./store";

export type SnapMode = "none" | "waveform_peak" | "beat";

export interface TimingSlice {
  isRecording: boolean;
  currentMarkIndex: number;
  markKey: string;
  leadIn: number;
  snapMode: SnapMode;
  snapStrength: number;
  bpm: number | null;

  startRecording: () => void;
  stopRecording: () => void;
  setIsRecording: (recording: boolean) => void;
  setCurrentMarkIndex: (index: number) => void;
  setMarkKey: (key: string) => void;
  setLeadIn: (ms: number) => void;
  setSnapMode: (mode: SnapMode) => void;
  setSnapStrength: (ms: number) => void;
  setBpm: (bpm: number | null) => void;
}

export const createTimingSlice: StateCreator<AppStore, [], [], TimingSlice> = (
  set
) => ({
  isRecording: false,
  currentMarkIndex: 0,
  markKey: "Space",
  leadIn: -50,
  snapMode: "none",
  snapStrength: 30,
  bpm: null,

  startRecording: () => set({ isRecording: true, currentMarkIndex: 0 }),
  stopRecording: () => set({ isRecording: false, currentMarkIndex: 0 }),
  setIsRecording: (recording) => set({ isRecording: recording }),

  setCurrentMarkIndex: (index) => set({ currentMarkIndex: index }),

  setMarkKey: (key) => set({ markKey: key }),

  setLeadIn: (ms) => set({ leadIn: ms }),

  setSnapMode: (mode) => set({ snapMode: mode }),

  setSnapStrength: (ms) => set({ snapStrength: ms }),

  setBpm: (bpm) => set({ bpm: bpm }),
});
