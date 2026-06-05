import type { StateCreator } from "zustand";
import type { AppStore } from "./store";
import type {
  RGBA,
  FontConfig,
  OutlineConfig,
  ShadowConfig,
  GlowConfig,
  SweepConfig,
  BackgroundBarConfig,
  LayoutConfig,
  FillDirection,
} from "../types/style";

/** Human-readable preset identifiers. */
export type StylePreset =
  | "classic"
  | "modern"
  | "neon"
  | "subtle"
  | "bold";

export interface StyleSlice {
  // -- Individual convenience fields -----------------------------------------
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  italic: boolean;
  unsungColor: string;
  sungColor: string;

  // -- Full config objects ---------------------------------------------------
  fontConfig: FontConfig;
  outline: OutlineConfig;
  shadow: ShadowConfig;
  glow: GlowConfig;
  sweep: SweepConfig;
  backgroundBar: BackgroundBarConfig;
  layout: LayoutConfig;
  background: RGBA;

  // -- Setters for convenience fields ----------------------------------------
  setFontFamily: (family: string) => void;
  setFontSize: (size: number) => void;
  setFontWeight: (weight: number) => void;
  setItalic: (italic: boolean) => void;
  setUnsungColor: (color: string) => void;
  setSungColor: (color: string) => void;

  // -- Setters for config objects --------------------------------------------
  setFontConfig: (config: Partial<FontConfig>) => void;
  setOutline: (config: Partial<OutlineConfig>) => void;
  setShadow: (config: Partial<ShadowConfig>) => void;
  setGlow: (config: Partial<GlowConfig>) => void;
  setSweep: (config: Partial<SweepConfig>) => void;
  setBackgroundBar: (config: Partial<BackgroundBarConfig>) => void;
  setBackground: (background: RGBA) => void;
  setLayout: (config: Partial<LayoutConfig>) => void;

  // -- Presets ---------------------------------------------------------------
  /** Apply one of the 5 built-in style presets. */
  applyPreset: (preset: StylePreset) => void;
}

// ---------------------------------------------------------------------------
// Default configs
// ---------------------------------------------------------------------------

const DEFAULT_FONT: FontConfig = {
  family: "Inter, system-ui, sans-serif",
  size: 48,
  weight: 700,
  italic: false,
  alignment: "center",
  verticalPosition: 75,
  lineHeight: 1.4,
  letterSpacing: 0,
};

const DEFAULT_OUTLINE: OutlineConfig = {
  enabled: false,
  color: "#000000",
  width: 1,
  style: "outset",
};

const DEFAULT_SHADOW: ShadowConfig = {
  enabled: true,
  color: "rgba(0,0,0,0.8)",
  blur: 4,
  offsetX: 0,
  offsetY: 2,
};

const DEFAULT_GLOW: GlowConfig = {
  enabled: false,
  color: "#3b82f6",
  radius: 8,
  intensity: 50,
};

const DEFAULT_SWEEP: SweepConfig = {
  enabled: true,
  color: "#3b82f6",
  glowWidth: 3,
  direction: "left-to-right" as FillDirection,
  gradientWidth: 0.3,
  easing: "linear",
};

const DEFAULT_BACKGROUND_BAR: BackgroundBarConfig = {
  enabled: false,
  color: "rgba(0,0,0,0.5)",
  padding: 16,
  borderRadius: 8,
  opacity: 0.6,
  widthMode: "text",
};

const DEFAULT_LAYOUT: LayoutConfig = {
  alignment: "center",
  verticalPosition: 75,
  dualLine: true,
  lineGap: 12,
  currentLineScale: 1,
  nextLineScale: 0.7,
};

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

