import type { LyricLineData, ParsedLyrics } from "../types/lyrics";

/**
 * LRC time tag regex: [mm:ss.xx] or [mm:ss.xxx]
 * Groups: minutes, seconds, centiseconds/milliseconds
 */
const LRC_TIME_RE = /\[(\d{1,3}):(\d{2})[.:](\d{2,3})\]/;

/** Enhanced LRC inline word tag: <mm:ss.xx> */
const LRC_WORD_RE = /<(\d{1,3}):(\d{2})[.:](\d{2,3})>/;

/** SRT time range: 00:00:12,340 --> 00:00:15,670 */
const SRT_TIME_RE =
  /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/;

function parseLRCTimestamp(minutes: string, seconds: string, frac: string): number {
  const mins = parseInt(minutes, 10);
  const secs = parseInt(seconds, 10);
  let ms: number;
  if (frac.length === 2) {
    // centiseconds -> milliseconds
    ms = parseInt(frac, 10) * 10;
  } else {
    ms = parseInt(frac, 10);
  }
  return mins * 60_000 + secs * 1000 + ms;
}

function parseSRTTimestamp(str: string): number {
  const parts = str.split(/[:,]/);
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const s = parseInt(parts[2], 10);
  const ms = parseInt(parts[3], 10);
  return h * 3_600_000 + m * 60_000 + s * 1000 + ms;
}

/**
 * TextParser: Parse lyrics in plain text, LRC, SRT, and ASS formats.
 */
export class TextParser {
  /**
   * Parse plain text: split by newlines, trim, merge blank lines.
   */
  parsePlain(input: string): LyricLineData[] {
    const lines = input.split(/\r?\n/);
    const result: LyricLineData[] = [];
    let lastWasBlank = false;

    for (const raw of lines) {
      const text = raw.trim();
      if (text.length === 0) {
        if (!lastWasBlank) {
          result.push({ text: "" });
          lastWasBlank = true;
        }
      } else {
        result.push({ text });
        lastWasBlank = false;
      }
    }

    // Trim trailing blank lines
    while (result.length > 0 && result[result.length - 1].text === "") {
      result.pop();
    }

    return result;
  }

  /**
   * Parse LRC format lyrics.
   *
   * Supports:
   * - Metadata tags: [ti:xxx], [ar:xxx], [al:xxx], [by:xxx], [offset:xxx]
   * - Line timestamps: [mm:ss.xx]text
   * - Enhanced word tags: [mm:ss.xx]歌<00:12.34>词<00:12.67>
   * - Multi-timestamp: [00:12.34][00:45.67]repeat
   */
  parseLRC(input: string): ParsedLyrics {
    const lines = input.split(/\r?\n/);
    const metadata: Record<string, string> = {};
    const lyricLines: LyricLineData[] = [];
    let offset = 0;

    const metadataRe = /^\[(\w{2,}):(.+)\]$/;

    for (const raw of lines) {
      const line = raw.trim();
      if (line.length === 0) continue;

      // Try metadata
      const metaMatch = line.match(metadataRe);
      if (metaMatch) {
        const key = metaMatch[1].toLowerCase();
        const value = metaMatch[2].trim();
        if (key === "offset") {
          offset = parseInt(value, 10) || 0;
        } else if (["ti", "ar", "al", "by", "re", "ve", "au", "length", "tool"].includes(key)) {
          const metaKey =
            key === "ti" ? "title" :
            key === "ar" ? "artist" :
            key === "al" ? "album" :
            key === "by" ? "creator" :
            key;
          metadata[metaKey] = value;
        } else {
          metadata[key] = value;
        }
        continue;
      }

      // Extract all timestamps from the line
      const timestamps: number[] = [];
      let remaining = line;
      let match: RegExpExecArray | null;

      const timeRe = new RegExp(LRC_TIME_RE.source, "g");
      while ((match = timeRe.exec(remaining)) !== null) {
        timestamps.push(
          parseLRCTimestamp(match[1], match[2], match[3])
        );
      }

      // Remove all timestamp tags to get text content
      let text = remaining.replace(LRC_TIME_RE, "").trim();

      // Parse enhanced word-level tags within the text
      if (LRC_WORD_RE.test(text)) {
        text = text.replace(LRC_WORD_RE, "").trim();
      }

      if (timestamps.length > 0) {
        for (const ts of timestamps) {
          lyricLines.push({
            text,
            startTime: Math.max(0, ts + offset),
          });
        }
      } else if (text.length > 0) {
        // Text without timestamp — treat as a non-timed line
        lyricLines.push({ text });
      }
    }

    // Sort by start time (lines without time come first)
    lyricLines.sort((a, b) => {
      if (a.startTime === undefined && b.startTime === undefined) return 0;
      if (a.startTime === undefined) return -1;
      if (b.startTime === undefined) return 1;
      return a.startTime - b.startTime;
    });

    // Compute end times from next line's start
    for (let i = 0; i < lyricLines.length; i++) {
      if (lyricLines[i].startTime !== undefined && i < lyricLines.length - 1) {
        const nextStart = lyricLines[i + 1].startTime;
        if (nextStart !== undefined && nextStart > lyricLines[i].startTime!) {
          lyricLines[i].endTime = nextStart;
        }
      }
    }

    return { format: "lrc", metadata, lines: lyricLines };
  }

