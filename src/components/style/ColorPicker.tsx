import { useState, useCallback, useRef, useEffect } from "react";
import type { RGBA } from "../../types/style";
import {
  parseCssColor,
  rgbaToHex,
  rgbaToString,
  hexToRgba,
} from "../../utils/color";

// ---------------------------------------------------------------------------
// Preset colors
// ---------------------------------------------------------------------------

const PRESET_COLORS = [
  "#ffffff",
  "#e0e0e0",
  "#cccccc",
  "#aaaaaa",
  "#888888",
  "#666666",
  "#444444",
  "#222222",
  "#000000",
  "#ff0000",
  "#ff4444",
  "#ff8800",
  "#ffcc00",
  "#aaff00",
  "#44ff44",
  "#00ff88",
  "#00cccc",
  "#0088ff",
  "#3b82f6",
  "#6666ff",
  "#8844ff",
  "#bb44ff",
  "#ff44cc",
  "#ff4488",
  "#f472b6",
  "#22d3ee",
  "#a3e635",
  "#f97316",
  "#ef4444",
  "#ec4899",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function isHexColor(s: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s);
}

function hexToRgbaSafe(hex: string): RGBA {
  try {
    return hexToRgba(hex);
  } catch {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
}

// ---------------------------------------------------------------------------
// SliderRow — internal helper
// ---------------------------------------------------------------------------

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  display?: string;
  onChange: (value: number) => void;
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  display: customDisplay,
  onChange,
}: SliderRowProps) {
  const display = customDisplay ?? String(value);

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-gray-500 w-3 flex-shrink-0 text-center">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1 appearance-none bg-surface-3 rounded-full outline-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-md"
      />
      <span className="text-[10px] font-mono text-gray-500 w-7 text-right">
        {display}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ColorPicker — for string color values
// ---------------------------------------------------------------------------

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  compact?: boolean;
}

