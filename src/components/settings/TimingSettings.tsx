import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../../store";

export function TimingSettings() {
  const { t } = useTranslation();
  const settings = useStore((s) => s.settings);
  const updateSetting = useStore((s) => s.updateSetting);
  const [isCapturingKey, setIsCapturingKey] = useState(false);
  const keyInputRef = useRef<HTMLInputElement>(null);

  const handleLeadInChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= -500 && val <= 0) {
        updateSetting("timing", { leadInMs: val });
      }
    },
    [updateSetting],
  );

  const handleSnapModeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateSetting("timing", {
        snapMode: e.target.value as "none" | "waveform_peak" | "beat",
      });
    },
    [updateSetting],
  );

  const handleSnapStrengthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 10 && val <= 500) {
        updateSetting("timing", { snapStrengthMs: val });
      }
    },
    [updateSetting],
  );

  const handleKeyDownCapture = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const key = e.key;
      if (key === "Escape") {
        setIsCapturingKey(false);
        return;
      }
      updateSetting("timing", { markKey: key });
      setIsCapturingKey(false);
    },
    [updateSetting],
  );

  return (
    <div className="space-y-5">
      {/* Mark Key */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">
          {t("settings.markKey")}
        </label>
        <div className="relative">
          <input
            ref={keyInputRef}
            type="text"
            readOnly
            value={isCapturingKey ? "" : settings.timing.markKey}
            onFocus={() => setIsCapturingKey(true)}
            onKeyDown={handleKeyDownCapture}
            onBlur={() => setIsCapturingKey(false)}
            placeholder={isCapturingKey ? t("common.loading") : ""}
            className={`w-full px-3 py-2 text-xs bg-surface-2 border rounded-lg text-gray-200 focus:outline-none transition-colors ${
              isCapturingKey
                ? "border-accent"
                : "border-surface-3 focus:border-accent"
            }`}
          />
          {isCapturingKey && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-accent">
              {t("common.loading")}
            </span>
          )}
        </div>
      </div>

      {/* Lead-in */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">
          {t("settings.leadInMs")}: {settings.timing.leadInMs}ms
        </label>
        <input
          type="range"
          min={-200}
          max={0}
          step={10}
          value={settings.timing.leadInMs}
          onChange={handleLeadInChange}
          className="w-full h-1 appearance-none bg-surface-3 rounded-full outline-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-3
                     [&::-webkit-slider-thumb]:h-3
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-accent"
        />
      </div>

      {/* Snap Mode */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">
          {t("settings.snapMode")}
        </label>
        <select
          value={settings.timing.snapMode}
          onChange={handleSnapModeChange}
          className="w-full px-3 py-2 text-xs bg-surface-2 border border-surface-3 rounded-lg text-gray-200 focus:outline-none focus:border-accent transition-colors"
        >
          <option value="none">{t("timing_panel.snapNone")}</option>
          <option value="waveform_peak">{t("timing_panel.snapPeak")}</option>
          <option value="beat">{t("timing_panel.snapBeat")}</option>
        </select>
      </div>

      {/* Snap Strength */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">
          {t("settings.snapStrength")}: {settings.timing.snapStrengthMs}ms
        </label>
        <input
          type="range"
          min={10}
          max={500}
          step={10}
          value={settings.timing.snapStrengthMs}
          onChange={handleSnapStrengthChange}
          className="w-full h-1 appearance-none bg-surface-3 rounded-full outline-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-3
                     [&::-webkit-slider-thumb]:h-3
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-accent"
        />
      </div>
    </div>
  );
}
