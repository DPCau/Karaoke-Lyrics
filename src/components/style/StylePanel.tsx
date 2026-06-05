import { useStore } from "../../store";
import { CollapsibleSection } from "./CollapsibleSection";
import { FontPicker } from "./FontPicker";
import { ColorPicker, ColorPickerRGBA } from "./ColorPicker";
import {
  OutlineControls,
  ShadowControls,
  GlowControls,
  SweepControls,
  BackgroundBarControls,
  LayoutControls,
} from "./EffectControls";
import { StylePresetManager } from "./StylePresetManager";

// ---------------------------------------------------------------------------
// MiniPreview — small inline preview of the current style
// ---------------------------------------------------------------------------

function MiniPreview() {
  const fontConfig = useStore((s) => s.fontConfig);
  const unsungColor = useStore((s) => s.unsungColor);
  const sungColor = useStore((s) => s.sungColor);
  const outline = useStore((s) => s.outline);
  const shadow = useStore((s) => s.shadow);
  const glow = useStore((s) => s.glow);
  const background = useStore((s) => s.background);
  const backgroundBar = useStore((s) => s.backgroundBar);

  const previewText = "Hello World";

  // Build inline styles for the preview text
  const textStyle: React.CSSProperties = {
    fontFamily: fontConfig.family,
    fontSize: `${Math.min(fontConfig.size, 72)}px`,
    fontWeight: fontConfig.weight,
    fontStyle: fontConfig.italic ? "italic" : "normal",
    letterSpacing: `${fontConfig.letterSpacing}px`,
    color: unsungColor,
    lineHeight: fontConfig.lineHeight,
    textAlign: "center",
  };

  // Build text shadow for glow + shadow CSS effects
  const shadows: string[] = [];

  if (shadow.enabled) {
    shadows.push(
      `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.color}`,
    );
  }

  if (glow.enabled) {
    shadows.push(`0 0 ${glow.radius}px ${glow.color}`);
    shadows.push(`0 0 ${glow.radius * 0.6}px ${glow.color}`);
  }

  if (shadows.length > 0) {
    textStyle.textShadow = shadows.join(", ");
  }

  // Build webkit text stroke for outline
  if (outline.enabled && outline.width > 0) {
    textStyle.WebkitTextStroke = `${outline.width}px ${outline.color}`;
    textStyle.paintOrder = "stroke fill";
  }

  // Background bar
  const showBgBar = backgroundBar.enabled;

  return (
    <div
      className="relative w-full rounded overflow-hidden flex items-center justify-center"
      style={{
        minHeight: "80px",
        background: `rgba(${background.r},${background.g},${background.b},${background.a})`,
      }}
    >
      {showBgBar && (
        <div
          className="absolute inset-x-2 rounded"
          style={{
            top: `${Math.max(0, 50 - fontConfig.size / 2 / 2 - backgroundBar.padding / 2)}%`,
            bottom: `${Math.max(0, 50 - fontConfig.size / 2 / 2 - backgroundBar.padding / 2)}%`,
            background: backgroundBar.color,
            opacity: backgroundBar.opacity,
            borderRadius: `${backgroundBar.borderRadius}px`,
          }}
        />
      )}
      <span
        className="relative z-10 px-4 py-2"
        style={textStyle}
      >
        <span style={{ color: sungColor }}>{previewText}</span>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StylePanel
// ---------------------------------------------------------------------------

export function StylePanel() {
  const unsungColor = useStore((s) => s.unsungColor);
  const sungColor = useStore((s) => s.sungColor);
  const background = useStore((s) => s.background);
  const setUnsungColor = useStore((s) => s.setUnsungColor);
  const setSungColor = useStore((s) => s.setSungColor);
  const setBackground = useStore((s) => s.setBackground);

  return (
    <div className="flex flex-col h-full gap-3 overflow-hidden">
      {/* Mini preview */}
      <MiniPreview />

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {/* Presets */}
        <CollapsibleSection title="Presets" defaultOpen={true}>
          <StylePresetManager />
        </CollapsibleSection>

        {/* Font */}
        <CollapsibleSection title="Font" defaultOpen={true}>
          <FontPicker />
        </CollapsibleSection>

        {/* Colors */}
        <CollapsibleSection title="Colors" defaultOpen={true}>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">
                Unsung Color
              </label>
              <ColorPicker
                value={unsungColor}
                onChange={setUnsungColor}
                compact
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">
                Sung Color
              </label>
              <ColorPicker
                value={sungColor}
                onChange={setSungColor}
                compact
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">
                Background
              </label>
              <ColorPickerRGBA
                value={background}
                onChange={setBackground}
                compact
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Outline */}
        <CollapsibleSection title="Outline" defaultOpen={false}>
          <OutlineControls />
        </CollapsibleSection>

        {/* Shadow */}
        <CollapsibleSection title="Shadow" defaultOpen={false}>
          <ShadowControls />
        </CollapsibleSection>

        {/* Glow */}
        <CollapsibleSection title="Glow" defaultOpen={false}>
          <GlowControls />
        </CollapsibleSection>

        {/* Sweep */}
        <CollapsibleSection title="Sweep" defaultOpen={false}>
          <SweepControls />
        </CollapsibleSection>

        {/* Background Bar */}
        <CollapsibleSection title="Background Bar" defaultOpen={false}>
          <BackgroundBarControls />
        </CollapsibleSection>

        {/* Layout */}
        <CollapsibleSection title="Layout" defaultOpen={false}>
          <LayoutControls />
        </CollapsibleSection>
      </div>
    </div>
  );
}