export function ColorPicker({
  value,
  onChange,
  compact = false,
}: ColorPickerProps) {
  const [rgba, setRgba] = useState<RGBA>(() => parseCssColor(value));
  const [hexInput, setHexInput] = useState(() => rgbaToHex(parseCssColor(value)));
  const [editingHex, setEditingHex] = useState(false);
  const hexRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRgba(parseCssColor(value));
    if (!editingHex) {
      setHexInput(rgbaToHex(parseCssColor(value)));
    }
  }, [value, editingHex]);

  const handleSliderChange = useCallback(
    (partial: Partial<RGBA>) => {
      const next = { ...rgba, ...partial };
      setRgba(next);
      setHexInput(rgbaToHex(next));
      setEditingHex(false);
      onChange(rgbaToString(next));
    },
    [rgba, onChange],
  );

  const handleHexInput = useCallback(
    (input: string) => {
      setHexInput(input);
      if (isHexColor(input)) {
        const parsed = hexToRgbaSafe(input);
        setRgba(parsed);
        onChange(input);
      }
    },
    [onChange],
  );

  const handleHexBlur = useCallback(() => {
    setEditingHex(false);
    if (!isHexColor(hexInput)) {
      setHexInput(rgbaToHex(rgba));
    }
  }, [hexInput, rgba]);

  const handlePresetClick = useCallback(
    (preset: string) => {
      const parsed = parseCssColor(preset);
      setRgba(parsed);
      setHexInput(rgbaToHex(parsed));
      setEditingHex(false);
      onChange(preset);
    },
    [onChange],
  );

  return (
    <div className="space-y-2">
      {/* Preview swatch + HEX input */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded border border-surface-3 flex-shrink-0"
          style={{ backgroundColor: rgbaToString(rgba) }}
        />
        <div className="flex-1">
          {editingHex ? (
            <input
              ref={hexRef}
              type="text"
              value={hexInput}
              onChange={(e) => handleHexInput(e.target.value)}
              onBlur={handleHexBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  (e.target as HTMLInputElement).blur();
                }
                if (e.key === "Escape") {
                  setHexInput(rgbaToHex(rgba));
                  setEditingHex(false);
                }
              }}
              autoFocus
              className="w-full bg-surface-2 border border-surface-3 rounded px-2 py-1 text-xs font-mono text-gray-200 focus:outline-none focus:border-accent/50"
              placeholder="#rrggbb"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditingHex(true);
                setTimeout(() => hexRef.current?.select(), 0);
              }}
              className="w-full text-left bg-surface-2 border border-surface-3 rounded px-2 py-1 text-xs font-mono text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
            >
              {hexInput}
            </button>
          )}
        </div>
      </div>

      {/* RGBA sliders */}
      <div className="space-y-1.5">
        <SliderRow
          label="R"
          value={Math.round(rgba.r)}
          min={0}
          max={255}
          onChange={(v) => handleSliderChange({ r: v })}
        />
        <SliderRow
          label="G"
          value={Math.round(rgba.g)}
          min={0}
          max={255}
          onChange={(v) => handleSliderChange({ g: v })}
        />
        <SliderRow
          label="B"
          value={Math.round(rgba.b)}
          min={0}
          max={255}
          onChange={(v) => handleSliderChange({ b: v })}
        />
        <SliderRow
          label="A"
          value={rgba.a}
          min={0}
          max={1}
          step={0.01}
          display={rgba.a.toFixed(2)}
          onChange={(v) => handleSliderChange({ a: v })}
        />
      </div>

      {/* Preset palette */}
      {!compact && (
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gray-600 font-medium mb-1">
            Presets
          </label>
          <div className="flex flex-wrap gap-1">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handlePresetClick(c)}
                title={c}
                className={`w-5 h-5 rounded border transition-transform hover:scale-125 ${
                  hexInput.toLowerCase() === c.toLowerCase()
                    ? "border-white ring-1 ring-accent"
                    : "border-surface-3"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ColorPickerRGBA — for RGBA object values (e.g. background)
// ---------------------------------------------------------------------------

interface ColorPickerRGBAProps {
  value: RGBA;
  onChange: (color: RGBA) => void;
  compact?: boolean;
}

export function ColorPickerRGBA({
  value,
  onChange,
  compact = false,
}: ColorPickerRGBAProps) {
  const [rgba, setRgba] = useState<RGBA>(value);
  const [hexInput, setHexInput] = useState(() => rgbaToHex(value));
  const [editingHex, setEditingHex] = useState(false);
  const hexRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRgba(value);
    if (!editingHex) {
      setHexInput(rgbaToHex(value));
    }
  }, [value, editingHex]);

  const handleSliderChange = useCallback(
    (partial: Partial<RGBA>) => {
      const next: RGBA = {
        r: clamp(partial.r ?? rgba.r, 0, 255),
        g: clamp(partial.g ?? rgba.g, 0, 255),
        b: clamp(partial.b ?? rgba.b, 0, 255),
        a: partial.a ?? rgba.a,
      };
      setRgba(next);
      setHexInput(rgbaToHex(next));
      setEditingHex(false);
      onChange(next);
    },
    [rgba, onChange],
  );

  const handleHexInput = useCallback(
    (input: string) => {
      setHexInput(input);
      if (isHexColor(input)) {
        const parsed = hexToRgbaSafe(input);
        setRgba(parsed);
        onChange(parsed);
      }
    },
    [onChange],
  );

  const handleHexBlur = useCallback(() => {
    setEditingHex(false);
    if (!isHexColor(hexInput)) {
      setHexInput(rgbaToHex(rgba));
    }
  }, [hexInput, rgba]);

  const handlePresetClick = useCallback(
    (preset: string) => {
      const parsed = hexToRgbaSafe(preset);
      setRgba(parsed);
      setHexInput(preset);
      setEditingHex(false);
      onChange(parsed);
    },
    [onChange],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded border border-surface-3 flex-shrink-0"
          style={{ backgroundColor: rgbaToString(rgba) }}
        />
        <div className="flex-1">
          {editingHex ? (
            <input
              ref={hexRef}
              type="text"
              value={hexInput}
              onChange={(e) => handleHexInput(e.target.value)}
              onBlur={handleHexBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") {
                  setHexInput(rgbaToHex(rgba));
                  setEditingHex(false);
                }
              }}
              autoFocus
              className="w-full bg-surface-2 border border-surface-3 rounded px-2 py-1 text-xs font-mono text-gray-200 focus:outline-none focus:border-accent/50"
              placeholder="#rrggbb"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditingHex(true);
                setTimeout(() => hexRef.current?.select(), 0);
              }}
              className="w-full text-left bg-surface-2 border border-surface-3 rounded px-2 py-1 text-xs font-mono text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
            >
              {hexInput}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <SliderRow
          label="R"
          value={Math.round(rgba.r)}
          min={0}
          max={255}
          onChange={(v) => handleSliderChange({ r: v })}
        />
        <SliderRow
          label="G"
          value={Math.round(rgba.g)}
          min={0}
          max={255}
          onChange={(v) => handleSliderChange({ g: v })}
        />
        <SliderRow
          label="B"
          value={Math.round(rgba.b)}
          min={0}
          max={255}
          onChange={(v) => handleSliderChange({ b: v })}
        />
        <SliderRow
          label="A"
          value={rgba.a}
          min={0}
          max={1}
          step={0.01}
          display={rgba.a.toFixed(2)}
          onChange={(v) => handleSliderChange({ a: v })}
        />
      </div>

      {!compact && (
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-gray-600 font-medium mb-1">
            Presets
          </label>
          <div className="flex flex-wrap gap-1">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handlePresetClick(c)}
                title={c}
                className={`w-5 h-5 rounded border transition-transform hover:scale-125 ${
                  hexInput.toLowerCase() === c.toLowerCase()
                    ? "border-white ring-1 ring-accent"
                    : "border-surface-3"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
