import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../../store";

export function ExportSettings() {
  const { t } = useTranslation();
  const settings = useStore((s) => s.settings);
  const updateSetting = useStore((s) => s.updateSetting);

  const handleDefaultFormatChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateSetting("export", {
        defaultFormat: e.target.value as "mp4_h264" | "lrc" | "json" | "ass",
      });
    },
    [updateSetting],
  );

  const handleFfmpegPathChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateSetting("export", { ffmpegPath: e.target.value });
    },
    [updateSetting],
  );

  const handleEncoderPresetChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateSetting("export", { encoderPreset: e.target.value });
    },
    [updateSetting],
  );

  const handleOpenFolderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateSetting("export", { openFolderAfterExport: e.target.checked });
    },
    [updateSetting],
  );

  return (
    <div className="space-y-5">
      {/* Default Format */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">
          {t("settings.defaultFormat")}
        </label>
        <select
          value={settings.export.defaultFormat}
          onChange={handleDefaultFormatChange}
          className="w-full px-3 py-2 text-xs bg-surface-2 border border-surface-3 rounded-lg text-gray-200 focus:outline-none focus:border-accent transition-colors"
        >
          <option value="lrc">{t("export.formatLrc")}</option>
          <option value="json">{t("export.formatJson")}</option>
          <option value="ass">{t("export.formatAss")}</option>
          <option value="mp4_h264">{t("export.defaultFormatMp4")}</option>
        </select>
      </div>

      {/* FFmpeg Path */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">
          {t("settings.ffmpegPath")}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={settings.export.ffmpegPath}
            onChange={handleFfmpegPathChange}
            placeholder="/usr/local/bin/ffmpeg"
            className="flex-1 px-3 py-2 text-xs bg-surface-2 border border-surface-3 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
          />
          <button
            type="button"
            className="px-3 py-2 text-xs font-medium bg-surface-2 text-gray-300 rounded-lg hover:bg-surface-3 transition-colors"
          >
            {t("export.browse")}
          </button>
        </div>
      </div>

      {/* Auto-detect */}
      <div>
        <button
          type="button"
          className="px-3 py-2 text-xs font-medium bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
        >
          {t("settings.autoDetect")}
        </button>
      </div>

      {/* Encoder Preset */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">
          {t("settings.encoderPreset")}
        </label>
        <select
          value={settings.export.encoderPreset}
          onChange={handleEncoderPresetChange}
          className="w-full px-3 py-2 text-xs bg-surface-2 border border-surface-3 rounded-lg text-gray-200 focus:outline-none focus:border-accent transition-colors"
        >
          <option value="ultrafast">{t("export.ultrafast")}</option>
          <option value="superfast">{t("export.superfast")}</option>
          <option value="veryfast">{t("export.veryfast")}</option>
          <option value="faster">{t("export.faster")}</option>
          <option value="fast">{t("export.fast")}</option>
          <option value="medium">{t("export.medium")}</option>
          <option value="slow">{t("export.slow")}</option>
          <option value="slower">{t("export.slower")}</option>
          <option value="veryslow">{t("export.veryslow")}</option>
        </select>
      </div>

      {/* Open folder after export */}
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-xs text-gray-300">
          {t("settings.openFolderAfterExport")}
        </span>
        <input
          type="checkbox"
          checked={settings.export.openFolderAfterExport}
          onChange={handleOpenFolderChange}
          className="rounded border-surface-3 bg-surface-3 text-accent focus:ring-accent"
        />
      </label>
    </div>
  );
}
