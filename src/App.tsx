import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { MainLayout } from "./components/layout/MainLayout";
import { StatusBar } from "./components/layout/StatusBar";
import { MenuBar } from "./components/layout/MenuBar";
import { SettingsDialog } from "./components/settings/SettingsDialog";
import { useTimingMode } from "./hooks/useTimingMode";
import { useStore } from "./store";

const isMac =
  navigator.platform.includes("Mac") ||
  navigator.userAgent.includes("Mac");

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
      // Sync native macOS menu language on startup
      invoke("update_menu_language", {
        lang: settings.general.language,
      }).catch(() => {
        // Silently ignore — likely running outside Tauri
      });
    }
  }, [settings.general.language, i18n]);

  // Menu event listener (native macOS menu bar)
  useEffect(() => {
    const unlistenPromise = listen<string>("menu-event", (event) => {
      const s = useStore.getState();
      switch (event.payload) {
        case "new_project":
          // TODO: implement new project
          break;
        case "open_project":
          // TODO: implement open project
          break;
        case "save_project":
          // TODO: implement save
          break;
        case "save_as":
          // TODO: implement save as
          break;
        case "import_video":
          // TODO: trigger import video
          break;
        case "import_audio":
          // TODO: trigger import audio
          break;
        case "import_lyrics":
          // TODO: trigger import lyrics
          break;
        case "settings":
          s.setShowSettings(true);
          break;
        case "fullscreen":
          // Toggle fullscreen can use a Tauri window API call
          break;
        case "start_timing":
          s.setActivePanel("media");
          break;
        case "shortcuts":
          s.setShowSettings(true);
          break;
        default:
          break;
      }
    });

    return () => {
      unlistenPromise.then((fn) => fn());
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-surface-0 text-gray-200">
      {!isMac && <MenuBar />}
      <MainLayout />
      <StatusBar />
      <SettingsDialog />
    </div>
  );
}
