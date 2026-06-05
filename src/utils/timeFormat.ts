/**
 * Format milliseconds as `MM:SS.mmm`.
 *
 * @example formatTimecode(90500) // "01:30.500"
 */
export function formatTimecode(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const millis = Math.floor(ms % 1000);
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const mmm = String(millis).padStart(3, "0");
  return `${mm}:${ss}.${mmm}`;
}

/**
 * Format milliseconds as an LRC timestamp: `[MM:SS.xx]`.
 *
 * @example formatLrcTime(90500) // "[01:30.50]"
 */
export function formatLrcTime(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const centiseconds = Math.floor((ms % 1000) / 10);
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  const xx = String(centiseconds).padStart(2, "0");
  return `[${mm}:${ss}.${xx}]`;
}

/**
 * Parse a timecode string into milliseconds.
 *
 * Accepted formats:
 * - `MM:SS.mmm`   (minutes:seconds.milliseconds)
 * - `MM:SS.xx`    (minutes:seconds.centiseconds)
 * - `SS.mmm`      (seconds.milliseconds)
 * - `[MM:SS.xx]`  (LRC-style, brackets stripped)
 * - Numeric ms string (e.g. `"90500"`)
 *
 * Returns `NaN` if the string cannot be parsed.
 */
export function parseTimecode(str: string): number {
  const trimmed = str.trim().replace(/^\[|\]$/g, "");

  // Pure numeric → treat as milliseconds
  if (/^\d+$/.test(trimmed)) {
    return Number.parseInt(trimmed, 10);
  }

  // MM:SS.mmm or MM:SS.xx
  const mmss = trimmed.match(/^(\d+):(\d{2})\.(\d+)$/);
  if (mmss) {
    const minutes = Number.parseInt(mmss[1], 10);
    const seconds = Number.parseInt(mmss[2], 10);
    const frac = mmss[3];
    // Determine precision: "50" = centiseconds (2 digits), "500" = milliseconds (3)
    const divisor = frac.length === 2 ? 100 : 1000;
    const fraction = Number.parseInt(frac.padEnd(3, "0"), 10);
    return minutes * 60000 + seconds * 1000 + fraction / (divisor / 1000);
  }

  // SS.mmm (seconds.fraction)
  const ssFrac = trimmed.match(/^(\d+)\.(\d+)$/);
  if (ssFrac) {
    const seconds = Number.parseInt(ssFrac[1], 10);
    const frac = ssFrac[2];
    const divisor = frac.length === 2 ? 100 : 1000;
    const fraction = Number.parseInt(frac.padEnd(3, "0"), 10);
    return seconds * 1000 + fraction / (divisor / 1000);
  }

  return NaN;
}
