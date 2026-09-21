"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { Icon } from "@/shared/ui/Icon";

const CONFETTI_COLORS = [
  "#4CAF50",
  "#2E7D32",
  "#CEF646",
  "#FFC53D",
  "#00B4D8",
  "#8BC34A",
  "#FFFFFF",
];

const PARTICLE_COUNT = 30;

interface Particle {
  style: CSSProperties;
}

/**
 * Burst geometry, straight from the approved screen: particles fan out on a
 * circle with jittered angle, distance and spin.
 *
 * Built in an effect rather than during render because it is random - running it
 * on the server would produce one layout, the client another, and React would
 * report a hydration mismatch.
 */
function createParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    const angle = (Math.PI * 2 * index) / PARTICLE_COUNT + (Math.random() * 0.4 - 0.2);
    const distance = 80 + Math.random() * 150;
    const size = 5 + Math.random() * 6;

    return {
      style: {
        "--tx": `${Math.cos(angle) * distance}px`,
        "--ty": `${-(40 + Math.random() * 130)}px`,
        "--tr": `${Math.random() * 720 - 360}deg`,
        backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        width: `${size}px`,
        height: `${size * (Math.random() > 0.5 ? 1.5 : 1)}px`,
        left: "50%",
        top: "25%",
        animationDelay: `${Math.random() * 0.2}s`,
      } as CSSProperties,
    };
  });
}

/** The sheet that slides up when onboarding is finished. */
export function CompletionCelebration({ firstName }: { firstName: string }) {
  const [open, setOpen] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setParticles(createParticles());

    const reveal = window.setTimeout(() => setOpen(true), 150);
    const fill = window.setTimeout(() => setProgress(100), 250);

    return () => {
      window.clearTimeout(reveal);
      window.clearTimeout(fill);
    };
  }, []);

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md transition-all duration-300 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="w-full flex-1" />

      <div
        className={`relative flex max-h-[92%] w-full transform flex-col overflow-y-auto rounded-t-[32px] border-t border-slate-700/80 bg-[#101626] p-5 text-center text-white shadow-2xl transition-transform duration-500 no-scrollbar ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-slate-700" />

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {particles.map((particle, index) => (
            <div key={index} className="confetti-piece" style={particle.style} />
          ))}
        </div>

        <div className="relative mx-auto mb-3 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#4CAF50]/30" />
          <div className="animate-check-spring relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#CEF646] bg-gradient-to-tr from-[#2E7D32] to-[#4CAF50] shadow-[0_0_30px_rgba(76,175,80,0.65)]">
            <Icon name="check" className="h-9 w-9 text-white" strokeWidth={3} />
          </div>
        </div>

        <div className="mb-4 space-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#4CAF50]/35 bg-[#4CAF50]/15 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#CEF646]">
            <Icon name="sparkles" className="h-3.5 w-3.5 text-[#CEF646]" /> All 5 Steps Verified
          </span>
          <h3 className="pt-1 text-xl font-black uppercase tracking-tight text-white md:text-2xl">
            Onboarding Complete!
          </h3>
          <p className="text-xs font-medium text-slate-300">
            Welcome, <span className="font-extrabold text-lime">{firstName}</span>! Your Greenback
            Cash account is now active.
          </p>
        </div>

        <div className="mb-4 space-y-3 rounded-2xl border border-slate-700/80 bg-[#0B1120] p-4 text-left shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-tint">
                <Icon name="wallet" className="h-5 w-5 text-teal" />
              </div>
              <div>
                <span className="block text-xs font-extrabold uppercase text-white">
                  Apple Wallet Pass
                </span>
                <span className="block text-[10.5px] font-medium text-slate-400">
                  Provisioned &amp; Ready
                </span>
              </div>
            </div>
            <span className="rounded-md border border-[#CEF646]/30 bg-[#CEF646]/10 px-2 py-0.5 text-xs font-extrabold text-[#CEF646]">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-2.5">
            <div>
              <span className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400">
                Welcome Rebate Credit
              </span>
              <span className="text-[11px] font-semibold text-slate-300">
                Credited to available ledger
              </span>
            </div>
            <span className="font-mono text-xl font-black text-[#CEF646] drop-shadow-[0_0_10px_rgba(206,246,70,0.5)]">
              +$5.00
            </span>
          </div>
        </div>

        <div className="mb-4 space-y-1.5">
          <div className="flex items-center justify-between text-[10.5px] font-medium text-slate-400">
            <span>Launching Greenback Cash...</span>
            <span className="font-extrabold text-lime">Ready</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-teal to-[#CEF646] transition-[width] duration-[2500ms] ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Link href="/home" className="btn-3d py-3.5">
          <span className="relative z-10 flex items-center gap-2 font-extrabold uppercase text-navy">
            <span>Enter App Now</span>
            <Icon name="arrow-right" className="h-4 w-4 text-navy" />
          </span>
        </Link>
      </div>
    </div>
  );
}
