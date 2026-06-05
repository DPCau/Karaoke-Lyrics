export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FontConfig {
  family: string;
  size: number;
  weight: number;
  italic: boolean;
  alignment: "left" | "center" | "right";
  verticalPosition: number;
  lineHeight: number;
  letterSpacing: number;
}

export type FillDirection =
  | "left-to-right"
  | "right-to-left"
  | "top-to-bottom"
  | "bottom-to-top";

export type OutlineStyle = "outset" | "inset" | "center";

export type EasingCurve =
  | "linear"
  | "ease-in"
  | "ease-out"
  | "ease-in-out";

export type BarWidthMode = "text" | "line" | "full";

export interface SweepConfig {
  enabled: boolean;
  color: string;
  glowWidth: number;
  direction: FillDirection;
  gradientWidth: number;
  easing: EasingCurve;
}

export interface OutlineConfig {
  enabled: boolean;
  color: string;
  width: number;
  style: OutlineStyle;
}

export interface ShadowConfig {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface GlowConfig {
  enabled: boolean;
  color: string;
  radius: number;
  intensity: number;
}

export interface BackgroundBarConfig {
  enabled: boolean;
  color: string;
  padding: number;
  borderRadius: number;
  opacity: number;
  widthMode: BarWidthMode;
}

export interface LayoutConfig {
  alignment: "left" | "center" | "right";
  verticalPosition: number;
  dualLine: boolean;
  lineGap: number;
  currentLineScale: number;
  nextLineScale: number;
}

export interface LyricStyle {
  font: FontConfig;
  unsungColor: string;
  sungColor: string;
  sweep: SweepConfig;
  outline: OutlineConfig;
  shadow: ShadowConfig;
  glow: GlowConfig;
  background: RGBA;
  backgroundBar: BackgroundBarConfig;
  layout: LayoutConfig;
}
