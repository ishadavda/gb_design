"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatUsd } from "@/shared/money";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { Icon } from "@/shared/ui/Icon";
import { useToast } from "@/shared/ui/Toast";
import { DEMO_PROFILE } from "../../_components/demoProfile";
import { PAYOUT_REFERENCE, useWallet } from "../../_components/WalletProvider";

/**
 * Cash out: confirm, watch the ACH steps, land on success or on a timeout.
 *
 * Four panels of one sheet, exactly as in the approved screens, with the
 * outcome chosen by the simulation switcher - there is no payout provider wired
 * up behind this yet, and pretending otherwise would hide which parts are real.
 *
 * The balance only moves on success. The error panel says "no funds debited" and
 * means it.
 */

type Step = "confirm" | "loading" | "success" | "error";
type Outcome = "success" | "error";

const BANK = `${DEMO_PROFILE.bank.name} (${DEMO_PROFILE.bank.mask})`;

export function PayoutSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const showToast = useToast();
  const wallet = useWallet();

  const [step, setStep] = useState<Step>("confirm");
  const [outcome, setOutcome] = useState<Outcome>("success");
  const [stage, setStage] = useState(1);
  /** The amount this run is sending, fixed when the user confirms. */
  const [amountCents, setAmountCents] = useState(0);

  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);

  const restart = useCallback(() => {
    clearTimers();
    setStep("confirm");
    setStage(1);
  }, [clearTimers]);

  useEffect(() => {
    if (open) restart();

    return clearTimers;
  }, [open, restart, clearTimers]);

  function start() {
    // Snapshot now: a successful payout empties the balance, and every panel
    // after this one still has to name the amount that was sent.
    const amount = wallet.availableCents;

    setAmountCents(amount);
    setStep("loading");
    setStage(1);

    timers.current.push(
      window.setTimeout(() => {
        setStage(2);

        timers.current.push(
          window.setTimeout(() => {
            if (outcome === "error") {
              setStep("error");
              showToast("ACH Transfer Failed: Clearinghouse network timeout.", "error");
              return;
            }

            wallet.queuePayout(amount);
            setStep("success");
            showToast(
              `💵 ${formatUsd(amount)} payout queued! Processing asynchronously.`,
              "success",
            );
          }, 1300),
        );
      }, 800),
    );
  }

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(PAYOUT_REFERENCE);
      showToast("Copied Reference ID!", "info");
    } catch {
      showToast(`Reference ID: ${PAYOUT_REFERENCE}`, "info");
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      panelClassName="max-h-[92%] overflow-y-auto no-scrollbar rounded-t-[28px] border-t border-slate-700/70 bg-[#101626] p-5 text-white"
    >
      {step === "confirm" && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-teal/40 bg-teal/20 text-teal">
                <Icon name="banknote" className="h-4 w-4" />
              </span>
              <h3 className="text-base font-extrabold text-white">Confirm Cash Out</h3>
            </div>
            <CloseButton onClick={onClose} />
          </div>

          <div className="rounded-2xl border border-slate-600/60 bg-[#252c3b] p-4 text-center shadow-inner">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
              Cash-Out Amount
            </span>
            <div className="mt-1 text-[34px] font-extrabold leading-tight text-white">
              {formatUsd(wallet.availableCents)}
            </div>
            <span className="mt-1 inline-flex items-center gap-1 text-[10.5px] font-bold text-lime">
              <Icon name="check-circle-2" className="h-3 w-3 text-lime" /> Full Available Balance
            </span>
          </div>

          <div className="space-y-0 rounded-xl border border-slate-700/70 bg-[#161F33] p-3.5 text-xs">
            <Row label="Transfer Method" value="Direct Deposit" bordered={false} />
            <Row label="Estimated Arrival" value="1–2 Business Days" />
            <Row label="Transfer Fee" value={<span className="text-cta-green">FREE ($0.00)</span>} />
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-teal/60 bg-[#0d3447] p-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal/20 text-teal">
              <Icon name="info" className="h-3.5 w-3.5" />
            </span>
            <div className="text-[11px] leading-relaxed text-slate-200">
              <span className="mb-0.5 block font-extrabold text-teal">
                Asynchronous Processing Notice
              </span>
              Payouts process asynchronously through the Federal Reserve ACH Clearinghouse. Once
              initiated, transfers enter automated batch queues and cannot be cancelled. You can
              track clearing progress in your Transaction Ledger.
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-600 bg-[#0B1120] p-2.5">
            <div className="min-w-0 flex-1">
              <div className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-300">
                SIMULATION OUTCOME
              </div>
              <div className="truncate text-[10.5px] text-slate-400">Select test scenario</div>
            </div>
            <select
              aria-label="Simulation outcome"
              value={outcome}
              onChange={(event) => setOutcome(event.target.value as Outcome)}
              className="shrink-0 cursor-pointer rounded-lg border border-slate-500 bg-[#252c3b] px-2.5 py-1.5 text-xs font-semibold text-white focus:border-cta-green focus:outline-none"
            >
              <option value="success">Success (Batch Queued)</option>
              <option value="error">Error (Gateway Timeout)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button type="button" onClick={start} className="btn-3d flex-1 py-3.5 text-xs tracking-wide">
              <Icon name="banknote" className="relative z-10 h-4 w-4 text-navy" />
              <span className="relative z-10 font-extrabold uppercase">Confirm &amp; Withdraw</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-xl bg-[#202c42] py-3 text-xs font-extrabold uppercase tracking-wider text-slate-300 transition hover:bg-slate-700"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {step === "loading" && (
        <div className="space-y-4 py-6 text-center">
          <div className="relative mx-auto flex size-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-b-transparent border-l-transparent border-r-teal border-t-cta-green" />
            <Icon name="landmark" className="size-6 text-cta-green" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-white">Processing Payout...</h4>
            <p className="mt-1 text-xs text-slate-400">
              {stage === 1
                ? "Validating ACH routing endpoints with Chase..."
                : "Encrypting NACHA payload & verifying account status..."}
            </p>
          </div>

          <div className="space-y-2.5 rounded-xl border border-slate-700/60 bg-[#161F33] p-3.5 text-left text-xs">
            <div className="flex items-center gap-2 font-semibold text-cta-green">
              <Icon name="check-circle-2" className="h-4 w-4 shrink-0 text-cta-green" />
              <span>Clearinghouse compliance verified</span>
            </div>

            {stage === 1 ? (
              <>
                <div className="flex items-center gap-2 font-semibold text-teal">
                  <Icon name="loader-2" className="h-4 w-4 shrink-0 animate-spin text-teal" />
                  <span>Encrypting NACHA direct deposit payload...</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-slate-500">
                  <Icon name="circle" className="h-4 w-4 shrink-0" />
                  <span>Dispatching asynchronous batch clearing job...</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 font-semibold text-cta-green">
                  <Icon name="check-circle-2" className="h-4 w-4 shrink-0 text-cta-green" />
                  <span>NACHA direct deposit payload encrypted</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-teal">
                  <Icon name="loader-2" className="h-4 w-4 shrink-0 animate-spin text-teal" />
                  <span>Dispatching asynchronous batch clearing job...</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cta-green/20 text-cta-green">
                <Icon name="check-circle-2" className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-base font-extrabold text-white">Transfer Initiated</h3>
            </div>
            <CloseButton onClick={onClose} />
          </div>

          <div className="flex flex-col items-center py-2 text-center">
            <div className="mb-2 flex size-14 animate-bounce items-center justify-center rounded-full border border-cta-green/50 bg-cta-green/20 text-cta-green shadow-[0_0_24px_rgba(40,199,111,0.35)]">
              <Icon name="check" className="size-8 stroke-[2.5]" />
            </div>
            <div className="mt-1 text-2xl font-extrabold leading-tight text-white">
              {formatUsd(amountCents)}
            </div>
            <p className="mt-0.5 text-xs font-medium text-slate-300">
              Direct Deposit Initiated to Chase ({DEMO_PROFILE.bank.mask})
            </p>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-teal/40 bg-teal/15 p-3.5">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal/20 text-teal">
              <Icon name="clock" className="h-4 w-4" />
            </span>
            <div className="text-left text-xs">
              <div className="mb-0.5 font-extrabold text-white">
                Your payout is processing asynchronously
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Your withdrawal of <strong>{formatUsd(amountCents)}</strong> has been queued for
                automated clearinghouse processing. Funds will arrive directly in your Chase Premier
                Checking account within <strong>1–2 business days</strong>.
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-slate-700/60 bg-[#161F33] p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-400">Reference Code</span>
              <span className="flex items-center gap-1.5 font-mono font-bold text-white">
                <span>#{PAYOUT_REFERENCE}</span>
                <button
                  type="button"
                  onClick={copyReference}
                  className="cursor-pointer text-teal hover:text-white"
                >
                  <Icon name="copy" className="h-3 w-3" />
                  <span className="sr-only">Copy reference</span>
                </button>
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-700/50 pt-1.5">
              <span className="font-medium text-slate-400">Batch Status</span>
              <span className="flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/20 px-2 py-0.5 text-[9.5px] font-extrabold text-amber-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                Asynchronous Batch Queued
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-700/50 pt-1.5">
              <span className="font-medium text-slate-400">Target Account</span>
              <span className="font-bold text-white">{BANK}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-700/50 pt-1.5">
              <span className="font-medium text-slate-400">Ledger Update</span>
              <span className="font-bold text-claire">Available: $0.00 (Debited)</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push("/home");
              }}
              className="flex-1 cursor-pointer rounded-xl bg-slate-800 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-300 transition hover:bg-slate-700"
            >
              HOME SCREEN
            </button>
            <button type="button" onClick={onClose} className="btn-3d flex-1 py-3 text-xs tracking-wide">
              <Icon name="receipt" className="relative z-10 h-4 w-4 text-navy" />
              <span className="relative z-10 font-extrabold uppercase">VIEW IN LEDGER</span>
            </button>
          </div>
        </div>
      )}

      {step === "error" && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-alert-red/20 text-alert-red">
                <Icon name="alert-triangle" className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-base font-extrabold text-white">Transfer Interrupted</h3>
            </div>
            <CloseButton onClick={onClose} />
          </div>

          <div className="flex flex-col items-center py-2 text-center">
            <div className="mb-2 flex size-14 items-center justify-center rounded-full border border-alert-red/50 bg-alert-red/20 text-alert-red shadow-[0_0_24px_rgba(235,87,87,0.35)]">
              <Icon name="x-circle" className="size-8 stroke-[2.2]" />
            </div>
            <div className="mt-1 text-xl font-extrabold leading-tight text-white">
              Transfer Failed
            </div>
            <p className="mt-0.5 text-xs font-medium text-slate-300">
              ACH Clearinghouse Gateway Timeout
            </p>
          </div>

          <div className="space-y-2 rounded-xl border border-alert-red/30 bg-[#161F33] p-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-400">Error Code</span>
              <span className="font-mono font-bold text-alert-red">
                ACH_ERR_GATEWAY_TIMEOUT (504)
              </span>
            </div>
            <div className="border-t border-slate-700/50 pt-1.5 text-[11px] leading-relaxed text-slate-300">
              The destination depository institution ({BANK}) did not acknowledge the ACH clearing
              payload within the expected timeout.
            </div>
            <div className="flex items-center justify-between border-t border-slate-700/50 pt-1.5">
              <span className="font-medium text-slate-400">Balance Protection</span>
              <span className="flex items-center gap-1 font-bold text-cta-green">
                <Icon name="shield-check" className="h-3.5 w-3.5" />
                No funds debited ({formatUsd(amountCents)} safe)
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-xl bg-slate-800 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-300 transition hover:bg-slate-700"
            >
              DISMISS
            </button>
            <button type="button" onClick={restart} className="btn-3d flex-1 py-3 text-xs tracking-wide">
              <Icon name="rotate-ccw" className="relative z-10 h-4 w-4 text-navy" />
              <span className="relative z-10 font-extrabold uppercase">TRY AGAIN</span>
            </button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

function Row({
  label,
  value,
  bordered = true,
}: {
  label: string;
  value: React.ReactNode;
  bordered?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${bordered ? "border-t border-slate-700/50 pt-2" : ""}`}
    >
      <span className="font-medium text-slate-400">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-slate-800 text-slate-400 transition hover:bg-slate-700 hover:text-white"
    >
      <Icon name="x" className="size-4" />
      <span className="sr-only">Close</span>
    </button>
  );
}
