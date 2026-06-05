import type { StateCreator } from "zustand";
import type { AppStore } from "./store";

export type PanelId = "media" | "lyrics" | "preview" | "style";

export interface UISlice {
  activePanel: PanelId;
  timelineZoom: number;
  showWaveform: boolean;
  showSettings: boolean;

  // Resizable panel layout persistence
  panelSizes: {
    left: number;
    center: number;
    right: number;
    top: number;
    bottom: number;
  };

  setActivePanel: (panel: PanelId) => void;
  setTimelineZoom: (zoom: number) => void;
  setShowWaveform: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setPanelSizes: (sizes: Partial<UISlice["panelSizes"]>) => void;
  loadPanelSizes: () => void;
}

const PANEL_SIZES_KEY = "karaoke-panel-sizes";

const defaultPanelSizes = {
  left: 20,
  center: 50,
  right: 30,
  top: 65,
  bottom: 35,
};

export const createUISlice: StateCreator<AppStore, [], [], UISlice> = (set) => ({
  activePanel: "media",
  timelineZoom: 1,
  showWaveform: true,
  showSettings: false,
  panelSizes: defaultPanelSizes,

  setActivePanel: (panel) => set({ activePanel: panel }),
  setTimelineZoom: (zoom) => set({ timelineZoom: zoom }),
  setShowWaveform: (show) => set({ showWaveform: show }),
  setShowSettings: (show) => set({ showSettings: show }),

  setPanelSizes: (sizes) =>
    set((state) => {
      const newSizes = { ...state.panelSizes, ...sizes };
      try {
        localStorage.setItem(PANEL_SIZES_KEY, JSON.stringify(newSizes));
      } catch { /* ignore */ }
      return { panelSizes: newSizes };
    }),

  loadPanelSizes: () => {
    try {
      const stored = localStorage.getItem(PANEL_SIZES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ panelSizes: { ...defaultPanelSizes, ...parsed } });
      }
    } catch { /* ignore */ }
  },
});
