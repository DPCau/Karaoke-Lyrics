import type { RGBA } from "../types/style";

/**
 * Convert RGBA to a CSS color string: `rgba(r, g, b, a)`.
 */
export function rgbaToString(rgba: RGBA): string {
  return `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
}

/**
 * Parse a 6-digit hex string into RGB components.
 */
function hexRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace(/^#/, "");
  return {
    r: Number.parseInt(h.slice(0, 2), 16),
    g: Number.parseInt(h.slice(2, 4), 16),
    b: Number.parseInt(h.slice(4, 6), 16),
  };
}

/**
 * Convert a hex color string to RGBA. Supports `#rgb`, `#rrggbb`, `#rrggbbaa`.
 */
export function hexToRgba(hex: string): RGBA {
  let h = hex.replace(/^#/, "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  let a = 1;
  if (h.length === 8) {
    a = Number.parseInt(h.slice(6, 8), 16) / 255;
    h = h.slice(0, 6);
  }
  const { r, g, b } = hexRgb(`#${h}`);
  return { r, g, b, a };
}

/**
 * Convert RGBA to a 6-digit hex string (`#rrggbb`). Alpha is ignored.
 */
export function rgbaToHex(rgba: RGBA): string {
  const r = Math.round(rgba.r).toString(16).padStart(2, "0");
  const g = Math.round(rgba.g).toString(16).padStart(2, "0");
  const b = Math.round(rgba.b).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

/**
 * Convert RGBA to ASS (Advanced SubStation Alpha) color format.
 *
 * ASS uses `&HBBGGRR&` with the alpha byte inverted (00 = fully opaque, FF =
 * fully transparent).  The returned string is `&H<AABBGGRR>&` where AA is
 * the inverted alpha (0-255 in hex).
 */
export function rgbaToAssBgr(rgba: RGBA): string {
  const r = Math.round(rgba.r).toString(16).padStart(2, "0");
  const g = Math.round(rgba.g).toString(16).padStart(2, "0");
  const b = Math.round(rgba.b).toString(16).padStart(2, "0");
  // ASS alpha is inverted: 00 = opaque, FF = transparent
  const assAlpha = Math.round((1 - rgba.a) * 255)
    .toString(16)
    .padStart(2, "0");
  return `&H${assAlpha}${b}${g}${r}&`;
}

/**
 * Parse a CSS color string (hex, rgba, named) into RGBA.
 * Handles: #rgb, #rrggbb, #rrggbbaa, rgba(r,g,b,a), rgb(r,g,b).
 */
export function parseCssColor(css: string): RGBA {
  // Try hex first
  if (css.startsWith("#")) {
    return hexToRgba(css);
  }

  // Try rgba() / rgb()
  const rgbaMatch = css.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/
  );
  if (rgbaMatch) {
    return {
      r: Number.parseInt(rgbaMatch[1], 10),
      g: Number.parseInt(rgbaMatch[2], 10),
      b: Number.parseInt(rgbaMatch[3], 10),
      a: rgbaMatch[4] !== undefined ? Number.parseFloat(rgbaMatch[4]) : 1,
    };
  }

  // Fallback: treat as named color → black
  return { r: 0, g: 0, b: 0, a: 1 };
}
