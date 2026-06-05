import type { ReactNode } from "react";
import { useStore } from "../../store";

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
  return (
    <div className="flex-1 flex overflow-hidden bg-surface-0">
      <Panel id="media" title="Media">
        <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
          <p>Drag & drop or open a media file</p>
        </div>
      </Panel>
      <div className="w-px bg-surface-3" />
      <Panel id="lyrics" title="Lyrics" className="flex-[1.2]">
        <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
          <p>No lyrics loaded</p>
        </div>
      </Panel>
      <div className="w-px bg-surface-3" />
      <Panel id="preview" title="Preview">
        <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
          <p>Preview area</p>
        </div>
      </Panel>
    </div>
  );
}