function presetClassic(): Partial<StyleSlice> {
  return {
    fontSize: 48,
    fontWeight: 700,
    italic: false,
    unsungColor: "#e0e0e0",
    sungColor: "#3b82f6",
    fontConfig: { ...DEFAULT_FONT, family: "Inter, system-ui, sans-serif", size: 48, weight: 700 },
    outline: { enabled: false, color: "#000000", width: 1, style: "outset" },
    shadow: { enabled: true, color: "rgba(0,0,0,0.8)", blur: 4, offsetX: 0, offsetY: 2 },
    glow: { enabled: false, color: "#3b82f6", radius: 8, intensity: 50 },
    sweep: { ...DEFAULT_SWEEP, enabled: true, color: "#3b82f6", easing: "linear" },
    backgroundBar: { enabled: false, color: "rgba(0,0,0,0.5)", padding: 16, borderRadius: 8, opacity: 0.6, widthMode: "text" },
    layout: { ...DEFAULT_LAYOUT },
  };
}

function presetModern(): Partial<StyleSlice> {
  return {
    fontSize: 42,
    fontWeight: 600,
    italic: false,
    unsungColor: "#aaaaaa",
    sungColor: "#f472b6",
    fontConfig: { ...DEFAULT_FONT, family: "'SF Pro Display', -apple-system, sans-serif", size: 42, weight: 600 },
    outline: { enabled: false, color: "#000000", width: 1, style: "outset" },
    shadow: { enabled: true, color: "rgba(0,0,0,0.6)", blur: 6, offsetX: 0, offsetY: 3 },
    glow: { enabled: true, color: "#f472b6", radius: 10, intensity: 30 },
    sweep: { ...DEFAULT_SWEEP, enabled: true, color: "#f472b6", direction: "left-to-right" as FillDirection, easing: "ease-out" },
    backgroundBar: { enabled: false, color: "rgba(0,0,0,0.4)", padding: 14, borderRadius: 8, opacity: 0.5, widthMode: "text" },
    layout: { ...DEFAULT_LAYOUT },
  };
}

function presetNeon(): Partial<StyleSlice> {
  return {
    fontSize: 56,
    fontWeight: 800,
    italic: false,
    unsungColor: "#444444",
    sungColor: "#22d3ee",
    fontConfig: { ...DEFAULT_FONT, family: "'Segoe UI', system-ui, sans-serif", size: 56, weight: 800 },
    outline: { enabled: true, color: "#000000", width: 2, style: "outset" },
    shadow: { enabled: true, color: "rgba(0,0,0,0.9)", blur: 3, offsetX: 0, offsetY: 1 },
    glow: { enabled: true, color: "#22d3ee", radius: 16, intensity: 80 },
    sweep: { ...DEFAULT_SWEEP, enabled: true, color: "#22d3ee", direction: "left-to-right" as FillDirection, easing: "linear" },
    backgroundBar: { enabled: true, color: "rgba(0,0,0,0.7)", padding: 20, borderRadius: 12, opacity: 0.7, widthMode: "line" },
    layout: { ...DEFAULT_LAYOUT },
  };
}

function presetSubtle(): Partial<StyleSlice> {
  return {
    fontSize: 38,
    fontWeight: 500,
    italic: false,
    unsungColor: "#888888",
    sungColor: "#a3e635",
    fontConfig: { ...DEFAULT_FONT, family: "'Noto Sans', system-ui, sans-serif", size: 38, weight: 500 },
    outline: { enabled: false, color: "#000000", width: 1, style: "outset" },
    shadow: { enabled: true, color: "rgba(0,0,0,0.4)", blur: 2, offsetX: 0, offsetY: 1 },
    glow: { enabled: false, color: "#a3e635", radius: 6, intensity: 20 },
    sweep: { ...DEFAULT_SWEEP, enabled: true, color: "#a3e635", direction: "left-to-right" as FillDirection, easing: "ease-in-out" },
    backgroundBar: { enabled: false, color: "rgba(0,0,0,0.3)", padding: 12, borderRadius: 6, opacity: 0.4, widthMode: "text" },
    layout: { ...DEFAULT_LAYOUT },
  };
}

