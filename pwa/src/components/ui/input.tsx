import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ label, id, className = "", ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-1 block text-sm font-medium text-slate-600">
        {label}
      </span>
      <input
        id={inputId}
        className={`w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan focus:ring-1 focus:ring-cyan ${className}`}
        {...props}
      />
    </label>
  );
}
