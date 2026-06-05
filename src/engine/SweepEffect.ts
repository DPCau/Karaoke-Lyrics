import type { LyricChar } from "../types/lyrics";
import type { FillDirection } from "../types/style";

/** Supported easing curve types. */
export type EasingType = "linear" | "ease-in" | "ease-out" | "ease-in-out";

/** A rectangle used for clipping the sung portion of a character. */
export interface ClipRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculate how much of a character has been "sung" (0–1).
 *
 * Uses the character's `startTime` and `endTime` relative to the current
 * playback position. An optional per-character easing (`char.easing`) can be
 * provided; falls back to linear if none is set.
 */
export function calculateFillRatio(
  char: LyricChar,
  currentTime: number,
  easing?: EasingType
): number {
  const duration = char.endTime - char.startTime;
  if (duration <= 0) {
    // Zero-duration → fully sung if time >= start
    return currentTime >= char.startTime ? 1 : 0;
  }
  const elapsed = currentTime - char.startTime;
  const t = Math.max(0, Math.min(1, elapsed / duration));
  return easing ? applyEasing(t, easing) : t;
}

/**
 * Map a normalised progress value (0–1) through an easing curve.
 */
export function applyEasing(t: number, easing: EasingType): number {
  switch (easing) {
    case "linear":
      return t;
    case "ease-in":
      return t * t;
    case "ease-out":
      return t * (2 - t);
    case "ease-in-out":
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
}

/**
 * Compute the clip rectangle for the sung portion of a character based on
 * fill ratio and sweep direction.
 */
export function calculateClipRect(
  x: number,
  y: number,
  width: number,
  height: number,
  fillRatio: number,
  direction: FillDirection
): ClipRect {
  const clamped = Math.max(0, Math.min(1, fillRatio));
  switch (direction) {
    case "left-to-right":
      return { x, y, width: width * clamped, height };
    case "right-to-left":
      return {
        x: x + width * (1 - clamped),
        y,
        width: width * clamped,
        height,
      };
    case "top-to-bottom":
      return { x, y, width, height: height * clamped };
    case "bottom-to-top":
      return {
        x,
        y: y + height * (1 - clamped),
        width,
        height: height * clamped,
      };
  }
}

/**
 * Create a linear gradient that transitions between `unsungColor` and
 * `sungColor` around the sweep boundary, producing a smooth colour
 * transition rather than a hard cut.
 *
 * The gradient is centred at the sweep split boundary and spans
 * `gradientWidth` proportion of the character width (or height for
 * vertical sweeps).
 */
export function createSweepGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fillRatio: number,
  gradientWidth: number,
  direction: FillDirection,
  sungColor: string,
  unsungColor: string
): CanvasGradient {
  const clamped = Math.max(0, Math.min(1, fillRatio));
  const gx = Math.max(1, gradientWidth * w);

  switch (direction) {
    case "left-to-right": {
      const splitX = x + w * clamped;
      const grad = ctx.createLinearGradient(splitX - gx, y, splitX + gx, y);
      grad.addColorStop(0, unsungColor);
      grad.addColorStop(0.5, sungColor);
      grad.addColorStop(1, unsungColor);
      return grad;
    }
    case "right-to-left": {
      const splitX = x + w * (1 - clamped);
      const grad = ctx.createLinearGradient(splitX - gx, y, splitX + gx, y);
      grad.addColorStop(0, unsungColor);
      grad.addColorStop(0.5, sungColor);
      grad.addColorStop(1, unsungColor);
      return grad;
    }
    case "top-to-bottom": {
      const splitY = y + h * clamped;
      const grad = ctx.createLinearGradient(x, splitY - gx, x, splitY + gx);
      grad.addColorStop(0, unsungColor);
      grad.addColorStop(0.5, sungColor);
      grad.addColorStop(1, unsungColor);
      return grad;
    }
    case "bottom-to-top": {
      const splitY = y + h * (1 - clamped);
      const grad = ctx.createLinearGradient(x, splitY - gx, x, splitY + gx);
      grad.addColorStop(0, unsungColor);
      grad.addColorStop(0.5, sungColor);
      grad.addColorStop(1, unsungColor);
      return grad;
    }
  }
}
