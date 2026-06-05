import { useState, useCallback, useRef, useEffect, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../../store";
import { TextParser } from "../../services/textParser";
import { CharSplitter, type SplitToken } from "../../services/charSplitter";
import type { LyricLine, LyricChar } from "../../types/lyrics";

const parser = new TextParser();
const splitter = new CharSplitter();
let _charIdCounter = 0;
function genCharId(lineId: string): string {
  return `${lineId}_c${_charIdCounter++}`;
}

interface LinePreview {
  text: string;
  tokens: SplitToken[];
  startTime?: number;
  endTime?: number;
}

function buildLinesFromData(
  linesData: { text: string; startTime?: number; endTime?: number }[]
): LyricLine[] {
  _charIdCounter = 0;

  return linesData.map((data, index) => {
    const lineId = `line_${Date.now()}_${index}`;
    const tokens = splitter.split(data.text);
    const characters: LyricChar[] = tokens.map((token, cIdx) => ({
      id: genCharId(lineId),
      lineId,
      index: cIdx,
      text: token.text,
      startTime: 0,
      endTime: 0,
      isPunctuation: token.isPunctuation,
      isSpace: token.isSpace,
    }));

    return {
      id: lineId,
      index,
      text: data.text,
      characters,
      startTime: data.startTime ?? 0,
      endTime: data.endTime ?? 0,
      isSkipped: false,
    };
  });
}

export function LyricTextEditor() {
  const { t } = useTranslation();
  const setLines = useStore((s) => s.setLines);
  const lines = useStore((s) => s.lines);

  const [rawInput, setRawInput] = useState("");
  const [parsedFormat, setParsedFormat] = useState<string | null>(null);
  const [previews, setPreviews] = useState<LinePreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse input whenever it changes
  const parseInput = useCallback((input: string) => {
    setRawInput(input);
    if (input.trim().length === 0) {
      setPreviews([]);
      setParsedFormat(null);
      return;
    }

    const format = parser.detectFormat(input);
    setParsedFormat(format);

    if (format === "plain") {
      const plainLines = parser.parsePlain(input);
      const pre: LinePreview[] = plainLines.map((l) => {
        const tokens = l.text ? splitter.split(l.text) : [];
        return { text: l.text, tokens };
      });
      setPreviews(pre);
    } else {
      const result = parser.parse(input);
      const pre: LinePreview[] = result.lines.map((l) => {
        const tokens = l.text ? splitter.split(l.text) : [];
        return {
          text: l.text,
          tokens,
          startTime: l.startTime,
          endTime: l.endTime,
        };
      });
      setPreviews(pre);
    }
  }, []);

  const handleImport = useCallback(() => {
    if (rawInput.trim().length === 0) return;

    const format = parser.detectFormat(rawInput);
    let linesData: { text: string; startTime?: number; endTime?: number }[];

    if (format === "plain") {
      linesData = parser.parsePlain(rawInput);
    } else {
      const result = parser.parse(rawInput);
      linesData = result.lines;
    }

    const lyricLines = buildLinesFromData(linesData);
    setLines(lyricLines);
  }, [rawInput, setLines]);

  // Handle file upload via FileReader
  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          parseInput(content);
        }
      };
      reader.readAsText(file);
    },
    [parseInput]
  );

  // Drag-and-drop events (standard HTML5 — works in dev mode)
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext && ["lrc", "srt", "ass", "txt"].includes(ext)) {
          handleFile(file);
        }
      }
    },
    [handleFile]
  );

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset so same file can be re-selected
      e.target.value = "";
    },
    [handleFile]
  );

  // Keyboard shortcut: Ctrl+Enter to import
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        handleImport();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleImport]);

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-1">
        <button
          type="button"
          onClick={handleImport}
          disabled={rawInput.trim().length === 0}
          className="px-3 py-1 text-xs font-medium bg-accent text-white rounded
                     hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors"
        >
          {t("common.save")}
        </button>
        <button
          type="button"
          onClick={handleFileSelect}
          className="px-3 py-1 text-xs font-medium bg-surface-2 text-gray-300 rounded
                     hover:bg-surface-3 transition-colors"
        >
          {t("lyrics.importFile")}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".lrc,.srt,.ass,.txt"
          className="hidden"
          onChange={handleFileInputChange}
        />
        {parsedFormat && (
          <span className="ml-auto text-[10px] uppercase tracking-wider text-gray-500">
            {parsedFormat}
          </span>
        )}
      </div>

      {/* Editor area */}
      <div
        className="relative flex-1 flex gap-2 min-h-0"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={rawInput}
          onChange={(e) => parseInput(e.target.value)}
          placeholder={`${t("lyrics.pasteHere")}\n\nCtrl+Enter → ${t("common.save")}`}
          className="flex-1 resize-none bg-surface-1 border border-surface-3 rounded
                     p-3 text-sm text-gray-200 font-mono
                     placeholder:text-gray-600
                     focus:outline-none focus:border-accent/50
                     scrollbar-thin"
          spellCheck={false}
        />

        {/* Preview panel */}
        <div className="w-64 flex-shrink-0 bg-surface-1 border border-surface-3 rounded overflow-y-auto">
          <div className="sticky top-0 bg-surface-2 px-3 py-1.5 border-b border-surface-3 text-[10px] uppercase tracking-wider text-gray-500 font-medium">
            {t("lyrics.editor")} ({t("lyrics.lineCount", { count: previews.length })})
          </div>
          {previews.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-600 text-xs">
              {t("media.noMedia")}
            </div>
          )}
          {previews.map((pre, i) => (
            <div
              key={i}
              className="px-3 py-2 border-b border-surface-3 last:border-b-0"
            >
              <div className="text-[10px] text-gray-600 mb-0.5 font-mono">
                {i + 1}
                {pre.startTime !== undefined && pre.startTime > 0 && (
                  <span className="ml-2 text-gray-600">
                    {formatTime(pre.startTime)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-0.5">
                {pre.tokens.length > 0 ? (
                  pre.tokens.map((t, tIdx) => (
                    <span
                      key={tIdx}
                      className={`inline-block px-0.5 rounded text-xs ${
                        t.isSpace
                          ? "text-gray-700"
                          : t.isPunctuation
                            ? "text-orange-400"
                            : "text-gray-300"
                      }`}
                    >
                      {t.isSpace ? "·" : t.text}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-700 text-xs">(empty)</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Drag-over overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-accent/10 border-2 border-dashed border-accent/40 rounded flex items-center justify-center z-10 pointer-events-none">
            <span className="text-accent text-sm font-medium">
              {t("media.dropHere")}
            </span>
          </div>
        )}
      </div>

      {/* Store status */}
      {lines.length > 0 && (
        <div className="text-[10px] text-gray-600 px-1">
          {t("lyrics.lineCount", { count: lines.length })} loaded
        </div>
      )}
    </div>
  );
}

function formatTime(ms: number): string {
  const totalSec = ms / 1000;
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  const centis = Math.floor((ms % 1000) / 10);
  return `${m}:${s.toString().padStart(2, "0")}.${centis.toString().padStart(2, "0")}`;
}
