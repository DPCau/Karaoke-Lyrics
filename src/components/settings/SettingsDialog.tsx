import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../../store";
import { GeneralSettings } from "./GeneralSettings";
import { TimingSettings } from "./TimingSettings";
import { PlaybackSettings } from "./PlaybackSettings";
import { ExportSettings } from "./ExportSettings";

type SettingsTab = "general" | "timing" | "playback" | "export" | "shortcuts";

const TABS: { id: SettingsTab; labelKey: string }[] = [
  { id: "general", labelKey: "settings.general" },
  { id: "timing", labelKey: "settings.timing" },
  { id: "playback", labelKey: "settings.playback" },
  { id: "export", labelKey: "settings.export" },
  { id: "shortcuts", labelKey: "settings.shortcuts" },
];

export function SettingsDialog() {
  const { t } = useTranslation();
  const showSettings = useStore((s) => s.showSettings);
  const setShowSettings = useStore((s) => s.setShowSettings);
  const resetToDefaults = useStore((s) => s.resetToDefaults);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  // Close on Escape
  useEffect(() => {
    if (!showSettings) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSettings(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showSettings, setShowSettings]);

  const handleClose = useCallback(() => {
    setShowSettings(false);
  }, [setShowSettings]);

  const handleResetDefaults = useCallback(() => {
    resetToDefaults();
  }, [resetToDefaults]);

  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[640px] h-[480px] bg-surface-1 border border-surface-3 rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-3">
          <h2 className="text-sm font-semibold text-white">{t("settings.title")}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body: sidebar + content */}
        <div className="flex-1 flex min-h-0">
          {/* Left sidebar */}
          <div className="w-36 flex-shrink-0 border-r border-surface-3 p-2 space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-3 py-2 text-xs rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? "bg-accent/20 text-accent font-medium"
                    : "text-gray-400 hover:text-gray-200 hover:bg-surface-2"
                }`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          {/* Right content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "general" && <GeneralSettings />}
            {activeTab === "timing" && <TimingSettings />}
            {activeTab === "playback" && <PlaybackSettings />}
            {activeTab === "export" && <ExportSettings />}
            {activeTab === "shortcuts" && (
              <div className="text-xs text-gray-500 text-center py-8">
                {t("settings.shortcuts")}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-1.5 text-xs text-amber-400 hover:text-amber-300 bg-surface-2 hover:bg-surface-3 rounded-lg transition-colors"
          >
            {t("settings.resetToDefault")}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-surface-2 hover:bg-surface-3 rounded-lg transition-colors"
            >
              {t("settings.cancel")}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-1.5 text-xs font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
            >
              {t("settings.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
