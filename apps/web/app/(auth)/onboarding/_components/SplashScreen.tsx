"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import { Icon, type IconName } from "@/shared/ui/Icon";
import { Wordmark } from "@/shared/ui/Wordmark";

const STEPS: { icon: IconName; tint: string; title: string; copy: string }[] = [
  {
    icon: "shopping-bag",
    tint: "text-cta-green",
    title: "1. Shop",
    copy: "Buy favorite brands at any dispensary",
  },
  {
    icon: "camera",
    tint: "text-teal",
    title: "2. Upload",
    copy: "Snap paper or digital receipt",
  },
  {
    icon: "shield-check",
    tint: "text-claire",
    title: "3. Verify",
    copy: "Instant AI clearinghouse match",
  },
  {
    icon: "coins",
    tint: "text-gold",
    title: "4. Get Paid",
    copy: "Direct cash to bank or wallet",
  },
];

/** The first thing a new person sees. "Get Started" reveals the age gate. */
export function SplashScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-y-auto bg-slate-page px-5 py-6 text-navy md:min-h-full">
      <Wordmark className="mb-4 mt-6" />

      <div className="z-10 my-auto mx-auto flex w-full max-w-md flex-col items-center py-4 text-center">
        <p className="mt-2 max-w-xs text-xs font-medium leading-relaxed text-slate">
          Direct CPG manufacturer cash rebates. Earn real dollars on legal dispensary purchases.
        </p>

        <div className="mt-10 w-full">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="h-px flex-1 bg-border-light" />
            <span className="px-2 text-[10px] font-extrabold uppercase tracking-widest text-slate">
              How It Works
            </span>
            <span className="h-px flex-1 bg-border-light" />
          </div>

          <div className="grid w-full grid-cols-2 gap-2.5">
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="flex flex-col rounded-2xl border border-border-light bg-white p-3.5 text-left shadow-sm transition hover:border-slate/40"
              >
                <div className="mb-2 flex w-full items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border-light bg-slate-page">
                    <Icon name={step.icon} className={`h-7 w-7 ${step.tint}`} />
                  </div>
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-tight text-navy">
                  {step.title}
                </h3>
                <p className="mt-1 text-[11px] font-medium leading-snug text-slate">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="z-10 mx-auto flex w-full max-w-md flex-col items-center pt-2">
        <div className="w-full">
          <Button type="button" onClick={onStart}>
            Get Started
          </Button>
        </div>
        <p className="mt-3 text-center text-xs font-semibold text-slate">
          Already have an account?
          <Link
            href="/login"
            className="ml-1 font-extrabold text-teal underline transition hover:text-navy"
          >
            Log In
          </Link>
        </p>
        <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-wider text-slate">
          21+ Only • Compliant CPG Rebate Clearinghouse
        </p>
      </div>
    </section>
  );
}
