import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../../store";
import { TextParser } from "../../services/textParser";
import { CharSplitter } from "../../services/charSplitter";
import type { LyricLine, LyricChar } from "../../types/lyrics";

const parser = new TextParser();
const splitter = new CharSplitter();

function buildLinesFromData(
  linesData: { text: string; startTime?: number; endTime?: number }[]
): LyricLine[] {
  return linesData.map((data, index) => {
    const lineId = crypto.randomUUID();
    const tokens = splitter.split(data.text, "zh-CN");
    const characters: LyricChar[] = tokens.map((token, cIdx) => ({
      id: `${lineId}_c${cIdx}`,
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
      isSkipped: !data.text.trim(),
    };
  });
}

export function LyricTextEditor() {
  const { t } = useTranslation();
  const lines = useStore((s) => s.lines);
  const selectedLineIndex = useStore((s) => s.selectedLineIndex);
  const setLines = useStore((s) => s.setLines);
  const setSelectedLineIndex = useStore((s) => s.setSelectedLineIndex);

  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = lines.reduce((n, l) => n + l.characters.length, 0);

  const handlePasteClick = useCallback(() => {
    setPasteText("");
    setShowPasteDialog(true);
  }, []);

  const handleConfirmPaste = useCallback(() => {
    if (!pasteText.trim()) return;
    const parsed = parser.parse(pasteText);
    const lyricLines = buildLinesFromData(parsed.lines);
    setLines(lyricLines);
    setShowPasteDialog(false);
    setPasteText("");
  }, [pasteText, setLines]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        if (!content) return;
        const parsed = parser.parse(content);
        const lyricLines = buildLinesFromData(parsed.lines);
        setLines(lyricLines);
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [setLines]
  );

  const handleLineClick = useCallback(
    (index: number) => {
      setSelectedLineIndex(index);
    },
    [setSelectedLineIndex]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-surface-3">
        <button
          onClick={handlePasteClick}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-surface-2 hover:bg-surface-3 rounded transition-colors"
          title={t("lyrics.pasteTooltip")}
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.5 3.5H3.5C2.39543 3.5 1.5 4.39543 1.5 5.5V11.5C1.5 12.6046 2.39543 13.5 3.5 13.5H9.5C10.6046 13.5 11.5 12.6046 11.5 11.5V10.5M7.5 1.5H11.5C12.6046 1.5 13.5 2.39543 13.5 3.5V7.5M7.5 1.5L5.5 3.5M7.5 1.5L9.5 3.5M3.5 5.5H9.5C10.6046 5.5 11.5 6.39543 11.5 7.5V9.5M3.5 9.5H6.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("lyrics.paste")}
        </button>
        <button
          onClick={handleImportClick}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-surface-2 hover:bg-surface-3 rounded transition-colors"
          title={t("lyrics.importTooltip")}
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.5 1.5V9.5M7.5 9.5L4.5 6.5M7.5 9.5L10.5 6.5M2.5 10.5V11.5C2.5 12.6046 3.39543 13.5 4.5 13.5H10.5C11.6046 13.5 12.5 12.6046 12.5 11.5V10.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("lyrics.importFile")}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".lrc,.txt,.srt,.ass"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex-1" />
        <span className="text-[10px] text-gray-500 whitespace-nowrap">
          {t("lyrics.lineCount", { count: lines.length })} ·{" "}
          {t("lyrics.charCount", { count: charCount })}
        </span>
      </div>

      {/* Lyrics list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {lines.length === 0 ? (
          <div className="text-xs text-gray-500 text-center py-8">
            {t("lyrics.empty")}
          </div>
        ) : (
          lines.map((line, i) => (
            <div
              key={line.id}
              onClick={() => handleLineClick(i)}
              className={`px-2 py-1 text-xs rounded cursor-pointer transition-colors ${
                i === selectedLineIndex
                  ? "bg-accent/20 text-white"
                  : "text-gray-400 hover:bg-surface-2"
              }`}
            >
              <span className="text-gray-600 mr-2 select-none">{i + 1}</span>
              {line.isSkipped ? (
                <span className="italic text-gray-600">
                  — {t("lyrics.interlude")} —
                </span>
              ) : (
                line.characters.map((c) => c.text).join("")
              )}
            </div>
          ))
        )}
      </div>

      {/* Paste dialog modal */}
      {showPasteDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setShowPasteDialog(false)}
        >
          <div
            className="w-[480px] max-h-[70vh] bg-surface-1 border border-surface-3 rounded-xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-3">
              <h3 className="text-sm font-semibold text-white">
                {t("lyrics.pasteDialogTitle")}
              </h3>
              <button
                onClick={() => setShowPasteDialog(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.5 3.5L3.5 11.5M3.5 3.5L11.5 11.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-4 min-h-0">
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={t("lyrics.pasteDialogPlaceholder")}
                className="w-full h-[300px] bg-surface-0 border border-surface-3 rounded-lg p-3 text-sm text-gray-200 resize-none focus:outline-none focus:border-accent font-mono"
                autoFocus
                spellCheck={false}
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-surface-3">
              <button
                onClick={() => setPasteText("")}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-surface-2 hover:bg-surface-3 rounded transition-colors"
              >
                {t("lyrics.clear")}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPasteDialog(false)}
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-surface-2 hover:bg-surface-3 rounded transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleConfirmPaste}
                  disabled={!pasteText.trim()}
                  className="px-3 py-1.5 text-xs text-white bg-accent hover:bg-accent-hover rounded transition-colors disabled:opacity-50"
                >
                  {t("lyrics.importConfirm")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
