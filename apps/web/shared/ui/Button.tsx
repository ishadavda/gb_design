import type { ButtonHTMLAttributes } from "react";

/**
 * A primitive. Props in, markup out - no data fetching, no business rules, no
 * knowledge of any domain. That is what makes it reusable across routes.
 *
 * Note: no "use client". A component only needs that directive if it uses hooks
 * or handlers itself. This one just forwards props, so it can render inside a
 * Server Component OR a client one.
 *
 * The look is `.btn-3d` from globals.css. The inner span is not decoration: the
 * button's ::after gloss is painted over the content, so the label needs its own
 * stacking context to stay above it.
 */
export function Button({
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`btn-3d ${className}`}>
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}
