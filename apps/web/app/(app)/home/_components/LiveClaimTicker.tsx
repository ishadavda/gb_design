"use client";

import { useEffect, useState } from "react";
import { useProfile } from "../../_components/ProfileProvider";

/**
 * "Greenback deals for Claire", and beside it the card of someone who just got
 * paid, changing every few seconds.
 *
 * Social proof, and the copy is the prototype's - six claims cycling on a 3.2s
 * timer with a fade through on each change. The list is content rather than
 * domain data: nobody queries it, and when it becomes a real feed it will arrive
 * as props from the page instead.
 */
const CLAIMS = [
  {
    name: "Marcus T.",
    initials: "MT",
    amount: "$5.00",
    review: "Got $5 back instantly!",
    avatar: "bg-[#101626]",
  },
  {
    name: "Sarah K.",
    initials: "SK",
    amount: "$5.00",
    review: "Scanned receipt, $5 credited!",
    avatar: "bg-[#1E2A45]",
  },
  {
    name: "Alex M.",
    initials: "AM",
    amount: "$5.00",
    review: "Verified in 30 seconds!",
    avatar: "bg-slate-800",
  },
  {
    name: "Elena R.",
    initials: "ER",
    amount: "$5.00",
    review: "Earned $5 on first purchase!",
    avatar: "bg-[#0A2540]",
  },
  {
    name: "Jordan P.",
    initials: "JP",
    amount: "$5.00",
    review: "Legit clearinghouse escrow!",
    avatar: "bg-[#101626]",
  },
  {
    name: "David L.",
    initials: "DL",
    amount: "$5.00",
    review: "Saved $5 on my favorite brand!",
    avatar: "bg-[#1E2A45]",
  },
];

const ROTATE_MS = 3200;
const FADE_MS = 260;

export function LiveClaimTicker() {
  const { firstName } = useProfile();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const rotate = window.setInterval(() => {
      setVisible(false);

      window.setTimeout(() => {
        setIndex((current) => (current + 1) % CLAIMS.length);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);

    return () => window.clearInterval(rotate);
  }, []);

  const claim = CLAIMS[index]!;

  return (
    <div className="relative mx-3.5 mt-3.5 flex flex-col gap-2.5 overflow-hidden rounded-2xl border border-border-light bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="shrink-0">
          <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate">
            Greenback deals for
          </div>
          <div className="text-xl font-extrabold leading-tight text-claire">{firstName}</div>
        </div>

        <div className="flex min-w-0 flex-1 justify-end">
          <div
            className="flex w-full max-w-[210px] items-center gap-2 rounded-xl border border-border-light bg-slate-50 px-2.5 py-1.5 transition-all duration-300 hover:bg-slate-100"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(-3px)",
            }}
          >
            <div className="relative shrink-0">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border border-slate-700/60 text-[9.5px] font-black text-white ${claim.avatar}`}
              >
                {claim.initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full border border-white bg-cta-green text-[7px] font-black text-white">
                $
              </span>
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-[10px] font-extrabold text-navy">{claim.name}</span>
                <span className="shrink-0 rounded border border-[#C8E6C9] bg-[#E8F5E9] px-1.5 text-[9px] font-black text-cta-green">
                  +{claim.amount}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1 truncate text-[9px] font-medium text-slate">
                <span className="truncate">&quot;{claim.review}&quot;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
