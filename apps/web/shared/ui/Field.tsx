import type { InputHTMLAttributes, ReactNode } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  hint?: string;
  /** Rendered inside the input box, e.g. the "+1" dial prefix on the phone step. */
  prefix?: string;
}

/** Label + input + hint. A primitive: no domain knowledge, no fetching. */
export function Field({ label, hint, prefix, id, className = "", ...props }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[11px] font-bold uppercase tracking-wider text-slate"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          {...props}
          className={`w-full rounded-xl border border-border-light bg-white py-3.5 text-sm font-semibold text-navy transition focus:border-cta-green focus:outline-none ${
            prefix ? "pl-9 pr-4" : "px-4"
          } ${className}`}
        />
        {prefix && (
          <span className="absolute left-3.5 top-3.5 text-sm font-bold text-slate">{prefix}</span>
        )}
      </div>

      {hint && <p className="text-[10.5px] font-medium text-slate">{hint}</p>}
    </div>
  );
}
