import React, { useId } from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  hint?: string;
  onChange: (v: number) => void;
}

/** Native range input: the value updates continuously while dragging. */
export const Slider: React.FC<SliderProps> = ({ label, value, min, max, step, display, hint, onChange }) => {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="tf-slider">
      <div className="tf-slider-top">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{display}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ '--fill': `${pct}%` } as React.CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint && <p className="tf-hint">{hint}</p>}
    </div>
  );
};

interface SegmentedProps<T extends string> {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}

export function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  const index = options.findIndex((o) => o.value === value);
  return (
    <div
      className="tf-seg"
      role="radiogroup"
      aria-label={label}
      style={{ '--count': options.length, '--index': index } as React.CSSProperties}
    >
      <span className="tf-seg-thumb" aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          className="tf-seg-btn"
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function fmt(x: number, digits = 1): string {
  return Number.isFinite(x) ? x.toFixed(digits) : '–';
}

export function pct(x: number, digits = 0): string {
  return Number.isFinite(x) ? `${(x * 100).toFixed(digits)}%` : '–';
}

export function signed(x: number, digits = 1): string {
  if (!Number.isFinite(x)) return '–';
  const r = Number(x.toFixed(digits));
  return `${r > 0 ? '+' : ''}${r.toFixed(digits)}`;
}
