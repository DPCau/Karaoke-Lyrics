import type { ReactNode } from "react";
import { useStore } from "../../store";
import { MediaPanel } from "../media/MediaPanel";
import { LyricTextEditor } from "../lyrics/LyricTextEditor";
import { PlaybackControls } from "../media/PlaybackControls";
import { WaveformDisplay } from "../timeline/WaveformDisplay";
import { LyricsOverlay } from "../lyrics/LyricsOverlay";

interface PanelProps {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}

function Panel({ id, title, children, className = "" }: PanelProps) {
  const activePanel = useStore((s) => s.activePanel);
  const setActivePanel = useStore((s) => s.setActivePanel);
  const isActive = activePanel === id;

  return (
    <div
      className={`flex flex-col min-w-0 ${
        isActive ? "flex-1" : "flex-[0.3]"
      } ${className}`}
    >
      <div className="flex items-center gap-1 px-3 py-1.5 bg-surface-1 border-b border-surface-3">
        <button
          type="button"
          onClick={() => setActivePanel(id as any)}
          className={`text-xs font-medium px-2 py-0.5 rounded transition-colors ${
            isActive
              ? "bg-accent text-white"
              : "text-gray-400 hover:text-gray-200 hover:bg-surface-2"
          }`}
        >
          {title}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-3">{children}</div>
    </div>
  );
}

export function MainLayout() {
  const lines = useStore((s) => s.lines);
  const currentTime = useStore((s) => s.currentTime);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface-0">
      {/* Main panels */}
      <div className="flex-1 flex overflow-hidden">
        <Panel id="media" title="Media">
          <MediaPanel />
        </Panel>

        <div className="w-px bg-surface-3" />

        <Panel id="lyrics" title="Lyrics" className="flex-[1.2]">
          <LyricTextEditor />
        </Panel>

        <div className="w-px bg-surface-3" />

        <Panel id="preview" title="Preview">
          <div className="flex flex-col gap-3 h-full">
            {/* Lyrics overlay preview */}
            <div className="flex-1 relative bg-black/40 rounded overflow-hidden min-h-[120px]">
              <LyricsOverlay
                currentTime={currentTime}
                lines={lines}
                width={400}
                height={200}
                dualLine
              />
            </div>

            {/* Waveform */}
            <div className="flex-shrink-0">
              <WaveformDisplay height={60} />
            </div>

            {/* Info */}
            <div className="flex-shrink-0 text-[10px] text-gray-600 text-center">
              {lines.length > 0
                ? `${lines.length} line${lines.length !== 1 ? "s" : ""} loaded`
                : "No lyrics loaded"}
            </div>
          </div>
        </Panel>
      </div>

      {/* Playback controls */}
      <PlaybackControls />
    </div>
  );
}
