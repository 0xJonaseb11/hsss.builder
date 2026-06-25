import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  full?: boolean;
};

const variants = {
  primary:
    "bg-cyan text-navy-deep hover:bg-cyan/90 disabled:opacity-50",
  secondary:
    "bg-white text-navy border border-slate-200 hover:bg-slate-50 disabled:opacity-50",
  ghost: "bg-transparent text-cyan hover:bg-white/10 disabled:opacity-50",
};

export function Button({
  variant = "primary",
  full,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-md px-4 py-2.5 text-sm font-semibold transition ${variants[variant]} ${full ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
