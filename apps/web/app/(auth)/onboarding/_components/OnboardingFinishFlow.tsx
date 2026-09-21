"use client";

import Link from "next/link";
import { useState } from "react";
import { usePwaInstall } from "@/shared/hooks/usePwaInstall";
import { Button } from "@/shared/ui/Button";
import { Icon } from "@/shared/ui/Icon";
import { SetupShell } from "./SetupShell";

export function OnboardingFinishFlow({ firstName }: { firstName: string }) {
  const [step, setStep] = useState<5 | 6>(5);
  const [pushPromptOpen, setPushPromptOpen] = useState(false);
  const { installed, promptInstall } = usePwaInstall();

  async function enableNotificationsAndContinue() {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }

    await promptInstall();
    setPushPromptOpen(false);
    setStep(6);
  }

  if (step === 6) {
    return (
      <SetupShell step={6} totalSteps={6}>
        <WalletPassScreen firstName={firstName} />
      </SetupShell>
    );
  }

  return (
    <SetupShell step={5} totalSteps={6}>
      <div className="w-full space-y-4 text-center">
      <div className="relative mx-auto flex h-12 w-12 items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal/20 bg-teal-tint">
          <Icon name="smartphone" className="h-6 w-6 text-teal" />
        </div>
        <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 shadow-sm">
          <Icon name="sparkles" className="h-3.5 w-3.5 text-gold" />
        </div>
      </div>

      <div>
        <h3 className="text-base font-extrabold uppercase tracking-tight text-navy md:text-lg">
          Greenback App
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-slate md:text-sm">
          Launch this app instantly from your phone&apos;s home screen for fast receipt scanning &amp;
          alerts.
        </p>
      </div>

      <div className="space-y-2 pt-1">
        <Button type="button" className="py-3.5" onClick={() => setPushPromptOpen(true)}>
          <Icon name="download" className="h-4 w-4 text-navy" />
          <span className="font-extrabold uppercase">
            {installed ? "App Installed" : "Install Greenback App"}
          </span>
        </Button>
        <button
          type="button"
          onClick={() => setStep(6)}
          className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-extrabold text-teal transition hover:text-navy"
        >
          <span>Skip the Installation &amp; Continue</span>
          <Icon name="arrow-right" className="h-3.5 w-3.5" />
        </button>
      </div>
      </div>
      {pushPromptOpen && (
        <PushNotificationPrompt
          onEnable={() => void enableNotificationsAndContinue()}
          onSkip={() => {
            setPushPromptOpen(false);
            setStep(6);
          }}
        />
      )}
    </SetupShell>
  );
}

function PushNotificationPrompt({
  onEnable,
  onSkip,
}: {
  onEnable: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[400px] rounded-b-2xl border border-cta-green bg-[#101626] p-4 text-white shadow-2xl">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cta-green/40 bg-cta-green/20 text-cta-green">
              <Icon name="bell" className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-ping rounded-full bg-cta-green" />
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-xs font-extrabold leading-tight text-white">
                Enable Push Notifications
              </h4>
              <p className="text-[10px] text-slate-300">Instant Rebate &amp; Cash Alerts</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-cta-green/40 bg-cta-green/20 px-2 py-0.5 text-[9px] font-extrabold uppercase text-cta-green">
            Action Required
          </span>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-slate-300">
          Enable notifications to get real-time lockscreen alerts when your dispensary receipts
          are verified &amp; rebates land in your balance.
        </p>

        <div className="flex items-center gap-2 pt-3">
          <Button type="button" className="flex-1 py-3 text-xs" onClick={onEnable}>
            <Icon name="bell" className="h-4 w-4 text-navy" />
            <span className="font-extrabold uppercase">Enable Notifications</span>
          </Button>
          <button
            type="button"
            onClick={onSkip}
            className="shrink-0 cursor-pointer rounded-xl bg-slate-800 px-3 py-3 text-xs font-bold text-slate-300 transition hover:bg-slate-700"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

function WalletPassScreen({ firstName }: { firstName: string }) {
  return (
    <div className="w-full space-y-4 text-center">
      <div className="relative mx-auto flex h-12 w-12 items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal/20 bg-teal-tint">
          <Icon name="wallet" className="h-6 w-6 text-teal" />
        </div>
        <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 shadow-sm">
          <Icon name="sparkles" className="h-3.5 w-3.5 text-gold" />
        </div>
      </div>

      <div>
        <h3 className="text-base font-extrabold uppercase tracking-tight text-navy md:text-lg">
          Save Digital Pass
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-slate md:text-sm">
          Loyalty profile ready for {firstName}. Save Greenback Cash to your device to complete your
          setup.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-700/80 bg-gradient-to-br from-navy-hero to-navy p-4 text-left text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-teal/30 bg-teal-tint/20 text-teal">
              <Icon name="shield-check" className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wide text-white">
                Greenback Loyalty Pass
              </h4>
              <p className="text-[9.5px] font-medium text-slate-300">Synced with Wallet</p>
            </div>
          </div>
          <span className="rounded-full border border-cta-green/30 bg-cta-green/20 px-2 py-0.5 text-[9px] font-extrabold uppercase text-cta-green">
            +$5.00 Bonus
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-3">
          <div>
            <span className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
              Passholder
            </span>
            <span className="text-xs font-extrabold text-white">{firstName} Henderson</span>
          </div>
          <div className="text-right">
            <span className="block text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
              Pass ID
            </span>
            <span className="font-mono text-xs font-bold text-teal">GB-60601-CLAIRE</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <Link href="/home?welcome=1" className="btn-3d py-3.5">
          <span className="relative z-10 flex items-center gap-2 font-extrabold uppercase text-navy">
            <Icon name="wallet" className="h-4 w-4 text-navy" />
            Add to Wallet
          </span>
        </Link>
        <Link
          href="/home?welcome=1"
          className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-extrabold text-teal transition hover:text-navy"
        >
          <span>Skip Wallet &amp; Launch App</span>
          <Icon name="arrow-right" className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
