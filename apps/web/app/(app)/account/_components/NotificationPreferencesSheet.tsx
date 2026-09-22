"use client";

import { useState } from "react";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { Icon } from "@/shared/ui/Icon";
import { useToast } from "@/shared/ui/Toast";

export function NotificationPreferencesSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const showToast = useToast();
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [optOutOpen, setOptOutOpen] = useState(false);

  function submit() {
    if (dontShowAgain) {
      setOptOutOpen(true);
      return;
    }

    showToast(
      smsEnabled ? "Notification preferences enabled" : "Notification preferences saved",
      "success",
    );
    onClose();
  }

  function closeSheet() {
    setOptOutOpen(false);
    onClose();
  }

  function confirmOptOut() {
    setSmsEnabled(false);
    setOptOutOpen(false);
    showToast("SMS text alerts opted out.", "success");
    onClose();
  }

  if (optOutOpen) {
    return <OptOutConfirmationSheet open onClose={() => setOptOutOpen(false)} onConfirm={confirmOptOut} />;
  }

  return (
    <BottomSheet
      open={open}
      onClose={closeSheet}
      panelClassName="max-h-[88%] overflow-y-auto no-scrollbar rounded-t-[28px] border-t border-slate-700/70 bg-[#101626] p-5 text-white"
    >
      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-700" />

      <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-teal/40 bg-teal/20 text-teal">
            <Icon name="bell" className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-extrabold leading-tight text-white">
              Notification Preferences
            </h3>
            <p className="text-[10px] font-medium text-slate-400">Rebate &amp; Cash Alerts</p>
          </div>
        </div>
        <button
          type="button"
          onClick={closeSheet}
          className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-slate-800 text-slate-400 transition hover:bg-slate-700 hover:text-white"
        >
          <Icon name="x" className="size-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>

      <p className="py-4 text-xs font-medium leading-relaxed text-slate-300">
        Enable alerts below to get real-time text notifications whenever high-value dispensary
        rebate drops land in your wallet.
      </p>

      <div className="space-y-3 rounded-2xl border border-slate-700 bg-[#0B1120] p-3.5">
        <ToggleRow
          checked={smsEnabled}
          onChange={() => setSmsEnabled((current) => !current)}
          title={
            <>
              Authorize localized <strong>SMS text messaging alerts</strong>
            </>
          }
          description="regarding high-value dispensary rebate drops."
          optional
        />
        <ToggleRow
          checked={emailEnabled}
          onChange={() => setEmailEnabled((current) => !current)}
          title="Send weekly cashout receipts logs and NACHA direct deposit confirmations."
          optional
        />
      </div>

      <button
        type="button"
        aria-pressed={dontShowAgain}
        onClick={() => setDontShowAgain((current) => !current)}
        className="mt-3 flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-slate-700 bg-[#1a2639] p-3 text-left text-xs font-extrabold text-slate-200"
      >
        <Checkbox checked={dontShowAgain} />
        Don't show this message again
      </button>

      <div className="flex gap-2.5 pt-4">
        <button type="button" onClick={submit} className="btn-3d flex-1 py-3 text-xs tracking-wide">
          <span className="relative z-10 font-extrabold uppercase">YES</span>
        </button>
        <button
          type="button"
          onClick={closeSheet}
          className="flex-1 cursor-pointer rounded-xl bg-[#1a2639] py-3 text-xs font-extrabold uppercase tracking-wide text-slate-300 transition hover:bg-slate-700"
        >
          CANCEL
        </button>
      </div>

    </BottomSheet>
  );
}

function OptOutConfirmationSheet({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      panelClassName="max-h-[80%] overflow-y-auto no-scrollbar rounded-t-[28px] border-t border-slate-700/70 bg-[#101626] p-5 text-white"
    >
      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-700" />

      <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-400/50 bg-amber-400/15 text-amber-300">
            <Icon name="alert-triangle" className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-extrabold leading-tight text-white">
              Are you sure you want to opt out?
            </h3>
            <p className="text-[10px] font-medium text-slate-400">Text Notification Opt-Out</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-slate-800 text-slate-400 transition hover:bg-slate-700 hover:text-white"
        >
          <Icon name="x" className="size-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>

      <p className="py-4 text-xs font-semibold leading-relaxed text-slate-200">
        By clicking Yes, you will stop receiving all text messages from us. This includes:
      </p>

      <div className="space-y-2">
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-700 bg-[#1a2639] p-3 text-xs font-semibold text-slate-200">
          <Icon name="tag" className="h-4 w-4 shrink-0 text-lime" />
          Exclusive offers and discount deals
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-700 bg-[#1a2639] p-3 text-xs font-semibold text-slate-200">
          <Icon name="clipboard-check" className="h-4 w-4 shrink-0 text-teal" />
          Ledger updates and tracking alerts
        </div>
      </div>

      <div className="flex gap-2.5 pt-4">
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 cursor-pointer rounded-xl bg-alert-red py-3 text-xs font-extrabold text-white transition hover:bg-red-700"
        >
          Yes! Stop Messages
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 cursor-pointer rounded-xl bg-[#202c42] py-3 text-xs font-extrabold uppercase tracking-wide text-slate-300 transition hover:bg-slate-700"
        >
          Cancel
        </button>
      </div>
    </BottomSheet>
  );
}

function ToggleRow({
  checked,
  onChange,
  title,
  description,
  optional = false,
}: {
  checked: boolean;
  onChange: () => void;
  title: React.ReactNode;
  description?: string;
  optional?: boolean;
}) {
  return (
    <button type="button" onClick={onChange} className="flex w-full items-start gap-2.5 text-left">
      <Checkbox checked={checked} />
      <span className="min-w-0 text-[10.5px] leading-snug text-slate-300">
        {title}
        {description && <> {description}</>}
        {optional && <span className="ml-1 text-slate-500">(Optional)</span>}
      </span>
    </button>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
        checked ? "border-[#2E7D32] bg-[#2E7D32] text-white" : "border-slate-300 bg-white text-transparent"
      }`}
    >
      <Icon name="check" className="h-3 w-3" />
    </span>
  );
}