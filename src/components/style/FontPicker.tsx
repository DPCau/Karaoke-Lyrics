import { useStore } from "../../store";
import { useTranslation } from "react-i18next";
import {
  SliderControl,
  ToggleControl,
  SelectControl,
} from "./StyleControls";

const FONT_FAMILIES = [
  { value: "Inter, system-ui, sans-serif", label: "Inter" },
  { value: "'SF Pro Display', -apple-system, sans-serif", label: "SF Pro Display" },
  { value: "'Segoe UI', system-ui, sans-serif", label: "Segoe UI" },
  { value: "'Noto Sans', system-ui, sans-serif", label: "Noto Sans" },
  { value: "Impact, 'Arial Black', sans-serif", label: "Impact" },
  { value: "Arial, Helvetica, sans-serif", label: "Arial" },
  { value: "Verdana, Geneva, sans-serif", label: "Verdana" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "'Courier New', monospace", label: "Courier New" },
  { value: "Roboto, sans-serif", label: "Roboto" },
  { value: "'Open Sans', sans-serif", label: "Open Sans" },
  { value: "Montserrat, sans-serif", label: "Montserrat" },
  { value: "Oswald, sans-serif", label: "Oswald" },
];

const WEIGHT_OPTIONS = [
  { value: "300", labelKey: "style_panel.weightLight" },
  { value: "400", labelKey: "style_panel.weightRegular" },
  { value: "500", labelKey: "style_panel.weightMedium" },
  { value: "600", labelKey: "style_panel.weightSemiBold" },
  { value: "700", labelKey: "style_panel.weightBold" },
  { value: "800", labelKey: "style_panel.weightHeavy" },
  { value: "900", labelKey: "style_panel.weightBlack" },
];

export function FontPicker() {
  const { t } = useTranslation();
  const fontConfig = useStore((s) => s.fontConfig);
  const setFontConfig = useStore((s) => s.setFontConfig);

  return (
    <div className="space-y-3">
      {/* Font family */}
      <SelectControl
        label={t("style_panel.fontFamily")}
        value={fontConfig.family}
        options={FONT_FAMILIES}
        onChange={(v) => setFontConfig({ family: v })}
      />

      {/* Font size */}
      <SliderControl
        label={t("style_panel.fontSize")}
        value={fontConfig.size}
        min={12}
        max={200}
        step={1}
        display={`${fontConfig.size}px`}
        onChange={(v) => setFontConfig({ size: v })}
      />

      {/* Weight selector */}
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">
          {t("style_panel.fontWeight")}
        </label>
        <div className="flex gap-1">
          {WEIGHT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFontConfig({ weight: Number(opt.value) })}
              className={`flex-1 px-1 py-1 text-[10px] rounded transition-colors ${
                fontConfig.weight === Number(opt.value)
                  ? "bg-accent text-white"
                  : "bg-surface-2 text-gray-400 hover:text-gray-200 hover:bg-surface-3"
              }`}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Italic toggle */}
      <ToggleControl
        label={t("style_panel.italic")}
        value={fontConfig.italic}
        onChange={(v) => setFontConfig({ italic: v })}
      />

      {/* Line height */}
      <SliderControl
        label={t("style_panel.lineHeight")}
        value={fontConfig.lineHeight}
        min={0.8}
        max={3.0}
        step={0.1}
        display={fontConfig.lineHeight.toFixed(1)}
        onChange={(v) => setFontConfig({ lineHeight: v })}
      />

      {/* Letter spacing */}
      <SliderControl
        label={t("style_panel.letterSpacing")}
        value={fontConfig.letterSpacing}
        min={-5}
        max={20}
        step={0.5}
        display={`${fontConfig.letterSpacing}px`}
        onChange={(v) => setFontConfig({ letterSpacing: v })}
      />
    </div>
  );
}
