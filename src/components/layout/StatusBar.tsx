import { useStore } from "../../store";

function formatTime(ms: number): string {
  if (ms <= 0) return "00:00.000";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const millis = ms % 1000;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

export function StatusBar() {
  const currentTime = useStore((s) => s.currentTime);
  const duration = useStore((s) => s.duration);
  const isPlaying = useStore((s) => s.isPlaying);
  const isRecording = useStore((s) => s.isRecording);
  const currentMarkIndex = useStore((s) => s.currentMarkIndex);
  const filePath = useStore((s) => s.filePath);
  const playbackSpeed = useStore((s) => s.playbackSpeed);

  return (
    <div className="flex items-center h-6 bg-surface-1 border-t border-surface-3 text-[11px] text-gray-400 px-3 gap-3 shrink-0 select-none">
      <span className="flex items-center gap-1 min-w-20">
        <span
          className={`w-2 h-2 rounded-full ${
            isPlaying ? "bg-green-500" : "bg-gray-600"
          }`}
        />
        {isPlaying ? "Playing" : "Paused"}
      </span>

      <span className="font-mono">{formatTime(currentTime)}</span>
      <span className="text-gray-600">/</span>
      <span className="font-mono">{formatTime(duration)}</span>

      {playbackSpeed !== 1 && (
        <span className="text-amber-400">{playbackSpeed}x</span>
      )}

      <div className="flex-1" />

      {isRecording && (
        <span className="text-red-400 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Recording #{currentMarkIndex}
        </span>
      )}

      {filePath && (
        <span className="truncate max-w-60 text-gray-500" title={filePath}>
          {filePath}
        </span>
      )}
    </div>
  );
}
