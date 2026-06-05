import { useStore } from "../../store";
import { useTranslation } from "react-i18next";
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
  { value: "outset" as const, labelKey: "style_panel.outset" },
  { value: "inset" as const, labelKey: "style_panel.inset" },
  { value: "center" as const, labelKey: "style_panel.center" },
];

export function OutlineControls() {
  const { t } = useTranslation();
  const outline = useStore((s) => s.outline);
  const setOutline = useStore((s) => s.setOutline);

  const outlineStyleOptions = OUTLINE_STYLES.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey),
  }));

  return (
    <div className="space-y-3">
      <ToggleControl
        label={t("style_panel.enabled")}
        value={outline.enabled}
        onChange={(v) => setOutline({ enabled: v })}
      />
      {outline.enabled && (
        <>
          <SliderControl
            label={t("style_panel.width")}
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
            label={t("style_panel.style")}
            value={outline.style}
            options={outlineStyleOptions}
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
  const { t } = useTranslation();
  const shadow = useStore((s) => s.shadow);
  const setShadow = useStore((s) => s.setShadow);

  return (
    <div className="space-y-3">
      <ToggleControl
        label={t("style_panel.enabled")}
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
            label={t("style_panel.blur")}
            value={shadow.blur}
            min={0}
            max={50}
            step={1}
            display={`${shadow.blur}px`}
            onChange={(v) => setShadow({ blur: v })}
          />
          <SliderControl
            label={t("style_panel.offsetX")}
            value={shadow.offsetX}
            min={-50}
            max={50}
            step={1}
            display={`${shadow.offsetX}px`}
            onChange={(v) => setShadow({ offsetX: v })}
          />
          <SliderControl
            label={t("style_panel.offsetY")}
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
  const { t } = useTranslation();
  const glow = useStore((s) => s.glow);
  const setGlow = useStore((s) => s.setGlow);

  return (
    <div className="space-y-3">
      <ToggleControl
        label={t("style_panel.enabled")}
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
            label={t("style_panel.radius")}
            value={glow.radius}
            min={0}
            max={50}
            step={1}
            display={`${glow.radius}px`}
            onChange={(v) => setGlow({ radius: v })}
          />
          <SliderControl
            label={t("style_panel.intensity")}
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
  { value: "left-to-right" as const, labelKey: "style_panel.ltr" },
  { value: "right-to-left" as const, labelKey: "style_panel.rtl" },
  { value: "top-to-bottom" as const, labelKey: "style_panel.ttb" },
  { value: "bottom-to-top" as const, labelKey: "style_panel.btt" },
];

const EASING_OPTIONS = [
  { value: "linear" as const, labelKey: "style_panel.easingLinear" },
  { value: "ease-in" as const, labelKey: "style_panel.easingEaseIn" },
  { value: "ease-out" as const, labelKey: "style_panel.easingEaseOut" },
  { value: "ease-in-out" as const, labelKey: "style_panel.easingEaseInOut" },
];

export function SweepControls() {
  const { t } = useTranslation();
  const sweep = useStore((s) => s.sweep);
  const setSweep = useStore((s) => s.setSweep);

  const sweepDirectionOptions = SWEEP_DIRECTIONS.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey),
  }));
  const easingOptions = EASING_OPTIONS.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey),
  }));

  return (
    <div className="space-y-3">
      <ToggleControl
        label={t("style_panel.enabled")}
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
            label={t("style_panel.direction")}
            value={sweep.direction}
            options={sweepDirectionOptions}
            onChange={(v) => setSweep({ direction: v })}
          />
          <SliderControl
            label={t("style_panel.glowWidth")}
            value={sweep.glowWidth}
            min={0}
            max={20}
            step={0.5}
            display={`${sweep.glowWidth}px`}
            onChange={(v) => setSweep({ glowWidth: v })}
          />
          <SliderControl
            label={t("style_panel.gradientWidth")}
            value={sweep.gradientWidth}
            min={0}
            max={1}
            step={0.05}
            display={sweep.gradientWidth.toFixed(2)}
            onChange={(v) => setSweep({ gradientWidth: v })}
          />
          <SelectControl
            label={t("style_panel.easing")}
            value={sweep.easing}
            options={easingOptions}
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
  { value: "text" as const, labelKey: "style_panel.widthModeText" },
  { value: "line" as const, labelKey: "style_panel.widthModeLine" },
  { value: "full" as const, labelKey: "style_panel.widthModeFull" },
];

export function BackgroundBarControls() {
  const { t } = useTranslation();
  const bgBar = useStore((s) => s.backgroundBar);
  const setBgBar = useStore((s) => s.setBackgroundBar);

  const widthModeOptions = WIDTH_MODE_OPTIONS.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey),
  }));

  return (
    <div className="space-y-3">
      <ToggleControl
        label={t("style_panel.enabled")}
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
            label={t("style_panel.padding")}
            value={bgBar.padding}
            min={0}
            max={50}
            step={1}
            display={`${bgBar.padding}px`}
            onChange={(v) => setBgBar({ padding: v })}
          />
          <SliderControl
            label={t("style_panel.borderRadius")}
            value={bgBar.borderRadius}
            min={0}
            max={30}
            step={1}
            display={`${bgBar.borderRadius}px`}
            onChange={(v) => setBgBar({ borderRadius: v })}
          />
          <SliderControl
            label={t("style_panel.opacity")}
            value={bgBar.opacity}
            min={0}
            max={1}
            step={0.05}
            display={bgBar.opacity.toFixed(2)}
            onChange={(v) => setBgBar({ opacity: v })}
          />
          <ButtonGroup
            label={t("style_panel.widthMode")}
            value={bgBar.widthMode}
            options={widthModeOptions}
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
  { value: "left" as const, labelKey: "style_panel.alignLeft" },
  { value: "center" as const, labelKey: "style_panel.alignCenter" },
  { value: "right" as const, labelKey: "style_panel.alignRight" },
];

export function LayoutControls() {
  const { t } = useTranslation();
  const layout = useStore((s) => s.layout);
  const setLayout = useStore((s) => s.setLayout);

  const alignmentOptions = ALIGNMENT_OPTIONS.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey),
  }));

  return (
    <div className="space-y-3">
      <ButtonGroup
        label={t("style_panel.alignment")}
        value={layout.alignment}
        options={alignmentOptions}
        onChange={(v) => setLayout({ alignment: v })}
      />
      <SliderControl
        label={t("style_panel.verticalPosition")}
        value={layout.verticalPosition}
        min={0}
        max={100}
        step={1}
        display={`${layout.verticalPosition}%`}
        onChange={(v) => setLayout({ verticalPosition: v })}
      />
      <ToggleControl
        label={t("style_panel.dualLine")}
        value={layout.dualLine}
        onChange={(v) => setLayout({ dualLine: v })}
      />
      {layout.dualLine && (
        <>
          <SliderControl
            label={t("style_panel.lineGap")}
            value={layout.lineGap}
            min={0}
            max={60}
            step={1}
            display={`${layout.lineGap}px`}
            onChange={(v) => setLayout({ lineGap: v })}
          />
          <SliderControl
            label={t("style_panel.currentLineScale")}
            value={layout.currentLineScale}
            min={0.5}
            max={2.0}
            step={0.05}
            display={layout.currentLineScale.toFixed(2)}
            onChange={(v) => setLayout({ currentLineScale: v })}
          />
          <SliderControl
            label={t("style_panel.nextLineScale")}
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
