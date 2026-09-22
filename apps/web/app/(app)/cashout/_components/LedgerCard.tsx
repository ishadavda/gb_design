"use client";

import { useState } from "react";
import type { LedgerEntry, LedgerFilter } from "@/modules/ledger";
import { DISPUTE_REASONS, filterLedger } from "@/modules/ledger";
import { formatUsd } from "@/shared/money";
import { useCountUp } from "@/shared/hooks/useCountUp";
import { Icon } from "@/shared/ui/Icon";
import { useToast } from "@/shared/ui/Toast";
import { DEMO_PROFILE } from "../../_components/demoProfile";
import { useWallet } from "../../_components/WalletProvider";
import { DisputeSheet } from "./DisputeSheet";
import type { DisputeTarget } from "./DisputeSheet";

/**
 * Every credit, debit, hold and refusal, with the five filter tabs over them.
 *
 * Three sources feed one list, newest first: the payouts queued this session,
 * the rebates verified this session, then the seeded history. The first two come
 * from `WalletProvider` rather than props, which is how a receipt scanned on the
 * home screen is already here by the time this screen is reached.
 *
 * Which rows a tab shows is `filterLedger` in `modules/ledger`; this decides only
 * how a row looks.
 */

const TABS: { id: LedgerFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "credit", label: "Credits" },
  { id: "debit", label: "Debits" },
  { id: "pending", label: "Pending" },
  { id: "rejected", label: "Rejected" },
];

export function LedgerCard({ entries }: { entries: LedgerEntry[] }) {
  const wallet = useWallet();
  const showToast = useToast();
  const [filter, setFilter] = useState<LedgerFilter>("all");
  const [disputed, setDisputed] = useState<string[]>([]);
  const [disputeTarget, setDisputeTarget] = useState<DisputeTarget | null>(null);

  const latestCredit = wallet.credits[0] ?? null;

  const liveRows: LedgerEntry[] = [
    ...wallet.payouts.map<LedgerEntry>((payout) => ({
      id: payout.id,
      kind: "debit",
      tone: "debit",
      icon: "arrow-up-right",
      title: "Direct Deposit Withdrawal",
      tag: "Processing",
      meta: `Chase ${DEMO_PROFILE.bank.mask.replace("•••• ", "••••")} · Just now · Batch #${payout.reference}`,
      amountCents: payout.amountCents,
      status: "Async Queued",
    })),
    ...wallet.credits.map<LedgerEntry>((credit) => ({
      id: credit.id,
      kind: "credit",
      tone: "credit",
      icon: "check-check",
      title: `Rebate Credit · ${credit.itemName}`,
      tag: "✨ Credited",
      meta: `${credit.storeName} · Just now · Verified Receipt #${credit.receiptRef}`,
      amountCents: credit.amountCents,
      status: "Available Now",
    })),
  ];

  const allRows = [...liveRows, ...entries];
  const visibleRows = filterLedger(allRows, filter);

  return (
    <div className="mx-3.5 mt-3.5 rounded-2xl border border-border-light bg-white p-4">
      <div className="flex items-center justify-between border-b border-border-light pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8F5E9] text-[#2E7D32]">
            <Icon name="receipt" className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-xs font-extrabold text-navy">Order History &amp; Ledger</h3>
            <p className="text-[10px] font-medium text-slate">
              Audited record of all credits &amp; debits
            </p>
          </div>
        </div>
        <span className="rounded-md border border-border-light bg-slate-page px-2 py-0.5 font-mono text-[9.5px] font-bold text-slate">
          {allRows.length} Events
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1 rounded-xl border border-border-light bg-slate-page p-1 text-[10px] font-extrabold">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`flex-1 cursor-pointer rounded-lg py-1.5 text-center transition ${
              filter === tab.id ? "bg-white text-navy" : "text-slate hover:text-navy"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {latestCredit && (
        <div className="animate-pop-bounce mt-3 flex items-center justify-between rounded-xl border border-[#C8E6C9] bg-[#E8F5E9] p-3 transition-all duration-300">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2E7D32] text-white">
              <Icon name="sparkles" className="h-4 w-4" />
            </span>
            <div className="text-left">
              <div className="text-xs font-black leading-tight text-[#2E7D32]">
                Rebate Credited to Ledger!
              </div>
              <div className="text-[10.5px] font-medium text-[#2E7D32]/80">
                {latestCredit.itemName} · Instant Cash Out Ready
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="block font-mono text-sm font-black leading-tight text-[#2E7D32]">
              +{formatUsd(latestCredit.amountCents)}
            </span>
            <span className="text-[9px] font-extrabold uppercase text-[#2E7D32]/70">
              Available Now
            </span>
          </div>
        </div>
      )}

      <div className="mt-3 divide-y divide-border-light/60">
        {visibleRows.map((entry) => (
          <LedgerRow
            key={entry.id}
            entry={entry}
            isLatestCredit={entry.id === wallet.latestCreditId}
            disputed={disputed.includes(entry.id)}
            onChallenge={() =>
              setDisputeTarget({
                receiptRef: entry.rejection?.receiptRef ?? entry.id,
                itemName: entry.title,
                amountCents: entry.amountCents,
                store: entry.rejection?.store ?? "",
                reason: DISPUTE_REASONS[entry.id] ?? entry.rejection?.reason ?? "",
              })
            }
          />
        ))}
      </div>

      <div className="mt-3.5 flex items-center justify-between border-t border-border-light pt-2.5 font-mono text-[10px] text-slate">
        <span className="flex items-center gap-1">
          <Icon name="shield-check" className="h-3.5 w-3.5 text-cta-green" />
          <span>Audit: #9F82A-CLEARED</span>
        </span>
        <button
          type="button"
          onClick={() => showToast("Transaction ledger exported to PDF/CSV", "info")}
          className="cursor-pointer font-sans font-bold text-teal hover:underline"
        >
          Export Statement
        </button>
      </div>

      <DisputeSheet
        target={disputeTarget}
        onClose={() => setDisputeTarget(null)}
        onSubmitted={(receiptRef) => setDisputed((current) => [...current, receiptRef])}
      />
    </div>
  );
}

