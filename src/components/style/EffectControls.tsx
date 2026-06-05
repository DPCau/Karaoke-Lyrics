import { useStore } from "../../store";
import {
  SliderControl,
  ToggleControl,
  SelectControl,
  ButtonGroup,
} from "./StyleControls";
import { ColorPicker } from "./ColorPicker";

// ---------------------------------------------------------------------------
// Outline Controls
// ---------------------------------------------------------------------------

const OUTLINE_STYLES = [
  { value: "outset" as const, label: "Outset" },
  { value: "inset" as const, label: "Inset" },
  { value: "center" as const, label: "Center" },
];

export function OutlineControls() {
  const outline = useStore((s) => s.outline);
  const setOutline = useStore((s) => s.setOutline);

  return (
    <div className="space-y-3">
      <ToggleControl
        label="Enabled"
        value={outline.enabled}
        onChange={(v) => setOutline({ enabled: v })}
      />
      {outline.enabled && (
        <>
          <SliderControl
            label="Width"
            value={outline.width}
            min={0}
            max={20}
            step={0.5}
            display={`${outline.width}px`}
            onChange={(v) => setOutline({ width: v })}
          />
          <ColorPicker
            value={outline.color}
            onChange={(v) => setOutline({ color: v })}
            compact
          />
          <ButtonGroup
            label="Style"
            value={outline.style}
            options={OUTLINE_STYLES}
            onChange={(v) => setOutline({ style: v })}
          />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shadow Controls
// ---------------------------------------------------------------------------

export function ShadowControls() {
  const shadow = useStore((s) => s.shadow);
  const setShadow = useStore((s) => s.setShadow);

  return (
    <div className="space-y-3">
      <ToggleControl
        label="Enabled"
        value={shadow.enabled}
        onChange={(v) => setShadow({ enabled: v })}
      />
      {shadow.enabled && (
        <>
          <ColorPicker
            value={shadow.color}
            onChange={(v) => setShadow({ color: v })}
            compact
          />
          <SliderControl
            label="Blur"
            value={shadow.blur}
            min={0}
            max={50}
            step={1}
            display={`${shadow.blur}px`}
            onChange={(v) => setShadow({ blur: v })}
          />
          <SliderControl
            label="Offset X"
            value={shadow.offsetX}
            min={-50}
            max={50}
            step={1}
            display={`${shadow.offsetX}px`}
            onChange={(v) => setShadow({ offsetX: v })}
          />
          <SliderControl
            label="Offset Y"
            value={shadow.offsetY}
            min={-50}
            max={50}
            step={1}
            display={`${shadow.offsetY}px`}
            onChange={(v) => setShadow({ offsetY: v })}
          />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Glow Controls
// ---------------------------------------------------------------------------

export function GlowControls() {
  const glow = useStore((s) => s.glow);
  const setGlow = useStore((s) => s.setGlow);

  return (
    <div className="space-y-3">
      <ToggleControl
        label="Enabled"
        value={glow.enabled}
        onChange={(v) => setGlow({ enabled: v })}
      />
      {glow.enabled && (
        <>
          <ColorPicker
            value={glow.color}
            onChange={(v) => setGlow({ color: v })}
            compact
          />
          <SliderControl
            label="Radius"
            value={glow.radius}
            min={0}
            max={50}
            step={1}
            display={`${glow.radius}px`}
            onChange={(v) => setGlow({ radius: v })}
          />
          <SliderControl
            label="Intensity"
            value={glow.intensity}
            min={0}
            max={100}
            step={1}
            display={`${glow.intensity}%`}
            onChange={(v) => setGlow({ intensity: v })}
          />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sweep Controls
// ---------------------------------------------------------------------------

const SWEEP_DIRECTIONS = [
  { value: "left-to-right" as const, label: "L->R" },
  { value: "right-to-left" as const, label: "R->L" },
  { value: "top-to-bottom" as const, label: "T->B" },
  { value: "bottom-to-top" as const, label: "B->T" },
];

const EASING_OPTIONS = [
  { value: "linear" as const, label: "Linear" },
  { value: "ease-in" as const, label: "Ease In" },
  { value: "ease-out" as const, label: "Ease Out" },
  { value: "ease-in-out" as const, label: "Ease In-Out" },
];

export function SweepControls() {
  const sweep = useStore((s) => s.sweep);
  const setSweep = useStore((s) => s.setSweep);

  return (
    <div className="space-y-3">
      <ToggleControl
        label="Enabled"
        value={sweep.enabled}
        onChange={(v) => setSweep({ enabled: v })}
      />
      {sweep.enabled && (
        <>
          <ColorPicker
            value={sweep.color}
            onChange={(v) => setSweep({ color: v })}
            compact
          />
          <ButtonGroup
            label="Direction"
            value={sweep.direction}
            options={SWEEP_DIRECTIONS}
            onChange={(v) => setSweep({ direction: v })}
          />
          <SliderControl
            label="Glow Width"
            value={sweep.glowWidth}
            min={0}
            max={20}
            step={0.5}
            display={`${sweep.glowWidth}px`}
            onChange={(v) => setSweep({ glowWidth: v })}
          />
          <SliderControl
            label="Gradient Width"
            value={sweep.gradientWidth}
            min={0}
            max={1}
            step={0.05}
            display={sweep.gradientWidth.toFixed(2)}
            onChange={(v) => setSweep({ gradientWidth: v })}
          />
          <SelectControl
            label="Easing"
            value={sweep.easing}
            options={EASING_OPTIONS}
            onChange={(v) => setSweep({ easing: v as typeof sweep.easing })}
          />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Background Bar Controls
// ---------------------------------------------------------------------------

const WIDTH_MODE_OPTIONS = [
  { value: "text" as const, label: "Text" },
  { value: "line" as const, label: "Line" },
  { value: "full" as const, label: "Full" },
];

export function BackgroundBarControls() {
  const bgBar = useStore((s) => s.backgroundBar);
  const setBgBar = useStore((s) => s.setBackgroundBar);

  return (
    <div className="space-y-3">
      <ToggleControl
        label="Enabled"
        value={bgBar.enabled}
        onChange={(v) => setBgBar({ enabled: v })}
      />
      {bgBar.enabled && (
        <>
          <ColorPicker
            value={bgBar.color}
            onChange={(v) => setBgBar({ color: v })}
            compact
          />
          <SliderControl
            label="Padding"
            value={bgBar.padding}
            min={0}
            max={50}
            step={1}
            display={`${bgBar.padding}px`}
            onChange={(v) => setBgBar({ padding: v })}
          />
          <SliderControl
            label="Border Radius"
            value={bgBar.borderRadius}
            min={0}
            max={30}
            step={1}
            display={`${bgBar.borderRadius}px`}
            onChange={(v) => setBgBar({ borderRadius: v })}
          />
          <SliderControl
            label="Opacity"
            value={bgBar.opacity}
            min={0}
            max={1}
            step={0.05}
            display={bgBar.opacity.toFixed(2)}
            onChange={(v) => setBgBar({ opacity: v })}
          />
          <ButtonGroup
            label="Width Mode"
            value={bgBar.widthMode}
            options={WIDTH_MODE_OPTIONS}
            onChange={(v) => setBgBar({ widthMode: v })}
          />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layout Controls
// ---------------------------------------------------------------------------

const ALIGNMENT_OPTIONS = [
  { value: "left" as const, label: "Left" },
  { value: "center" as const, label: "Center" },
  { value: "right" as const, label: "Right" },
];

export function LayoutControls() {
  const layout = useStore((s) => s.layout);
  const setLayout = useStore((s) => s.setLayout);

  return (
    <div className="space-y-3">
      <ButtonGroup
        label="Alignment"
        value={layout.alignment}
        options={ALIGNMENT_OPTIONS}
        onChange={(v) => setLayout({ alignment: v })}
      />
      <SliderControl
        label="Vertical Position"
        value={layout.verticalPosition}
        min={0}
        max={100}
        step={1}
        display={`${layout.verticalPosition}%`}
        onChange={(v) => setLayout({ verticalPosition: v })}
      />
      <ToggleControl
        label="Dual Line"
        value={layout.dualLine}
        onChange={(v) => setLayout({ dualLine: v })}
      />
      {layout.dualLine && (
        <>
          <SliderControl
            label="Line Gap"
            value={layout.lineGap}
            min={0}
            max={60}
            step={1}
            display={`${layout.lineGap}px`}
            onChange={(v) => setLayout({ lineGap: v })}
          />
          <SliderControl
            label="Current Line Scale"
            value={layout.currentLineScale}
            min={0.5}
            max={2.0}
            step={0.05}
            display={layout.currentLineScale.toFixed(2)}
            onChange={(v) => setLayout({ currentLineScale: v })}
          />
          <SliderControl
            label="Next Line Scale"
            value={layout.nextLineScale}
            min={0.3}
            max={1.5}
            step={0.05}
            display={layout.nextLineScale.toFixed(2)}
            onChange={(v) => setLayout({ nextLineScale: v })}
          />
        </>
      )}
    </div>
  );
}
