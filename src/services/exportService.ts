/**
 * Export service — wraps Tauri IPC for LRC/JSON/ASS/Video export.
 *
 * Each export function:
 * 1. Converts frontend LyricLine[] to the serializable ExportLine format
 * 2. Builds export options from user config
 * 3. Invokes the corresponding Tauri command
 * 4. Returns the output file path on success
 */

import type { LyricLine } from "../types/lyrics";

// ---------------------------------------------------------------------------
// Types (mirroring the Rust backend)
// ---------------------------------------------------------------------------

export interface ExportChar {
  text: string;
  start_time: number;
  end_time: number;
}

export interface ExportLine {
  text: string;
  start_time: number;
  end_time: number;
  characters: ExportChar[];
  pronunciation: string | null;
}

export interface ExportOptions {
  format: string;
  encoding: string;
  bom: boolean;
  enhanced_word_tags: boolean;
  compact_json: boolean;
  title: string | null;
  artist: string | null;
  album: string | null;
  author: string | null;
  offset: number;

  // Video-specific
  video_input: string | null;
  video_output: string | null;
  video_preset: string | null;
  video_bitrate: string | null;

  // ASS-specific
  ass_font_name: string | null;
  ass_font_size: number | null;
  ass_resolution: { width: number; height: number } | null;
}

export interface VideoExportConfig {
  input_path: string;
  output_path: string;
  lines_json: string;
  options_json: string;
}

export interface ExportProgress {
  progress: number;
  stage: string;
  speed: string | null;
}

export interface FfmpegInfo {
  found: boolean;
  path: string | null;
  version: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert frontend LyricChar[] to ExportChar[] */
function toExportChars(line: LyricLine): ExportChar[] {
  return line.characters.map((c) => ({
    text: c.text,
    start_time: c.startTime,
    end_time: c.endTime,
  }));
}

/** Convert frontend LyricLine[] to ExportLine[] */
export function toExportLines(lines: LyricLine[]): ExportLine[] {
  return lines.map((l) => ({
    text: l.text,
    start_time: l.startTime,
    end_time: l.endTime,
    characters: toExportChars(l),
    pronunciation: null,
  }));
}

/** Build default export options */
export function buildExportOptions(overrides?: Partial<ExportOptions>): ExportOptions {
  return {
    format: "lrc",
    encoding: "utf-8",
    bom: false,
    enhanced_word_tags: false,
    compact_json: false,
    title: null,
    artist: null,
    album: null,
    author: null,
    offset: 0.0,
    video_input: null,
    video_output: null,
    video_preset: "medium",
    video_bitrate: null,
    ass_font_name: "Arial",
    ass_font_size: 48,
    ass_resolution: { width: 1920, height: 1080 },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tauri invoke (lazy import to avoid bundling issues outside Tauri)
// ---------------------------------------------------------------------------

import type { invoke as InvokeFn } from "@tauri-apps/api/core";
import type { UnlistenFn } from "@tauri-apps/api/event";

let _invoke: typeof InvokeFn | null = null;

async function getInvoke(): Promise<typeof InvokeFn> {
  if (!_invoke) {
    _invoke = (await import("@tauri-apps/api/core")).invoke;
  }
  return _invoke;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Export lyrics to LRC format.
 *
 * @param outputPath - Absolute file path for the .lrc file
 * @param lines      - Lyrics lines with timing
 * @param options    - Export options (encoding, metadata, enhanced word tags)
 * @returns Promise resolving to the output path
 */
export async function exportLrc(
  outputPath: string,
  lines: LyricLine[],
  options: ExportOptions,
): Promise<void> {
  const invoke = await getInvoke();
  const exportLines = toExportLines(lines);

  await invoke("export_lrc", {
    path: outputPath,
    linesJson: JSON.stringify(exportLines),
    optionsJson: JSON.stringify(options),
  });
}

/**
 * Export lyrics to JSON format.
 *
 * @param outputPath - Absolute file path for the .json file
 * @param lines      - Lyrics lines with timing
 * @param options    - Export options (compact vs full, metadata)
 * @returns Promise resolving to the output path
 */
export async function exportJson(
  outputPath: string,
  lines: LyricLine[],
  options: ExportOptions,
): Promise<void> {
  const invoke = await getInvoke();
  const exportLines = toExportLines(lines);

  await invoke("export_json", {
    path: outputPath,
    linesJson: JSON.stringify(exportLines),
    optionsJson: JSON.stringify(options),
  });
}

/**
 * Export lyrics to ASS subtitle format with karaoke tags.
 *
 * @param outputPath - Absolute file path for the .ass file
 * @param lines      - Lyrics lines with timing
 * @param options    - Export options (ASS font, resolution)
 * @returns Promise resolving to the output path
 */
export async function exportAss(
  outputPath: string,
  lines: LyricLine[],
  options: ExportOptions,
): Promise<void> {
  const invoke = await getInvoke();
  const exportLines = toExportLines(lines);

  await invoke("export_ass", {
    path: outputPath,
    linesJson: JSON.stringify(exportLines),
    optionsJson: JSON.stringify(options),
  });
}

/**
 * Export video with lyrics overlay using FFmpeg.
 *
 * Listens for "export-progress" events to report encoding progress.
 *
 * @param config     - Video export configuration
 * @param onProgress - Optional callback for progress updates (0.0 - 1.0)
 * @returns Promise resolving to the output path
 */
export async function exportVideo(
  config: {
    inputPath: string;
    outputPath: string;
    lines: LyricLine[];
    options: ExportOptions;
  },
  onProgress?: (progress: ExportProgress) => void,
): Promise<void> {
  const invoke = await getInvoke();
  const exportLines = toExportLines(config.lines);

  let unlisten: UnlistenFn | null = null;

  try {
    // Subscribe to progress events if callback provided
    if (onProgress) {
      const { listen } = await import("@tauri-apps/api/event");
      unlisten = await listen<ExportProgress>("export-progress", (event) => {
        onProgress(event.payload);
      });
    }

    const videoConfig: VideoExportConfig = {
      input_path: config.inputPath,
      output_path: config.outputPath,
      lines_json: JSON.stringify(exportLines),
      options_json: JSON.stringify(config.options),
    };

    await invoke("export_video", {
      configJson: JSON.stringify(videoConfig),
    });
  } finally {
    if (unlisten) {
      unlisten();
    }
  }
}

/**
 * Detect if FFmpeg is available on the system.
 */
export async function detectFfmpeg(): Promise<FfmpegInfo> {
  const invoke = await getInvoke();
  return invoke("system_detect_ffmpeg");
}

/**
 * Get the application data directory path.
 */
export async function getAppDataDir(): Promise<string> {
  const invoke = await getInvoke();
  return invoke("system_get_app_data_dir");
}