function presetBold(): Partial<StyleSlice> {
  return {
    fontSize: 64,
    fontWeight: 900,
    italic: false,
    unsungColor: "#ffffff",
    sungColor: "#f97316",
    fontConfig: { ...DEFAULT_FONT, family: "Impact, 'Arial Black', sans-serif", size: 64, weight: 900 },
    outline: { enabled: true, color: "#1a1a1a", width: 3, style: "outset" },
    shadow: { enabled: true, color: "rgba(0,0,0,0.9)", blur: 6, offsetX: 2, offsetY: 4 },
    glow: { enabled: true, color: "#f97316", radius: 12, intensity: 60 },
    sweep: { ...DEFAULT_SWEEP, enabled: true, color: "#f97316", direction: "left-to-right" as FillDirection, easing: "linear" },
    backgroundBar: { enabled: true, color: "rgba(0,0,0,0.8)", padding: 24, borderRadius: 4, opacity: 0.8, widthMode: "full" },
    layout: { ...DEFAULT_LAYOUT },
  };
}

// ---------------------------------------------------------------------------
// Slice creator
// ---------------------------------------------------------------------------

export const createStyleSlice: StateCreator<
  AppStore,
  [],
  [],
  StyleSlice
> = (set, _get) => ({
  // -- Convenience fields ----------------------------------------------------
  fontFamily: DEFAULT_FONT.family,
  fontSize: DEFAULT_FONT.size,
  fontWeight: DEFAULT_FONT.weight,
  italic: DEFAULT_FONT.italic,
  unsungColor: "#888888",
  sungColor: "#3b82f6",

  // -- Config objects --------------------------------------------------------
  fontConfig: { ...DEFAULT_FONT },
  outline: { ...DEFAULT_OUTLINE },
  shadow: { ...DEFAULT_SHADOW },
  glow: { ...DEFAULT_GLOW },
  sweep: { ...DEFAULT_SWEEP },
  backgroundBar: { ...DEFAULT_BACKGROUND_BAR },
  layout: { ...DEFAULT_LAYOUT },
  background: { r: 0, g: 0, b: 0, a: 0 }, // fully transparent

  // -- Convenience setters ---------------------------------------------------
  setFontFamily: (family) =>
    set((s) => ({
      fontFamily: family,
      fontConfig: { ...s.fontConfig, family },
    })),

  setFontSize: (size) =>
    set((s) => ({
      fontSize: size,
      fontConfig: { ...s.fontConfig, size },
    })),

  setFontWeight: (weight) =>
    set((s) => ({
      fontWeight: weight,
      fontConfig: { ...s.fontConfig, weight },
    })),

  setItalic: (italic) =>
    set((s) => ({
      italic,
      fontConfig: { ...s.fontConfig, italic },
    })),

  setUnsungColor: (color) => set({ unsungColor: color }),

  setSungColor: (color) => set({ sungColor: color }),

  // -- Config object setters -------------------------------------------------
  setFontConfig: (config) =>
    set((s) => ({
      fontConfig: { ...s.fontConfig, ...config },
      // Keep convenience fields in sync
      ...(config.family !== undefined ? { fontFamily: config.family } : {}),
      ...(config.size !== undefined ? { fontSize: config.size } : {}),
      ...(config.weight !== undefined ? { fontWeight: config.weight } : {}),
      ...(config.italic !== undefined ? { italic: config.italic } : {}),
    })),

  setOutline: (config) =>
    set((s) => ({ outline: { ...s.outline, ...config } })),

  setShadow: (config) =>
    set((s) => ({ shadow: { ...s.shadow, ...config } })),

  setGlow: (config) =>
    set((s) => ({ glow: { ...s.glow, ...config } })),

  setSweep: (config) =>
    set((s) => ({ sweep: { ...s.sweep, ...config } })),

  setBackgroundBar: (config) =>
    set((s) => ({ backgroundBar: { ...s.backgroundBar, ...config } })),

  setBackground: (background) => set({ background }),

  setLayout: (config) =>
    set((s) => ({ layout: { ...s.layout, ...config } })),

  // -- Presets ---------------------------------------------------------------
  applyPreset: (preset) => {
    let changes: Partial<StyleSlice>;
    switch (preset) {
      case "classic":
        changes = presetClassic();
        break;
      case "modern":
        changes = presetModern();
        break;
      case "neon":
        changes = presetNeon();
        break;
      case "subtle":
        changes = presetSubtle();
        break;
      case "bold":
        changes = presetBold();
        break;
      default:
        return;
    }
    set(changes as Partial<StyleSlice>);
  },
});
