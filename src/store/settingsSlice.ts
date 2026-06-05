import type { StateCreator } from "zustand";
import type { AppStore } from "./store";
import { DEFAULT_SETTINGS, type AppSettings } from "../types/settings";

const SETTINGS_KEY = "karaoke-app-settings";

export interface SettingsSlice {
  settings: AppSettings;
  loadSettings: () => void;
  saveSettings: () => void;
  updateSetting: <K extends keyof AppSettings>(
    category: K,
    updates: Partial<AppSettings[K]>
  ) => void;
  resetToDefaults: () => void;
}

export const createSettingsSlice: StateCreator<
  AppStore,
  [],
  [],
  SettingsSlice
> = (set, get) => ({
  settings: DEFAULT_SETTINGS,

  loadSettings: () => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppSettings;
        set({
          settings: {
            ...DEFAULT_SETTINGS,
            ...parsed,
            general: { ...DEFAULT_SETTINGS.general, ...parsed.general },
            timing: { ...DEFAULT_SETTINGS.timing, ...parsed.timing },
            playback: { ...DEFAULT_SETTINGS.playback, ...parsed.playback },
            export: { ...DEFAULT_SETTINGS.export, ...parsed.export },
            window: { ...DEFAULT_SETTINGS.window, ...parsed.window },
          },
        });
      }
    } catch {
      // Ignore parse errors
    }
  },

  saveSettings: () => {
    try {
      const { settings } = get();
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }
  },

  updateSetting: (category: keyof AppSettings, updates: Record<string, unknown>) => {
    set((state) => {
      const current = state.settings[category];
      const merged = typeof current === "object" && !Array.isArray(current)
        ? { ...(current as Record<string, unknown>), ...updates }
        : updates;
      const newSettings = {
        ...state.settings,
        [category]: merged,
      } as AppSettings;
      // Persist to localStorage
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      } catch {
        /* ignore */
      }
      return { settings: newSettings };
    });
  },

  resetToDefaults: () => {
    set({ settings: DEFAULT_SETTINGS });
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch {
      /* ignore */
    }
  },
});
