import { useCallback } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { useTranslation } from "react-i18next";
import { useStore } from "../../store";
import { MediaPanel } from "../media/MediaPanel";
import { LyricTextEditor } from "../lyrics/LyricTextEditor";
import { PlaybackControls } from "../media/PlaybackControls";
import { TimelinePanel } from "../timeline/TimelinePanel";
import { StylePanel } from "../style/StylePanel";
import { PronunciationPanel } from "../pronunciation/PronunciationPanel";

function LeftPanelTabs() {
  const { t } = useTranslation();
  const activePanel = useStore((s) => s.activePanel);
  const setActivePanel = useStore((s) => s.setActivePanel);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-3 py-1.5 bg-surface-1 border-b border-surface-3 shrink-0">
        <button
          type="button"
          onClick={() => setActivePanel("media")}
          className={`text-xs font-medium px-2 py-0.5 rounded transition-colors ${
            activePanel === "media"
              ? "bg-accent text-white"
              : "text-gray-400 hover:text-gray-200 hover:bg-surface-2"
          }`}
        >
          {t("media.importVideo")}
        </button>
        <button
          type="button"
          onClick={() => setActivePanel("lyrics")}
          className={`text-xs font-medium px-2 py-0.5 rounded transition-colors ${
            activePanel === "lyrics"
              ? "bg-accent text-white"
              : "text-gray-400 hover:text-gray-200 hover:bg-surface-2"
          }`}
        >
          {t("lyrics.editor")}
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {activePanel === "media" ? (
          <div className="h-full overflow-auto p-3">
            <MediaPanel />
          </div>
        ) : (
          <div className="h-full overflow-auto p-3">
            <LyricTextEditor />
          </div>
        )}
      </div>
    </div>
  );
}

function RightPanelTabs() {
  const { t } = useTranslation();
  const activePanel = useStore((s) => s.activePanel);
  const setActivePanel = useStore((s) => s.setActivePanel);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-3 py-1.5 bg-surface-1 border-b border-surface-3 shrink-0">
        <button
          type="button"
          onClick={() => setActivePanel("style")}
          className={`text-xs font-medium px-2 py-0.5 rounded transition-colors ${
            activePanel === "style"
              ? "bg-accent text-white"
              : "text-gray-400 hover:text-gray-200 hover:bg-surface-2"
          }`}
        >
          {t("style_panel.presets")}
        </button>
        <button
          type="button"
          onClick={() => setActivePanel("preview")}
          className={`text-xs font-medium px-2 py-0.5 rounded transition-colors ${
            activePanel === "preview"
              ? "bg-accent text-white"
              : "text-gray-400 hover:text-gray-200 hover:bg-surface-2"
          }`}
        >
          {t("pronunciation.panel")}
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {activePanel === "style" ? (
          <div className="h-full overflow-auto p-3">
            <StylePanel />
          </div>
        ) : (
          <div className="h-full overflow-auto p-3">
            <PronunciationPanel />
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewArea() {
  const videoPath = useStore((s) => s.videoPath);

  return (
    <div className="flex items-center justify-center h-full bg-black/40">
      {videoPath ? (
        <video
          key={videoPath}
          src={videoPath}
          className="max-w-full max-h-full object-contain"
          controls={false}
          preload="auto"
        />
      ) : (
        <span className="text-gray-600 text-xs">Preview</span>
      )}
    </div>
  );
}

export function MainLayout() {
  const panelSizes = useStore((s) => s.panelSizes);
  const setPanelSizes = useStore((s) => s.setPanelSizes);

  const handleHorizontalLayout = useCallback(
    (layout: Record<string, number>) => {
      setPanelSizes({
        left: layout["left-panel"] ?? panelSizes.left,
        center: layout["center-panel"] ?? panelSizes.center,
        right: layout["right-panel"] ?? panelSizes.right,
      });
    },
    [setPanelSizes, panelSizes],
  );

  const handleVerticalLayout = useCallback(
    (layout: Record<string, number>) => {
      setPanelSizes({
        top: layout["top-panel"] ?? panelSizes.top,
        bottom: layout["bottom-panel"] ?? panelSizes.bottom,
      });
    },
    [setPanelSizes, panelSizes],
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface-0">
      <Group
        className="flex-1 flex"
        orientation="horizontal"
        defaultLayout={{
          "left-panel": panelSizes.left,
          "center-panel": panelSizes.center,
          "right-panel": panelSizes.right,
        }}
        onLayoutChange={handleHorizontalLayout}
      >
        {/* Left panel: Media + Lyrics tabs */}
        <Panel id="left-panel" minSize={10}>
          <LeftPanelTabs />
        </Panel>

        <Separator className="w-1 bg-surface-2 hover:bg-accent transition-colors cursor-col-resize data-[separator]:hover:bg-accent data-[separator]:active:bg-accent" />

        {/* Center panel: Preview + Timeline */}
        <Panel id="center-panel" minSize={25}>
          <Group
            className="flex-1 flex"
            orientation="vertical"
            defaultLayout={{
              "top-panel": panelSizes.top,
              "bottom-panel": panelSizes.bottom,
            }}
            onLayoutChange={handleVerticalLayout}
          >
            <Panel id="top-panel" minSize={20}>
              <PreviewArea />
            </Panel>

            <Separator className="h-1 bg-surface-2 hover:bg-accent transition-colors cursor-row-resize data-[separator]:hover:bg-accent data-[separator]:active:bg-accent" />

            <Panel id="bottom-panel" minSize={15}>
              <TimelinePanel />
            </Panel>
          </Group>
        </Panel>

        <Separator className="w-1 bg-surface-2 hover:bg-accent transition-colors cursor-col-resize data-[separator]:hover:bg-accent data-[separator]:active:bg-accent" />

        {/* Right panel: Style + Pronunciation tabs */}
        <Panel id="right-panel" minSize={15}>
          <RightPanelTabs />
        </Panel>
      </Group>

      {/* Playback controls */}
      <PlaybackControls />
    </div>
  );
}
