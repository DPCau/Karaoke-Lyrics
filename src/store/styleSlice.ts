import type { StateCreator } from "zustand";
import type { AppStore } from "./store";
import type { FontConfig } from "../types/style";

export interface StyleSlice {
  fontFamily: string;
  fontSize: number;
  unsungColor: string;
  sungColor: string;
  fontConfig: FontConfig;

  setFontFamily: (family: string) => void;
  setFontSize: (size: number) => void;
  setUnsungColor: (color: string) => void;
  setSungColor: (color: string) => void;
  setFontConfig: (config: Partial<FontConfig>) => void;
}

export const createStyleSlice: StateCreator<
  AppStore,
  [],
  [],
  StyleSlice
> = (set, _get) => ({
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: 48,
  unsungColor: "#888888",
  sungColor: "#3b82f6",
  fontConfig: {
    family: "Inter, system-ui, sans-serif",
    size: 48,
    weight: 700,
    alignment: "center",
    verticalPosition: 75,
    lineHeight: 1.4,
  },

  setFontFamily: (family) =>
    set((s) => ({ fontFamily: family, fontConfig: { ...s.fontConfig, family } })),
  setFontSize: (size) =>
    set((s) => ({ fontSize: size, fontConfig: { ...s.fontConfig, size } })),
  setUnsungColor: (color) => set({ unsungColor: color }),
  setSungColor: (color) => set({ sungColor: color }),
  setFontConfig: (config) =>
    set((s) => ({ fontConfig: { ...s.fontConfig, ...config } })),
});
