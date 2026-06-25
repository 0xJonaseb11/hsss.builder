type Step = {
  label: string;
  status: "done" | "current" | "upcoming";
};

export function OnboardingProgress({ steps }: { steps: Step[] }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((step, index) => (
        <li key={step.label} className="flex flex-1 items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                step.status === "done"
                  ? "bg-emerald-100 text-emerald-800"
                  : step.status === "current"
                    ? "bg-cyan/20 text-navy ring-2 ring-cyan"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {step.status === "done" ? (
                <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" aria-hidden>
                  <path
                    d="M2 6l2.5 2.5L10 3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </span>
            <span
              className={`truncate text-center text-xs font-medium ${
                step.status === "current" ? "text-navy" : "text-slate-500"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <span
              className={`mb-5 h-px flex-1 ${
                step.status === "done" ? "bg-emerald-200" : "bg-slate-200"
              }`}
              aria-hidden
            />
          )}
        </li>
      ))}
    </ol>
  );
}
