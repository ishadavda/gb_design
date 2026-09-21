import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/shared/ui/Icon";

interface SetupShellProps {
  /** The current step, matching the dots in the footer. */
  step: number;
  /** Number of screens in the onboarding flow. */
  totalSteps?: number;
  /** Omitted on the first step, where there is nowhere to go back to. */
  backHref?: string;
  children: ReactNode;
}

/**
 * The registration frame: badge, title, the step's content, and the footer that
 * counts the dots.
 *
 * Props are primitives, so this renders inside a Server Component or a client
 * one. The prototype tracked the same state in a module-level `setupStep`
 * variable and rewrote the dots by hand; here the URL is the state and each page
 * says which step it is.
 */
export function SetupShell({ step, totalSteps = 6, backHref, children }: SetupShellProps) {
  return (
    <section className="relative flex w-full flex-1 flex-col items-center">
      <div className="relative flex h-full min-h-screen w-full flex-col justify-between bg-slate-page px-5 py-8 md:min-h-full">
        <div className="mx-auto w-full max-w-lg py-2 text-center">
          <div className="mb-2 inline-flex rounded-full bg-teal-tint px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-teal">
            New User Registration
          </div>
          <h2 className="text-xl font-extrabold uppercase tracking-tight text-navy md:text-2xl">
            Set Up Greenback Wallet
          </h2>
        </div>

        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center py-6">
          {children}
        </div>

        <div className="mx-auto mt-6 flex w-full max-w-lg items-center justify-between border-t border-border-light pt-4 text-[11px] font-bold text-slate">
          {backHref && (
            <Link href={backHref} className="inline-flex gap-2 text-navy">
              <Icon name="arrow-left" className="h-4 w-4" /> Back
            </Link>
          )}

          <span
            className={`flex-1 uppercase tracking-wider ${backHref ? "text-center" : "text-left"}`}
          >
            Step <span className="font-extrabold text-navy">{step}</span> of {totalSteps}
          </span>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, index) => (
              <span
                key={index}
                className={`h-2 w-2 rounded-full transition-all duration-200 ${
                  index < step ? "bg-cta-green" : "bg-border-light"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
