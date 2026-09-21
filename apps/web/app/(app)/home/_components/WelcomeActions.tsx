"use client";

import { useState } from "react";
import { usePwaInstall } from "@/shared/hooks/usePwaInstall";
import { Icon } from "@/shared/ui/Icon";

export function WelcomeActions() {
  const [showAppCard, setShowAppCard] = useState(true);
  const [showPassCard, setShowPassCard] = useState(true);
  const [showInstallNotice, setShowInstallNotice] = useState(false);
  const [showWalletSheet, setShowWalletSheet] = useState(false);
  const { canInstall, promptInstall } = usePwaInstall();

  async function openInstallPrompt() {
    if (canInstall) {
      await promptInstall();
      return;
    }

    setShowInstallNotice(true);
  }

  if (!showAppCard && !showPassCard) return null;

  return (
    <div className="space-y-2 px-3.5 pt-3">
      {showAppCard && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => void openInstallPrompt()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") void openInstallPrompt();
          }}
          className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-teal bg-white px-3 py-2.5"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-tint">
            <Icon name="smartphone" className="h-5 w-5 text-teal" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[11px] font-extrabold text-navy">Greenback App</p>
            <p className="flex items-center gap-1 text-[10px] font-extrabold text-teal">
              <Icon name="download" className="h-3 w-3" /> Add to Home Screen
            </p>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowAppCard(false);
            }}
            aria-label="Dismiss app install prompt"
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-teal text-teal"
          >
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
      )}

      {showPassCard && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowWalletSheet(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") setShowWalletSheet(true);
          }}
          className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-teal bg-white px-3 py-2.5"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-tint">
            <Icon name="wallet" className="h-5 w-5 text-teal" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[11px] font-extrabold text-navy">Digital Pass</p>
            <p className="flex items-center gap-1 text-[10px] font-extrabold text-teal">
              <Icon name="plus" className="h-3 w-3" /> Add to Wallet
            </p>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowPassCard(false);
            }}
            aria-label="Dismiss digital pass prompt"
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-teal text-teal"
          >
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
      )}

      {showInstallNotice && (
        <div className="fixed inset-x-4 top-4 z-50 mx-auto flex max-w-sm items-start gap-2 rounded-2xl border border-emerald-500 bg-white px-3 py-3 text-left shadow-xl">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-500 text-emerald-600">
            <Icon name="check" className="h-4 w-4" />
          </div>
          <p className="flex-1 text-xs font-semibold leading-snug text-navy">
            PWA Ready! Use browser menu &rarr; &quot;Add to Home Screen&quot;.
          </p>
          <button
            type="button"
            onClick={() => setShowInstallNotice(false)}
            aria-label="Close install notice"
            className="text-slate"
          >
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
      )}

      {showWalletSheet && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm"
          onClick={() => setShowWalletSheet(false)}
        >
          <div
            className="rounded-t-[28px] bg-navy-hero p-5 text-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-tint text-teal">
                  <Icon name="wallet" className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold">Save Loyalty Pass to Wallet</h3>
                  <p className="text-[10px] text-slate-400">Choose your mobile wallet platform</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWalletSheet(false)}
                aria-label="Close wallet options"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 text-slate-300"
              >
                <Icon name="x" className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowWalletSheet(false)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-600 bg-black px-4 py-3 text-left"
              >
                <span className="flex items-center gap-3">
                  <Icon name="wallet" className="h-5 w-5 text-white" />
                  <span>
                    <strong className="block text-xs">Add to Apple Wallet</strong>
                    <small className="block text-[10px] text-slate-400">iOS Passbook (.pkpass)</small>
                  </span>
                </span>
                <Icon name="arrow-right" className="h-4 w-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setShowWalletSheet(false)}
                className="flex w-full items-center justify-between rounded-xl border border-teal/60 bg-slate-800 px-4 py-3 text-left"
              >
                <span className="flex items-center gap-3">
                  <Icon name="wallet" className="h-5 w-5 text-teal" />
                  <span>
                    <strong className="block text-xs">Save to Google Wallet</strong>
                    <small className="block text-[10px] text-slate-400">Android Google Pay Pass</small>
                  </span>
                </span>
                <Icon name="arrow-right" className="h-4 w-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setShowWalletSheet(false)}
                className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-extrabold text-blue-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
