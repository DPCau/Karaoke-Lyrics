import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// SliderControl
// ---------------------------------------------------------------------------

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display?: string;
  onChange: (value: number) => void;
}

export function SliderControl({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: SliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
          {label}
        </label>
        {display !== undefined && (
          <span className="text-[10px] font-mono text-gray-400">{display}</span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 appearance-none bg-surface-3 rounded-full outline-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-3
                   [&::-webkit-slider-thumb]:h-3
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-accent
                   [&::-webkit-slider-thumb]:shadow-md"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ToggleControl
// ---------------------------------------------------------------------------

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleControl({ label, value, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
        {label}
      </span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-8 h-4 rounded-full transition-colors ${
          value ? "bg-accent" : "bg-surface-3"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
            value ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SelectControl
// ---------------------------------------------------------------------------

interface SelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function SelectControl({
  label,
  value,
  options,
  onChange,
}: SelectProps) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-surface-2 border border-surface-3 rounded px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-accent/50 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ButtonGroup
// ---------------------------------------------------------------------------

interface ButtonGroupProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

export function ButtonGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: ButtonGroupProps<T>) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">
        {label}
      </label>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 px-2 py-1 text-[11px] rounded transition-colors ${
              value === opt.value
                ? "bg-accent text-white"
                : "bg-surface-2 text-gray-400 hover:text-gray-200 hover:bg-surface-3"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NumberInput
// ---------------------------------------------------------------------------

interface NumberInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

export function NumberInput({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: NumberInputProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium flex-1">
        {label}
      </span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16 bg-surface-2 border border-surface-3 rounded px-2 py-1 text-xs text-gray-200 font-mono text-right focus:outline-none focus:border-accent/50"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SectionDivider
// ---------------------------------------------------------------------------

export function SectionDivider() {
  return <div className="border-t border-surface-3 my-2" />;
}

// ---------------------------------------------------------------------------
// InlineLabel
// ---------------------------------------------------------------------------

interface InlineLabelProps {
  label: string;
  children: ReactNode;
}

export function InlineLabel({ label, children }: InlineLabelProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium w-16 flex-shrink-0">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
