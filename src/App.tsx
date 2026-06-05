import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MainLayout } from "./components/layout/MainLayout";
import { StatusBar } from "./components/layout/StatusBar";
import { MenuBar } from "./components/layout/MenuBar";
import { SettingsDialog } from "./components/settings/SettingsDialog";
import { useTimingMode } from "./hooks/useTimingMode";
import { useStore } from "./store";

export default function App() {
  const { i18n } = useTranslation();
  const loadSettings = useStore((s) => s.loadSettings);
  const settings = useStore((s) => s.settings);
  const loadPanelSizes = useStore((s) => s.loadPanelSizes);

  // Activate global keyboard bindings for the timing engine.
  useTimingMode();

  // Load settings and panel layout from localStorage on mount
  useEffect(() => {
    loadSettings();
    loadPanelSizes();
  }, []);

  // Sync language from settings to i18n
  useEffect(() => {
    if (settings.general.language && settings.general.language !== i18n.language) {
      i18n.changeLanguage(settings.general.language);
    }
  }, [settings.general.language, i18n]);

  return (
    <div className="flex flex-col h-full bg-surface-0 text-gray-200">
      <MenuBar />
      <MainLayout />
      <StatusBar />
      <SettingsDialog />
    </div>
  );
}