  /**
   * Parse SRT format subtitles.
   *
   * Format:
   * 1
   * 00:00:12,340 --> 00:00:15,670
   * Text content
   *
   * Supports multi-line text.
   */
  parseSRT(input: string): ParsedLyrics {
    const blocks = input.trim().split(/\r?\n\r?\n/);
    const metadata: Record<string, string> = {};
    const lyricLines: LyricLineData[] = [];

    for (const block of blocks) {
      const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) continue;

      let lineIdx = 0;

      // Skip optional sequence number
      if (/^\d+$/.test(lines[lineIdx])) {
        lineIdx++;
      }

      // Parse time range
      const timeMatch = lines[lineIdx].match(SRT_TIME_RE);
      if (!timeMatch) continue;
      lineIdx++;

      const start = parseSRTTimestamp(`${timeMatch[1]}:${timeMatch[2]}:${timeMatch[3]},${timeMatch[4]}`);
      const end = parseSRTTimestamp(`${timeMatch[5]}:${timeMatch[6]}:${timeMatch[7]},${timeMatch[8]}`);

      // Remaining lines are text content
      let text = lines.slice(lineIdx).join("\n");

      // Strip HTML tags
      text = text.replace(/<[^>]*>/g, "").trim();

      lyricLines.push({ text, startTime: start, endTime: end });
    }

    return { format: "srt", metadata, lines: lyricLines };
  }

  /**
   * Parse ASS (Advanced SubStation Alpha) format.
   *
   * Recognizes [Script Info], [V4+ Styles], [Events] sections.
   * Extracts Dialogue lines: Dialogue: layer, start, end, style, actor, marginL, marginR, marginV, effect, text
   */
  parseASS(input: string): ParsedLyrics {
    const lines = input.split(/\r?\n/);
    const metadata: Record<string, string> = {};
    const lyricLines: LyricLineData[] = [];

    let inScriptInfo = false;
    let inEvents = false;

    const dialogueRe = /^Dialogue:\s*(.*)$/i;
    const infoRe = /^([^:]+):\s*(.*)$/;

    for (const raw of lines) {
      const line = raw.trim();
      if (line.startsWith(";") || line.startsWith("!")) continue; // Comments

      if (line.startsWith("[")) {
        inScriptInfo = line.toLowerCase() === "[script info]";
        inEvents = line.toLowerCase() === "[events]";
        continue;
      }

      if (inScriptInfo) {
        const match = line.match(infoRe);
        if (match) {
          metadata[match[1].trim()] = match[2].trim();
        }
        continue;
      }

      if (inEvents) {
        const match = line.match(dialogueRe);
        if (match) {
          const parts = match[1].split(",");
          // Format: layer, start, end, style, actor, marginL, marginR, marginV, effect, text
          if (parts.length >= 10) {
            const startStr = parts[1].trim();
            const endStr = parts[2].trim();
            const text = parts.slice(9).join(",").trim();

            const start = this.parseASSTime(startStr);
            const end = this.parseASSTime(endStr);

            // Strip ASS override tags
            const cleanText = text.replace(/\{[^}]*\}/g, "").replace(/\\N/g, "\n").trim();

            if (cleanText) {
              lyricLines.push({ text: cleanText, startTime: start, endTime: end });
            }
          }
        }
      }
    }

    return { format: "ass", metadata, lines: lyricLines };
  }

  private parseASSTime(str: string): number {
    // ASS time: H:MM:SS.cc (centiseconds)
    const parts = str.split(/[:.]/);
    if (parts.length < 4) return 0;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const s = parseInt(parts[2], 10);
    const cs = parseInt(parts[3], 10);
    return h * 3_600_000 + m * 60_000 + s * 1000 + cs * 10;
  }

  /**
   * Detect the format of the input string.
   */
  detectFormat(input: string): "plain" | "lrc" | "srt" | "ass" {
    const trimmed = input.trim();
    const firstFewLines = trimmed.split(/\r?\n/).slice(0, 10);

    // Check for ASS: [Script Info] header
    if (firstFewLines.some((l) => l.trim().toLowerCase() === "[script info]")) {
      return "ass";
    }

    // Check for SRT: a sequence of number + timestamp line
    const srtPattern = /^\d+\s*$/;
    const srtTimePattern = /\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->/;
    let foundNumber = false;
    let foundTime = false;
    for (const line of firstFewLines) {
      if (srtPattern.test(line.trim())) {
        foundNumber = true;
      }
      if (srtTimePattern.test(line)) {
        foundTime = true;
      }
    }
    if (foundNumber && foundTime) {
      return "srt";
    }

    // Check for LRC: [mm:ss.xx] pattern in first few lines
    const lrcPattern = /^\[\d{1,3}:\d{2}[.:]\d{2,3}\]/;
    if (firstFewLines.some((l) => lrcPattern.test(l.trim()))) {
      return "lrc";
    }

    return "plain";
  }

  /**
   * Auto-detect format and parse accordingly.
   */
  parse(input: string): ParsedLyrics {
    const format = this.detectFormat(input);
    switch (format) {
      case "lrc":
        return this.parseLRC(input);
      case "srt":
        return this.parseSRT(input);
      case "ass":
        return this.parseASS(input);
      case "plain":
      default:
        return {
          format: "plain",
          metadata: {},
          lines: this.parsePlain(input),
        };
    }
  }
}
