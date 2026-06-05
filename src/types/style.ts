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
  alignment: "left" | "center" | "right";
  verticalPosition: number;
  lineHeight: number;
}

export interface SweepConfig {
  enabled: boolean;
  color: string;
  glowWidth: number;
}

export interface OutlineConfig {
  enabled: boolean;
  color: string;
  width: number;
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

export interface LyricStyle {
  font: FontConfig;
  unsungColor: string;
  sungColor: string;
  sweep: SweepConfig;
  outline: OutlineConfig;
  shadow: ShadowConfig;
  glow: GlowConfig;
  background: RGBA;
}
