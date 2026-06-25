type Step = {
  label: string;
  status: "done" | "current" | "upcoming";
};

export function OnboardingProgress({ steps }: { steps: Step[] }) {
  return (
    <ol className="flex w-full items-start gap-0">
      {steps.map((step, index) => (
        <li key={step.label} className="flex flex-1 items-start">
          <div className="flex w-full flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                step.status === "done"
                  ? "bg-emerald-100 text-emerald-800"
                  : step.status === "current"
                    ? "bg-cyan/20 text-navy ring-2 ring-cyan"
                    : "bg-white text-slate-400 ring-1 ring-slate-200"
              }`}
            >
              {step.status === "done" ? (
                <svg viewBox="0 0 12 12" className="h-4 w-4" aria-hidden>
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
              className={`text-center text-sm font-medium sm:text-left ${
                step.status === "current" ? "text-navy" : "text-slate-500"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <span
              className="mx-3 mt-5 hidden h-px flex-1 bg-slate-300 sm:block"
              aria-hidden
            />
          )}
        </li>
      ))}
    </ol>
  );
}
