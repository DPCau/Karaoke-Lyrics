import { useState, useCallback, useEffect } from "react";
import type { LyricLine } from "../../types/lyrics";
import {
  exportLrc,
  exportJson,
  exportAss,
  exportVideo,
  detectFfmpeg,
  buildExportOptions,
  type ExportProgress,
  type FfmpegInfo,
} from "../../services/exportService";
import type { ExportFormat } from "../../types/export";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  lines: LyricLine[];
}

// ---------------------------------------------------------------------------
// Encoding options
// ---------------------------------------------------------------------------

const ENCODINGS = [
  { value: "utf-8", label: "UTF-8" },
  { value: "utf-16", label: "UTF-16" },
  { value: "gbk", label: "GBK" },
];

const VIDEO_PRESETS = [
  { value: "ultrafast", label: "Ultra Fast" },
  { value: "superfast", label: "Super Fast" },
  { value: "veryfast", label: "Very Fast" },
  { value: "faster", label: "Faster" },
  { value: "fast", label: "Fast" },
  { value: "medium", label: "Medium" },
  { value: "slow", label: "Slow" },
  { value: "slower", label: "Slower" },
  { value: "veryslow", label: "Very Slow" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExportDialog({ open, onClose, lines }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("lrc");
  const [encoding, setEncoding] = useState("utf-8");
  const [bom, setBom] = useState(false);
  const [enhancedWordTags, setEnhancedWordTags] = useState(true);
  const [compactJson, setCompactJson] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [author, setAuthor] = useState("");
  const [includePronunciation, setIncludePronunciation] = useState(true);
  const [videoPreset, setVideoPreset] = useState("medium");

  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ffmpegInfo, setFfmpegInfo] = useState<FfmpegInfo | null>(null);

  // Check FFmpeg availability on mount
  useEffect(() => {
    detectFfmpeg().then(setFfmpegInfo).catch(() => {});
  }, []);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setExporting(false);
      setProgress(null);
      setError(null);
    }
  }, [open]);

  const handleFormatChange = useCallback((newFormat: ExportFormat) => {
    setFormat(newFormat);
    setError(null);
  }, []);

  // Build output file path using Tauri save dialog
  const pickOutputPath = useCallback(
    async (ext: string): Promise<string | null> => {
      try {
        const { save } = await import("@tauri-apps/plugin-dialog");
        const filePath = await save({
          filters: [
            {
              name: `${ext.toUpperCase()} files`,
              extensions: [ext],
            },
          ],
        });
        return filePath || null;
      } catch {
        // Fallback if dialog not available
        return null;
      }
    },
    [],
  );

  // Main export handler
  const handleExport = useCallback(async () => {
    setError(null);
    setExporting(true);
    setProgress(null);

    try {
      // Determine extension
      const extMap: Record<ExportFormat, string> = {
        lrc: "lrc",
        json: "json",
        ass: "ass",
        srt: "srt",
        xml: "xml",
      };
      const ext = extMap[format] || format;

      // Pick output path
      const outputPath = await pickOutputPath(ext);
      if (!outputPath) {
        setExporting(false);
        return;
      }

      // Build options
      const options = buildExportOptions({
        format,
        encoding,
        bom,
        enhanced_word_tags: format === "lrc" && enhancedWordTags,
        compact_json: format === "json" && compactJson,
        title: title || null,
        artist: artist || null,
        album: album || null,
        author: author || null,
        video_preset: videoPreset,
      });

      // Execute export
      switch (format) {
        case "lrc":
          await exportLrc(outputPath, lines, options);
          break;
        case "json":
          await exportJson(outputPath, lines, options);
          break;
        case "ass":
          await exportAss(outputPath, lines, options);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setExporting(false);
      setProgress(null);
    }
  }, [
    format,
    encoding,
    bom,
    enhancedWordTags,
    compactJson,
    title,
    artist,
    album,
    author,
    videoPreset,
    lines,
    onClose,
    pickOutputPath,
  ]);

  const handleExportVideo = useCallback(async () => {
    setError(null);
    setExporting(true);
    setProgress(null);

    try {
      // Ask for input video
      const { open: fileOpen } = await import("@tauri-apps/plugin-dialog");
      const inputPath = await fileOpen({
        filters: [
          {
            name: "Video files",
            extensions: ["mp4", "mkv", "avi", "mov", "webm"],
          },
        ],
      });

      if (!inputPath) {
        setExporting(false);
        return;
      }

      const outputPath = await pickOutputPath("mp4");
      if (!outputPath) {
        setExporting(false);
        return;
      }

      const options = buildExportOptions({
        format: "ass",
        encoding,
        bom,
        enhanced_word_tags: false,
        compact_json: false,
        title: title || null,
        artist: artist || null,
        album: album || null,
        author: author || null,
        video_preset: videoPreset,
      });

      await exportVideo(
        {
          inputPath,
          outputPath,
          lines,
          options,
        },
        (p) => setProgress(p),
      );

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setExporting(false);
      setProgress(null);
    }
  }, [lines, videoPreset, title, artist, album, author, encoding, bom, onClose, pickOutputPath]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[520px] max-h-[85vh] bg-surface-1 border border-surface-3 rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-3">
          <h2 className="text-sm font-semibold text-white">Export</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={exporting}
            className="text-gray-500 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Format selector */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Export Format</label>
            <div className="grid grid-cols-4 gap-2">
              {(["lrc", "json", "ass", "video"] as const).map((fmt) => {
                const isVideo = fmt === "video";
                const disabled = isVideo && ffmpegInfo && !ffmpegInfo.found;
                return (
                  <button
                    key={fmt}
                    type="button"
                    disabled={!!disabled}
                    onClick={() =>
                      isVideo
                        ? setFormat("ass")
                        : handleFormatChange(fmt)
                    }
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                      format === fmt || (format === "ass" && fmt === "video")
                        ? "bg-accent/20 border-accent text-accent"
                        : "bg-surface-2 border-surface-3 text-gray-400 hover:border-gray-500"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <div className="text-center">
                      {fmt === "lrc" && (
                        <svg className="w-4 h-4 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      {fmt === "json" && (
                        <svg className="w-4 h-4 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      )}
                      {fmt === "ass" && (
                        <svg className="w-4 h-4 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                      {fmt === "video" && (
                        <svg className="w-4 h-4 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    {fmt.toUpperCase()}
                  </button>
                );
              })}
            </div>
            {ffmpegInfo && !ffmpegInfo.found && (
              <p className="text-[10px] text-amber-500 mt-1">
                FFmpeg not found. Video export requires FFmpeg.
              </p>
            )}
          </div>

          {/* Video-specific config */}
          {(format === "ass" && false ? false : null) || null}

          {/* Metadata section */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Metadata
              <span className="text-gray-600 ml-1">(optional)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-surface-2 border border-surface-3 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
              />
              <input
                type="text"
                placeholder="Artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-surface-2 border border-surface-3 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
              />
              <input
                type="text"
                placeholder="Album"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-surface-2 border border-surface-3 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
              />
              <input
                type="text"
                placeholder="Author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-surface-2 border border-surface-3 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Format-specific options */}
          {format === "lrc" && (
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                LRC Options
              </label>
              <div className="space-y-2 bg-surface-2 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Encoding</span>
                  <select
                    value={encoding}
                    onChange={(e) => setEncoding(e.target.value)}
                    className="px-2 py-1 text-xs bg-surface-3 border border-surface-3 rounded text-gray-200 focus:outline-none focus:border-accent"
                  >
                    {ENCODINGS.map((enc) => (
                      <option key={enc.value} value={enc.value}>
                        {enc.label}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-gray-400">Enhanced word-level tags</span>
                  <input
                    type="checkbox"
                    checked={enhancedWordTags}
                    onChange={(e) => setEnhancedWordTags(e.target.checked)}
                    className="rounded border-surface-3 bg-surface-3 text-accent focus:ring-accent"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-gray-400">UTF-8 BOM</span>
                  <input
                    type="checkbox"
                    checked={bom}
                    onChange={(e) => setBom(e.target.checked)}
                    className="rounded border-surface-3 bg-surface-3 text-accent focus:ring-accent"
                  />
                </label>
              </div>
            </div>
          )}

          {format === "json" && (
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                JSON Options
              </label>
              <div className="space-y-2 bg-surface-2 rounded-lg p-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-gray-400">Compact format (word-level only)</span>
                  <input
                    type="checkbox"
                    checked={compactJson}
                    onChange={(e) => setCompactJson(e.target.checked)}
                    className="rounded border-surface-3 bg-surface-3 text-accent focus:ring-accent"
                  />
                </label>
              </div>
            </div>
          )}

          {format === "ass" && (
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                ASS Options
              </label>
              <div className="space-y-2 bg-surface-2 rounded-lg p-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-gray-400">Include pronunciation</span>
                  <input
                    type="checkbox"
                    checked={includePronunciation}
                    onChange={(e) => setIncludePronunciation(e.target.checked)}
                    className="rounded border-surface-3 bg-surface-3 text-accent focus:ring-accent"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Video preset (shown when video is conceptually active) */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Video Encoding Preset
            </label>
            <select
              value={videoPreset}
              onChange={(e) => setVideoPreset(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-surface-2 border border-surface-3 rounded-lg text-gray-200 focus:outline-none focus:border-accent"
            >
              {VIDEO_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Progress bar */}
          {progress && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">
                  {progress.stage === "encoding" ? "Encoding video..." : progress.stage}
                </span>
                <span className="text-xs text-gray-500">
                  {Math.round(progress.progress * 100)}%
                  {progress.speed && ` (${progress.speed})`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, progress.progress * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-surface-3">
          <button
            type="button"
            onClick={onClose}
            disabled={exporting}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-surface-2 hover:bg-surface-3 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={format === "ass" ? handleExportVideo : handleExport}
            disabled={exporting || (format === "ass" && ffmpegInfo !== null && !ffmpegInfo.found)}
            className="px-4 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {exporting && (
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {exporting ? "Exporting..." : format === "ass" ? "Export to Video" : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
