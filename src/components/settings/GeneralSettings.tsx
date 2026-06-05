import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../../store";

export function GeneralSettings() {
  const { t, i18n } = useTranslation();
  const settings = useStore((s) => s.settings);
  const updateSetting = useStore((s) => s.updateSetting);

  const handleLanguageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const lang = e.target.value as "zh-CN" | "zh-TW" | "ja-JP" | "en";
      updateSetting("general", { language: lang });
      i18n.changeLanguage(lang);
    },
    [updateSetting, i18n],
  );

  const handleThemeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateSetting("general", {
        theme: e.target.value as "dark" | "light" | "system",
      });
    },
    [updateSetting],
  );

  const handleAutoSaveIntervalChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 5 && val <= 300) {
        updateSetting("general", { autoSaveIntervalSec: val });
      }
    },
    [updateSetting],
  );

  const handleRestoreLastProjectChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateSetting("general", { restoreLastProject: e.target.checked });
    },
    [updateSetting],
  );

  return (
    <div className="space-y-5">
      {/* Language */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">
          {t("settings.language")}
        </label>
        <select
          value={settings.general.language}
          onChange={handleLanguageChange}
          className="w-full px-3 py-2 text-xs bg-surface-2 border border-surface-3 rounded-lg text-gray-200 focus:outline-none focus:border-accent transition-colors"
        >
          <option value="zh-CN">简体中文</option>
          <option value="zh-TW">繁體中文</option>
          <option value="ja-JP">日本語</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Theme */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">
          {t("settings.theme")}
        </label>
        <select
          value={settings.general.theme}
          onChange={handleThemeChange}
          className="w-full px-3 py-2 text-xs bg-surface-2 border border-surface-3 rounded-lg text-gray-200 focus:outline-none focus:border-accent transition-colors"
        >
          <option value="dark">{t("settings.themeDark")}</option>
          <option value="light">{t("settings.themeLight")}</option>
          <option value="system">{t("settings.themeSystem")}</option>
        </select>
      </div>

      {/* Auto Save Interval */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">
          {t("settings.autoSaveInterval")}
        </label>
        <input
          type="number"
          min={5}
          max={300}
          value={settings.general.autoSaveIntervalSec}
          onChange={handleAutoSaveIntervalChange}
          className="w-full px-3 py-2 text-xs bg-surface-2 border border-surface-3 rounded-lg text-gray-200 focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Restore Last Project */}
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-xs text-gray-300">
          {t("settings.general")}
        </span>
        <input
          type="checkbox"
          checked={settings.general.restoreLastProject}
          onChange={handleRestoreLastProjectChange}
          className="rounded border-surface-3 bg-surface-3 text-accent focus:ring-accent"
        />
      </label>
    </div>
  );
}
