import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../../store";
import type { AppStore } from "../../store";
import type { StylePreset } from "../../store/styleSlice";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CustomPresetData {
  id: string;
  name: string;
  createdAt: number;
  saved: {
    fontConfig: AppStore["fontConfig"];
    unsungColor: AppStore["unsungColor"];
    sungColor: AppStore["sungColor"];
    outline: AppStore["outline"];
    shadow: AppStore["shadow"];
    glow: AppStore["glow"];
    sweep: AppStore["sweep"];
    backgroundBar: AppStore["backgroundBar"];
    layout: AppStore["layout"];
    background: AppStore["background"];
  };
}

const STORAGE_KEY = "karaoke-style-custom-presets";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadCustomPresets(): CustomPresetData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomPresetData[];
  } catch {
    return [];
  }
}

function saveCustomPresets(presets: CustomPresetData[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

function generateId(): string {
  return `preset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Built-in preset labels
// ---------------------------------------------------------------------------

const BUILT_IN_PRESETS: { id: StylePreset; labelKey: string }[] = [
  { id: "classic", labelKey: "style_panel.presetClassic" },
  { id: "modern", labelKey: "style_panel.presetModern" },
  { id: "neon", labelKey: "style_panel.presetNeon" },
  { id: "subtle", labelKey: "style_panel.presetSubtle" },
  { id: "bold", labelKey: "style_panel.presetBold" },
];

// ---------------------------------------------------------------------------
// StylePresetManager
// ---------------------------------------------------------------------------

export function StylePresetManager() {
  const { t } = useTranslation();
  const applyPreset = useStore((s) => s.applyPreset);

  const [customPresets, setCustomPresets] = useState<CustomPresetData[]>(() =>
    loadCustomPresets(),
  );
  const [saveName, setSaveName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  // Persist to localStorage whenever customPresets changes
  useEffect(() => {
    saveCustomPresets(customPresets);
  }, [customPresets]);

  const handleApplyBuiltIn = useCallback(
    (preset: StylePreset) => {
      applyPreset(preset);
    },
    [applyPreset],
  );

  const handleApplyCustom = useCallback(
    (preset: CustomPresetData) => {
      const { saved } = preset;
      // Use the store setters to apply all saved fields
      const store = useStore.getState();
      store.setFontConfig(saved.fontConfig);
      store.setUnsungColor(saved.unsungColor);
      store.setSungColor(saved.sungColor);
      store.setOutline(saved.outline);
      store.setShadow(saved.shadow);
      store.setGlow(saved.glow);
      store.setSweep(saved.sweep);
      store.setBackgroundBar(saved.backgroundBar);
      store.setLayout(saved.layout);
      store.setBackground(saved.background);
    },
    [],
  );

  const handleSaveCurrent = useCallback(() => {
    const state = useStore.getState();
    const newPreset: CustomPresetData = {
      id: generateId(),
      name: saveName.trim() || `Preset ${customPresets.length + 1}`,
      createdAt: Date.now(),
      saved: {
        fontConfig: { ...state.fontConfig },
        unsungColor: state.unsungColor,
        sungColor: state.sungColor,
        outline: { ...state.outline },
        shadow: { ...state.shadow },
        glow: { ...state.glow },
        sweep: { ...state.sweep },
        backgroundBar: { ...state.backgroundBar },
        layout: { ...state.layout },
        background: { ...state.background },
      },
    };
    setCustomPresets((prev) => [...prev, newPreset]);
    setSaveName("");
    setShowSaveInput(false);
  }, [saveName, customPresets.length]);

  const handleDeleteCustom = useCallback((id: string) => {
    setCustomPresets((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <div className="space-y-2">
      {/* Built-in presets */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-gray-600 font-medium mb-1.5">
          {t("style_panel.builtin")}
        </label>
        <div className="grid grid-cols-2 gap-1">
          {BUILT_IN_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyBuiltIn(preset.id)}
              className="px-2 py-1.5 text-[11px] rounded bg-surface-2 text-gray-400 hover:text-gray-200 hover:bg-surface-3 transition-colors border border-transparent hover:border-surface-3 text-left"
            >
              {t(preset.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Custom presets */}
      {customPresets.length > 0 && (
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gray-600 font-medium mb-1.5">
            {t("style_panel.custom")}
          </label>
          <div className="space-y-1">
            {customPresets.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center gap-1 group"
              >
                <button
                  type="button"
                  onClick={() => handleApplyCustom(preset)}
                  className="flex-1 px-2 py-1.5 text-[11px] rounded bg-surface-2 text-gray-400 hover:text-gray-200 hover:bg-surface-3 transition-colors border border-transparent hover:border-surface-3 text-left truncate"
                  title={preset.name}
                >
                  {preset.name}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCustom(preset.id)}
                  className="w-5 h-5 flex items-center justify-center rounded text-gray-600 hover:text-red-400 hover:bg-surface-3 opacity-0 group-hover:opacity-100 transition-all text-[10px] flex-shrink-0"
                  title={t("style_panel.deletePresetTitle")}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save current as preset */}
      <div className="pt-1 border-t border-surface-3">
        {showSaveInput ? (
          <div className="flex gap-1">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveCurrent();
                if (e.key === "Escape") {
                  setShowSaveInput(false);
                  setSaveName("");
                }
              }}
              placeholder={t("style_panel.presetName")}
              className="flex-1 bg-surface-2 border border-surface-3 rounded px-2 py-1 text-[11px] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent/50"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSaveCurrent}
              className="px-2 py-1 text-[11px] font-medium bg-accent text-white rounded hover:bg-accent-hover transition-colors"
            >
              {t("common.save")}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSaveInput(false);
                setSaveName("");
              }}
              className="px-2 py-1 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
            >
              {t("common.cancel")}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowSaveInput(true)}
            className="w-full px-2 py-1.5 text-[11px] font-medium text-accent bg-accent/10 rounded hover:bg-accent/20 transition-colors"
          >
            + {t("style_panel.saveCurrent")}
          </button>
        )}
      </div>
    </div>
  );
}