function LedgerRow({
  entry,
  isLatestCredit,
  disputed,
  onChallenge,
}: {
  entry: LedgerEntry;
  isLatestCredit: boolean;
  disputed: boolean;
  onChallenge: () => void;
}) {
  // The freshly verified credit counts up from zero where it sits, as it does in
  // the approved screens; every other row is simply printed.
  const { value } = useCountUp(0, entry.amountCents, {
    durationMs: 900,
    run: isLatestCredit,
  });
  const amountCents = isLatestCredit ? value : entry.amountCents;

  if (entry.kind === "rejected") {
    return (
      <div className="flex flex-col gap-1.5 py-2.5">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 border-alert-red bg-white text-alert-red">
              <Icon name={entry.icon} className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h5 className="truncate text-xs font-extrabold leading-tight text-navy">
                  {entry.title}
                </h5>
                {disputed ? (
                  <span className="flex items-center gap-1 rounded border border-amber-300 bg-amber-100 px-1.5 py-[0.05rem] text-[8.5px] font-extrabold text-amber-800">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" /> In
                    Dispute
                  </span>
                ) : (
                  <span className="rounded border-2 border-alert-red/50 bg-white px-1.5 py-[0.05rem] text-[8.5px] font-extrabold text-alert-red">
                    {entry.tag}
                  </span>
                )}
              </div>
              <span className="mt-0.5 block truncate text-[10px] font-medium text-slate">
                {entry.meta}
              </span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="block text-xs font-extrabold leading-tight text-slate-400 line-through">
              {formatUsd(entry.amountCents)}
            </span>
            <span
              className={`text-[9px] font-extrabold uppercase ${
                disputed ? "text-amber-600" : "text-alert-red"
              }`}
            >
              {disputed ? "Under Review" : entry.status}
            </span>
          </div>
        </div>

        {entry.rejection && (
          <div className="ml-10 flex items-center justify-between gap-2 rounded-xl border-2 border-alert-red/50 bg-white p-2.5 text-[10px] text-slate-600 shadow-2xs">
            <div className="flex min-w-0 items-start gap-1.5">
              <Icon
                name={entry.rejection.icon}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-alert-red"
              />
              <span className="leading-tight">
                <strong>{entry.rejection.headline}</strong> {entry.rejection.reason}
              </span>
            </div>
            <div className="shrink-0">
              {disputed ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9.5px] font-bold text-amber-700">
                  <Icon name="clock" className="h-3 w-3 animate-spin text-amber-600" />
                  <span>Audit Queued</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onChallenge}
                  className="flex cursor-pointer items-center gap-1 rounded-md border-2 border-alert-red/50 bg-white px-2.5 py-1 text-[9.5px] font-extrabold text-navy transition hover:bg-red-50 active:scale-95 shadow-2xs"
                >
                  <Icon name="scale" className="h-3 w-3" />
                  <span>Challenge</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const isLivePayout = entry.status === "Async Queued";

  return (
    <div
      className={`flex items-center justify-between gap-2.5 py-2.5 ${
        isLatestCredit
          ? "animate-ledger-drop animate-ledger-ring -mx-2 rounded-xl border border-[#C8E6C9] bg-[#E8F5E9]/80 px-2.5 ring-4 ring-[#4CAF50]/60 transition"
          : isLivePayout
            ? "-mx-2 animate-pulse rounded-xl border border-teal/30 bg-teal-tint/30 px-2 transition"
            : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${iconTone(entry)}`}>
          <Icon name={entry.icon} className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h5 className="truncate text-xs font-extrabold leading-tight text-navy">
              {entry.title}
            </h5>
            <span className={`rounded px-1.5 py-[0.05rem] text-[8.5px] font-extrabold ${tagTone(entry)}`}>
              {entry.tag}
            </span>
          </div>
          <span className="mt-0.5 block truncate text-[10px] font-medium text-slate">
            {entry.meta}
          </span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <span className={`block leading-tight ${amountTone(entry, isLatestCredit)}`}>
          {entry.kind === "debit" ? "-" : "+"}
          {formatUsd(amountCents)}
        </span>
        <span className={`text-[9px] font-extrabold uppercase ${statusTone(entry)}`}>
          {entry.status}
        </span>
      </div>
    </div>
  );
}

function iconTone(entry: LedgerEntry): string {
  if (entry.icon === "check-check") return "border border-[#2E7D32] bg-[#2E7D32] text-white";

  switch (entry.tone) {
    case "credit":
      return "border border-cta-green/20 bg-cta-green/10 text-claire";
    case "bonus":
      return "border border-teal/20 bg-teal-tint text-teal";
    case "pending":
      return "animate-pulse border border-amber-300 bg-amber-100 text-amber-700";
    default:
      return "border border-border-light bg-slate-page text-navy";
  }
}

function tagTone(entry: LedgerEntry): string {
  if (entry.icon === "check-check") return "border border-[#C8E6C9] bg-[#E8F5E9] text-[#2E7D32] animate-pulse";

  switch (entry.tone) {
    case "credit":
      return "bg-cta-green/10 text-claire";
    case "bonus":
      return "bg-teal-tint text-teal";
    case "pending":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-200 text-slate-700";
  }
}

function amountTone(entry: LedgerEntry, isLatestCredit: boolean): string {
  if (isLatestCredit || entry.icon === "check-check")
    return "font-mono text-xs font-black text-[#2E7D32]";

  switch (entry.tone) {
    case "credit":
    case "bonus":
      return "text-xs font-extrabold text-claire";
    case "pending":
      return "text-xs font-extrabold text-amber-600";
    default:
      return "text-xs font-extrabold text-navy";
  }
}

function statusTone(entry: LedgerEntry): string {
  if (entry.status === "Available Now") return "text-[#2E7D32]";
  if (entry.tone === "pending" || entry.status === "Async Queued") return "text-amber-600";

  return "text-slate-400";
}
