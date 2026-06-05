import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../../store";

export function PlaybackSettings() {
  const { t } = useTranslation();
  const settings = useStore((s) => s.settings);
  const updateSetting = useStore((s) => s.updateSetting);

  const handleDefaultSpeedChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateSetting("playback", { defaultSpeed: parseFloat(e.target.value) });
    },
    [updateSetting],
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val >= 0 && val <= 1) {
        updateSetting("playback", { defaultVolume: val });
      }
    },
    [updateSetting],
  );

  const handleLoopModeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateSetting("playback", {
        loopMode: e.target.value as "none" | "line" | "char" | "selection",
      });
    },
    [updateSetting],
  );

  return (
    <div className="space-y-5">
      {/* Default Speed */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">
          {t("settings.defaultSpeed")}
        </label>
        <select
          value={settings.playback.defaultSpeed}
          onChange={handleDefaultSpeedChange}
          className="w-full px-3 py-2 text-xs bg-surface-2 border border-surface-3 rounded-lg text-gray-200 focus:outline-none focus:border-accent transition-colors"
        >
          {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
            <option key={speed} value={speed}>
              {speed}x
            </option>
          ))}
        </select>
      </div>

      {/* Default Volume */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">
          {t("settings.defaultVolume")}: {Math.round(settings.playback.defaultVolume * 100)}%
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={settings.playback.defaultVolume}
          onChange={handleVolumeChange}
          className="w-full h-1 appearance-none bg-surface-3 rounded-full outline-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-3
                     [&::-webkit-slider-thumb]:h-3
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-accent"
        />
      </div>

      {/* Loop Mode */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">
          {t("settings.loopMode")}
        </label>
        <select
          value={settings.playback.loopMode}
          onChange={handleLoopModeChange}
          className="w-full px-3 py-2 text-xs bg-surface-2 border border-surface-3 rounded-lg text-gray-200 focus:outline-none focus:border-accent transition-colors"
        >
          <option value="none">{t("settings.loopModeNone")}</option>
          <option value="line">{t("settings.loopModeLine")}</option>
          <option value="char">{t("settings.loopModeChar")}</option>
          <option value="selection">{t("settings.loopModeSelection")}</option>
        </select>
      </div>
    </div>
  );
}
