import type { StateCreator } from "zustand";
import type { AppStore } from "./store";

export type PanelId = "media" | "lyrics" | "preview";

export interface UISlice {
  activePanel: PanelId;
  timelineZoom: number;
  showWaveform: boolean;

  setActivePanel: (panel: PanelId) => void;
  setTimelineZoom: (zoom: number) => void;
  setShowWaveform: (show: boolean) => void;
}

export const createUISlice: StateCreator<AppStore, [], [], UISlice> = (set) => ({
  activePanel: "media",
  timelineZoom: 1,
  showWaveform: true,

  setActivePanel: (panel) => set({ activePanel: panel }),
  setTimelineZoom: (zoom) => set({ timelineZoom: zoom }),
  setShowWaveform: (show) => set({ showWaveform: show }),
});
