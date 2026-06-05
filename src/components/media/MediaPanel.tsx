import { useCallback, useRef, useState, type DragEvent } from "react";
import { useStore } from "../../store";

function formatDuration(ms: number): string {
  if (ms <= 0 || !Number.isFinite(ms)) return "--:--.--";
  const totalSec = ms / 1000;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toFixed(2).padStart(5, "0")}`;
}

function getFileLabel(path: string | null): string {
  if (!path) return "None";
  try {
    const url = new URL(path);
    const segments = url.pathname.split("/");
    return segments[segments.length - 1] || path;
  } catch {
    // Not a URL — treat as file path
    const segments = path.split("/");
    return segments[segments.length - 1] || path;
  }
}

export function MediaPanel() {
  const videoPath = useStore((s) => s.videoPath);
  const audioPath = useStore((s) => s.audioPath);
  const duration = useStore((s) => s.duration);
  const setVideoPath = useStore((s) => s.setVideoPath);
  const setAudioPath = useStore((s) => s.setAudioPath);
  const setDuration = useStore((s) => s.setDuration);

  const [isDragOver, setIsDragOver] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleFileLoad = useCallback(
    (file: File, mediaType: "video" | "audio") => {
      const url = URL.createObjectURL(file);

      if (mediaType === "video") {
        // Revoke previous URL if one existed
        if (videoPath && videoPath.startsWith("blob:")) {
          URL.revokeObjectURL(videoPath);
        }
        setVideoPath(url);
      } else {
        if (audioPath && audioPath.startsWith("blob:")) {
          URL.revokeObjectURL(audioPath);
        }
        setAudioPath(url);
      }

      // Probe for duration using a temporary element
      const probe = new Audio(url);
      probe.addEventListener("loadedmetadata", () => {
        setDuration(probe.duration * 1000);
      });
      // Fallback: some files may not fire loadedmetadata
      probe.addEventListener("canplay", () => {
        if (probe.duration && Number.isFinite(probe.duration)) {
          setDuration(probe.duration * 1000);
        }
      }, { once: true });
    },
    [videoPath, audioPath, setVideoPath, setAudioPath, setDuration],
  );

  const handleFileSelect = useCallback(
    (mediaType: "video" | "audio") => {
      const input = mediaType === "video" ? videoInputRef : audioInputRef;
      input.current?.click();
    },
    [],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, mediaType: "video" | "audio") => {
      const file = e.target.files?.[0];
      if (file) handleFileLoad(file, mediaType);
      e.target.value = "";
    },
    [handleFileLoad],
  );

  /* ---- Drag-and-drop ---- */
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
      if (!files || files.length === 0) return;

      for (const file of files) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext ?? "")) {
          handleFileLoad(file, "video");
          break;
        }
        if (["mp3", "wav", "flac", "ogg", "m4a", "aac"].includes(ext ?? "")) {
          handleFileLoad(file, "audio");
          break;
        }
      }
    },
    [handleFileLoad],
  );

  const hasMedia = videoPath !== null || audioPath !== null;

  return (
    <div className="flex flex-col h-full gap-3" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {/* Media info display */}
      {hasMedia ? (
        <div className="space-y-2">
          <div className="bg-surface-1 border border-surface-3 rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Video</span>
              <span className="text-xs text-gray-400 truncate max-w-[180px]" title={videoPath ?? ""}>
                {getFileLabel(videoPath)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Audio</span>
              <span className="text-xs text-gray-400 truncate max-w-[180px]" title={audioPath ?? ""}>
                {getFileLabel(audioPath)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Duration</span>
              <span className="text-xs text-gray-300 font-mono">{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Replace buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleFileSelect("video")}
              className="flex-1 px-3 py-1.5 text-xs font-medium bg-surface-2 text-gray-300 rounded hover:bg-surface-3 transition-colors"
            >
              Replace Video
            </button>
            <button
              type="button"
              onClick={() => handleFileSelect("audio")}
              className="flex-1 px-3 py-1.5 text-xs font-medium bg-surface-2 text-gray-300 rounded hover:bg-surface-3 transition-colors"
            >
              Replace Audio
            </button>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-500">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-surface-3 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-center max-w-[200px]">
            Drag & drop a media file or use the buttons below
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleFileSelect("video")}
              className="px-4 py-2 text-xs font-medium bg-accent text-white rounded hover:bg-accent-hover transition-colors"
            >
              Open Video
            </button>
            <button
              type="button"
              onClick={() => handleFileSelect("audio")}
              className="px-4 py-2 text-xs font-medium bg-surface-2 text-gray-300 rounded hover:bg-surface-3 transition-colors"
            >
              Open Audio
            </button>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/x-matroska,video/quicktime,audio/mp3,audio/wav,audio/flac,audio/ogg,audio/m4a"
        className="hidden"
        onChange={(e) => handleInputChange(e, "video")}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/mp3,audio/wav,audio/flac,audio/ogg,audio/m4a,audio/aac"
        className="hidden"
        onChange={(e) => handleInputChange(e, "audio")}
      />

      {/* Drag-over overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-accent/10 border-2 border-dashed border-accent/40 rounded flex items-center justify-center z-10 pointer-events-none">
          <span className="text-accent text-sm font-medium">
            Drop media file
          </span>
        </div>
      )}
    </div>
  );
}
