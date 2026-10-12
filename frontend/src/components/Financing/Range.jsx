import React from "react";

export default function Range({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  display: shown,
  hint,
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-[#2d2d2d]">
          {label}
        </label>
        <span className="text-sm font-semibold tabular-nums text-[#2d2d2d]">
          {shown}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#d8d0c1] accent-[#363636] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#363636]"
      />
      {hint && <p className="mt-1 text-xs text-[#6b6a68]">{hint}</p>}
    </div>
  );
}