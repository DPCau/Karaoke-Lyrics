import type { StateCreator } from "zustand";
import type { AppStore } from "./store";

export interface TimingSlice {
  isRecording: boolean;
  currentMarkIndex: number;
  markKey: string | null;
  leadIn: number;

  setIsRecording: (recording: boolean) => void;
  setCurrentMarkIndex: (index: number) => void;
  setMarkKey: (key: string | null) => void;
  setLeadIn: (ms: number) => void;
}

export const createTimingSlice: StateCreator<AppStore, [], [], TimingSlice> = (
  set
) => ({
  isRecording: false,
  currentMarkIndex: 0,
  markKey: null,
  leadIn: 500,

  setIsRecording: (recording) => set({ isRecording: recording }),
  setCurrentMarkIndex: (index) => set({ currentMarkIndex: index }),
  setMarkKey: (key) => set({ markKey: key }),
  setLeadIn: (ms) => set({ leadIn: ms }),
});
