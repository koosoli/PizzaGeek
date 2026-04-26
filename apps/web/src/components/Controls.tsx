import { type ChangeEvent, type ReactNode, useId } from "react";

export interface FieldSliderProps {
  min: number;
  max: number;
  step?: number;
  mobileOnly?: boolean;
}

interface FieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  slider?: FieldSliderProps;
}

function formatSliderMark(value: number, suffix?: string) {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}${suffix ?? ""}`;
}

export function Field({ label, value, onChange, suffix, min, max, step = 1, hint, slider }: FieldProps) {
  const inputId = useId();
  const hintId = hint ? `${inputId}-hint` : undefined;
  const sliderValue =
    typeof value === "number" ? value : value === "" ? slider?.min : Number.parseFloat(value);

  return (
    <div className={`field ${slider ? "fieldWithSlider" : ""}`}>
      <label className="fieldLabel" htmlFor={inputId}>
        {label}
      </label>
      {slider && Number.isFinite(sliderValue) ? (
        <div className={`fieldSliderWrap ${slider.mobileOnly ? "mobileOnly" : ""}`}>
          <input
            className="fieldSlider"
            type="range"
            min={slider.min}
            max={slider.max}
            step={slider.step ?? step}
            value={sliderValue}
            aria-label={label}
            onChange={(event) => onChange(event.target.value)}
          />
          <div className="fieldSliderScale" aria-hidden="true">
            <span>{formatSliderMark(slider.min, suffix)}</span>
            <span>{formatSliderMark(slider.max, suffix)}</span>
          </div>
        </div>
      ) : null}
      <div className="inputWrap">
        <input
          id={inputId}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          aria-describedby={hintId}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix ? <em>{suffix}</em> : null}
      </div>
      {hint ? (
        <small className="fieldHint" id={hintId}>
          {hint}
        </small>
      ) : null}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}

export function SelectField({ label, value, onChange, children }: SelectFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

interface ToggleProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
  hint?: string;
}

export function Toggle({ checked, label, hint, onChange }: ToggleProps) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>
        <strong>{label}</strong>
        {hint ? <small>{hint}</small> : null}
      </span>
    </label>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  label?: string;
}

export function Segmented<T extends string>({ value, options, onChange, label }: SegmentedProps<T>) {
  return (
    <div className="segmentedGroup">
      {label ? <span className="eyebrow">{label}</span> : null}
      <div className="segmented">
        {options.map((option) => (
          <button
            className={option.value === value ? "active" : ""}
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
