import { useStore } from "../../store";

interface MenuItem {
  label: string;
  items?: { label: string; shortcut?: string; action?: () => void }[];
}

export function MenuBar() {
  const isDirty = useStore((s) => s.isDirty);

  const menus: MenuItem[] = [
    {
      label: "File",
      items: [
        { label: "New Project", shortcut: "Cmd+N" },
        { label: "Open Project...", shortcut: "Cmd+O" },
        { label: "Save", shortcut: "Cmd+S" },
        { label: "Save As...", shortcut: "Cmd+Shift+S" },
        { label: "---" },
        { label: "Import Media..." },
        { label: "Export..." },
        { label: "---" },
        { label: "Exit", shortcut: "Cmd+Q" },
      ],
    },
    {
      label: "Edit",
      items: [
        { label: "Undo", shortcut: "Cmd+Z" },
        { label: "Redo", shortcut: "Cmd+Shift+Z" },
        { label: "---" },
        { label: "Cut", shortcut: "Cmd+X" },
        { label: "Copy", shortcut: "Cmd+C" },
        { label: "Paste", shortcut: "Cmd+V" },
        { label: "Delete" },
      ],
    },
    {
      label: "View",
      items: [
        { label: "Toggle Timeline" },
        { label: "Toggle Waveform" },
        { label: "---" },
        { label: "Zoom In" },
        { label: "Zoom Out" },
        { label: "Fit to Window" },
        { label: "---" },
        { label: "Full Screen" },
      ],
    },
    {
      label: "Timing",
      items: [
        { label: "Start Recording", shortcut: "R" },
        { label: "Manual Mark", shortcut: "Space" },
        { label: "---" },
        { label: "Set Lead-in..." },
        { label: "Adjust All Timings..." },
        { label: "Synchronize from Audio..." },
      ],
    },
    {
      label: "Style",
      items: [
        { label: "Font..." },
        { label: "Colors..." },
        { label: "Effects..." },
        { label: "---" },
        { label: "Load Preset..." },
        { label: "Save as Preset..." },
      ],
    },
    {
      label: "Tools",
      items: [
        { label: "Pronunciation Editor" },
        { label: "Batch Converter" },
        { label: "---" },
        { label: "Settings..." },
      ],
    },
    {
      label: "Help",
      items: [
        { label: "About Karaoke Lyrics Maker" },
        { label: "Keyboard Shortcuts", shortcut: "Cmd+/" },
        { label: "Documentation" },
      ],
    },
  ];

  return (
    <div className="flex items-center h-8 bg-surface-1 border-b border-surface-3 select-none shrink-0">
      <div className="flex items-center gap-0.5 px-1.5">
        {menus.map((menu) => (
          <div key={menu.label} className="relative group cursor-default">
            <span className="block px-2.5 py-0.5 text-xs text-gray-300 hover:bg-surface-3 rounded transition-colors">
              {menu.label}
            </span>
            {menu.items && (
              <div className="absolute top-full left-0 min-w-48 bg-surface-2 border border-surface-3 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 py-1">
                {menu.items.map((item, i) =>
                  item.label === "---" ? (
                    <div key={i} className="h-px bg-surface-3 my-1 mx-2" />
                  ) : (
                    <button
                      key={i}
                      type="button"
                      onClick={item.action}
                      className="flex items-center justify-between w-full px-3 py-1 text-xs text-gray-300 hover:bg-surface-3 hover:text-white transition-colors"
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="ml-8 text-gray-500 text-[10px]">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex-1" />
      {isDirty && (
        <span className="text-[10px] text-amber-400 mr-3">Unsaved</span>
      )}
    </div>
  );
}
