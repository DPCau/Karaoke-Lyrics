import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../../store";

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

function formatTime(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "0:00.00";
  const totalSec = ms / 1000;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toFixed(2).padStart(5, "0")}`;
}

export function PlaybackControls() {
  const { t } = useTranslation();
  const isPlaying = useStore((s) => s.isPlaying);
  const currentTime = useStore((s) => s.currentTime);
  const duration = useStore((s) => s.duration);
  const playbackSpeed = useStore((s) => s.playbackSpeed);
  const setPlaying = useStore((s) => s.setPlaying);
  const setCurrentTime = useStore((s) => s.setCurrentTime);
  const setPlaybackSpeed = useStore((s) => s.setPlaybackSpeed);

  const hasMedia = (useStore.getState().videoPath ?? useStore.getState().audioPath) !== null;

  const togglePlay = useCallback(() => {
    setPlaying(!isPlaying);
  }, [isPlaying, setPlaying]);

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentTime(Number(e.target.value));
    },
    [setCurrentTime],
  );

  const handleSpeedChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setPlaybackSpeed(Number(e.target.value));
    },
    [setPlaybackSpeed],
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-surface-1 border-t border-surface-3 select-none">
      {/* Play/Pause button */}
      <button
        type="button"
        onClick={togglePlay}
        disabled={!hasMedia}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded
                   bg-surface-2 text-gray-300 hover:bg-surface-3 transition-colors
                   disabled:opacity-40 disabled:cursor-not-allowed"
        title={isPlaying ? t("status.paused") : t("status.playing")}
      >
        {isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Current time */}
      <span className="flex-shrink-0 text-[11px] font-mono text-gray-400 tabular-nums w-[60px] text-right">
        {formatTime(currentTime)}
      </span>

      {/* Seek bar */}
      <div className="flex-1 flex items-center">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          disabled={!hasMedia}
          className="w-full h-1 appearance-none bg-surface-3 rounded-full outline-none
                     cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-3
                     [&::-webkit-slider-thumb]:h-3
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-accent
                     [&::-webkit-slider-thumb]:shadow-md
                     [&::-webkit-slider-thumb]:transition-transform
                     [&::-webkit-slider-thumb]:hover:scale-125"
          style={{
            background: hasMedia
              ? `linear-gradient(to right, #3b82f6 ${progress}%, #282828 ${progress}%)`
              : undefined,
          }}
        />
      </div>

      {/* Duration */}
      <span className="flex-shrink-0 text-[11px] font-mono text-gray-500 tabular-nums w-[60px]">
        {formatTime(duration)}
      </span>

      {/* Speed selector */}
      <div className="flex items-center gap-1.5">
        <label className="text-[10px] text-gray-500 uppercase tracking-wider">{t("timing_panel.speed")}</label>
        <select
          value={playbackSpeed}
          onChange={handleSpeedChange}
          disabled={!hasMedia}
          className="appearance-none bg-surface-2 border border-surface-3 rounded
                     px-2 py-1 text-xs text-gray-300 font-mono
                     focus:outline-none focus:border-accent/50
                     disabled:opacity-40 disabled:cursor-not-allowed
                     cursor-pointer"
        >
          {SPEED_OPTIONS.map((speed) => (
            <option key={speed} value={speed}>
              {speed}x
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
