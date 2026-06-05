import { useTranslation } from "react-i18next";
import { useStore } from "../../store";

interface MenuItem {
  labelKey: string;
  items?: { labelKey: string; shortcut?: string; action?: () => void }[];
}

export function MenuBar() {
  const { t } = useTranslation();
  const isDirty = useStore((s) => s.isDirty);
  const setShowSettings = useStore((s) => s.setShowSettings);

  const menus: MenuItem[] = [
    {
      labelKey: "menu.file",
      items: [
        { labelKey: "menu.file.new", shortcut: "Cmd+N" },
        { labelKey: "menu.file.open", shortcut: "Cmd+O" },
        { labelKey: "menu.file.save", shortcut: "Cmd+S" },
        { labelKey: "menu.file.saveAs", shortcut: "Cmd+Shift+S" },
        { labelKey: "---" },
        { labelKey: "menu.file.export" },
        { labelKey: "---" },
        { labelKey: "menu.file.settings", shortcut: "Ctrl+,", action: () => setShowSettings(true) },
        { labelKey: "---" },
        { labelKey: "menu.file.quit", shortcut: "Cmd+Q" },
      ],
    },
    {
      labelKey: "menu.edit",
      items: [
        { labelKey: "menu.edit.undo", shortcut: "Cmd+Z" },
        { labelKey: "menu.edit.redo", shortcut: "Cmd+Shift+Z" },
      ],
    },
    {
      labelKey: "menu.view",
      items: [
        { labelKey: "view.panels" },
        { labelKey: "view.zoom" },
        { labelKey: "---" },
        { labelKey: "menu.view.fullscreen" },
      ],
    },
    {
      labelKey: "menu.timing",
      items: [
        { labelKey: "menu.timing.start", shortcut: "R" },
        { labelKey: "menu.timing.stop" },
      ],
    },
    {
      labelKey: "menu.style",
      items: [
        { labelKey: "menu.style.presets" },
      ],
    },
    {
      labelKey: "menu.tools",
      items: [
        { labelKey: "menu.tools.annotate" },
        { labelKey: "menu.tools.batch" },
      ],
    },
    {
      labelKey: "menu.help",
      items: [
        { labelKey: "menu.help.about" },
        { labelKey: "menu.help.shortcuts", shortcut: "Cmd+/" },
      ],
    },
  ];

  return (
    <div className="flex items-center h-8 bg-surface-1 border-b border-surface-3 select-none shrink-0">
      <div className="flex items-center gap-0.5 px-1.5">
        {menus.map((menu) => (
          <div key={menu.labelKey} className="relative group cursor-default">
            <span className="block px-2.5 py-0.5 text-xs text-gray-300 hover:bg-surface-3 rounded transition-colors">
              {t(menu.labelKey)}
            </span>
            {menu.items && (
              <div className="absolute top-full left-0 min-w-48 bg-surface-2 border border-surface-3 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 py-1">
                {menu.items.map((item, i) =>
                  item.labelKey === "---" ? (
                    <div key={i} className="h-px bg-surface-3 my-1 mx-2" />
                  ) : (
                    <button
                      key={i}
                      type="button"
                      onClick={item.action}
                      className="flex items-center justify-between w-full px-3 py-1 text-xs text-gray-300 hover:bg-surface-3 hover:text-white transition-colors"
                    >
                      <span>{t(item.labelKey)}</span>
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
        <span className="text-[10px] text-amber-400 mr-3">
          {t("status.modified")}
        </span>
      )}
    </div>
  );
}
