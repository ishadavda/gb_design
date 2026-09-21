"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { Icon } from "@/shared/ui/Icon";
import { useToast } from "@/shared/ui/Toast";
import type { ScannedDeal } from "./ReceiptScannerProvider";

/**
 * Upload Receipt: pick a pathway, produce an image, watch the diagnostics run.
 *
 * The scan itself is scripted, exactly as in the approved screens - the preset
 * in the "Diagnostics Simulator" bar decides whether this receipt passes, and
 * the delays between the lines of output are the prototype's. There is no OCR
 * behind it and nothing is uploaded; this is the screen, waiting for the service.
 *
 * Everything the prototype did by rewriting `className` and `textContent` on ids
 * is derived from `stage` here, so there is no combination of clicks that can
 * leave the sheet showing two pathways or an enabled button with nothing to send.
 */

type QualityPreset = "pass" | "blurry" | "dark";
type Stage = "choose" | "camera" | "file" | "scanning";

const FOCUS_CHECK = "Evaluating sharpness focus checks (Laplacian variance)...";

export function ReceiptScannerSheet({
  open,
  deal,
  onClose,
  onVerified,
}: {
  open: boolean;
  deal: ScannedDeal;
  onClose: () => void;
  onVerified: () => void;
}) {
  const showToast = useToast();

  const [quality, setQuality] = useState<QualityPreset>("pass");
  const [stage, setStage] = useState<Stage>("choose");
  const [sections, setSections] = useState(0);
  const [fileSelected, setFileSelected] = useState(false);
  const [scanDetail, setScanDetail] = useState(FOCUS_CHECK);

  // Every scripted step is a timeout; they are tracked so closing the sheet
  // mid-scan does not pop a celebration a second later.
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const restart = useCallback(() => {
    clearTimers();
    setStage("choose");
    setSections(0);
    setFileSelected(false);
    setScanDetail(FOCUS_CHECK);
  }, [clearTimers]);

  useEffect(() => {
    if (open) restart();

    return clearTimers;
  }, [open, restart, clearTimers]);

  const ready = sections > 0 || fileSelected;

  const ctaLabel = fileSelected
    ? "Upload Screenshot"
    : sections > 0
      ? `Upload Receipt (${sections} Section${sections > 1 ? "s" : ""})`
      : stage === "file"
        ? "Upload Screenshot"
        : "Upload Receipt";

  const actionButtonClass =
    "btn-gold-3d w-full cursor-pointer rounded-xl py-3 text-[13px] font-extrabold text-slate-950 shadow-lg transition active:scale-[0.98]";

  function capture() {
    const next = sections + 1;

    setSections(next);
  }

  function selectScreenshot() {
    setFileSelected(true);
    setStage("file");
    showToast("Screenshot file selected from local photo library.", "info");
  }

  function runDiagnostics() {
    setStage("scanning");
    setScanDetail(FOCUS_CHECK);

    later(() => {
      if (quality === "blurry") {
        setScanDetail("Soft Reject: Laplacian focus check failed (Variance = 42 < 100)");
        showToast("Text Blurry! Please hold phone steady under direct light and retake.", "error");
        later(restart, 2000);
        return;
      }

      setScanDetail("Analyzing illumination threshold ratios...");

      later(() => {
        if (quality === "dark") {
          setScanDetail("Soft Reject: Underlit scan warning (Average Lux = 18% < 30%)");
          showToast("Too Dark! Turn on flashlight or use direct light and retake.", "error");
          later(restart, 2000);
          return;
        }

        setScanDetail("Image diagnostics verified (Var = 185)! Matching SKU and cashing out...");
        later(onVerified, 1100);
      }, 1000);
    }, 1000);
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      panelClassName="max-h-[88%] overflow-y-auto no-scrollbar rounded-t-[28px] border-t border-slate-700/70 bg-[#101626] p-5 font-sans text-white"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-cta-green/40 bg-cta-green/10 text-cta-green">
              <Icon name="receipt" className="h-4 w-4" />
            </span>
            <h3 className="text-base font-extrabold text-white">Upload Receipt</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-slate-800 text-slate-400 transition hover:bg-slate-700 hover:text-white"
          >
            <Icon name="x" className="size-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-700/60 bg-[#111C2E] p-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-extrabold uppercase tracking-wider text-white/90">
              DIAGNOSTICS<br />SIMULATOR
            </div>
            <div className="mt-0.5 text-xs text-slate-400">
              Toggle photo resolution parameters
            </div>
          </div>
          <select
            aria-label="Diagnostics preset"
            value={quality}
            onChange={(event) => setQuality(event.target.value as QualityPreset)}
            className="shrink-0 appearance-none rounded-lg border border-slate-700 bg-[#0B1120] px-2.5 py-1.5 pr-9 text-xs font-semibold text-white shadow-inner outline-none transition focus:border-cta-green"
          >
            <option value="pass">Perfect Ingest (Pass)</option>
            <option value="blurry">Text Blurry (Fail)</option>
            <option value="dark">Too Dark (Fail)</option>
          </select>
        </div>

        <div className="rounded-2xl border border-slate-700/60 bg-[#111C2E] p-3">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#2E3D5E] text-amber-300">
              <Icon name="sparkles" className="h-3.5 w-3.5" />
            </span>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">BEST PRACTICES</h4>
          </div>
          <div className="space-y-2.5 border-t border-slate-700/50 pt-3 text-xs font-medium text-white sm:text-[13px]">
            <div className="flex items-start gap-2.5 text-slate-100">
              <span className="mt-0.5 text-emerald-400">
                <Icon name="check" className="h-3.5 w-3.5" />
              </span>
              <span>Place receipt on a dark, contrasting background</span>
            </div>
            <div className="flex items-start gap-2.5 text-slate-100">
              <span className="mt-0.5 text-emerald-400">
                <Icon name="check" className="h-3.5 w-3.5" />
              </span>
              <span>Avoid shadows and ensure bright, even lighting</span>
            </div>
            <div className="flex items-start gap-2.5 text-slate-100">
              <span className="mt-0.5 text-emerald-400">
                <Icon name="check" className="h-3.5 w-3.5" />
              </span>
              <span>Keep receipt flat, fully in frame, and in clear focus</span>
            </div>
          </div>
        </div>

        {stage === "choose" && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setStage("camera")}
              className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-slate-700/60 bg-[#111C2E] p-4 text-center transition hover:border-cta-green hover:bg-[#14233d] active:scale-[0.98]"
            >
              <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl border border-cta-green/30 bg-[#0B1120] text-cta-green transition-transform group-hover:scale-105">
                <Icon name="camera" className="h-6 w-6" />
              </span>
              <span className="text-xs font-extrabold text-white">Take Picture</span>
              <span className="mt-1 text-[11px] text-slate-400">For printed slips</span>
            </button>

            <button
              type="button"
              onClick={() => setStage("file")}
              className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-slate-700/60 bg-[#111C2E] p-4 text-center transition hover:border-cyan-400 hover:bg-[#14233d] active:scale-[0.98]"
            >
              <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/40 bg-[#0B1120] text-cyan-400 transition-transform group-hover:scale-105">
                <Icon name="upload" className="h-6 w-6" />
              </span>
              <span className="text-xs font-extrabold text-white">Upload Image</span>
              <span className="mt-1 text-[11px] text-slate-400">Screenshot / Invoice</span>
            </button>
          </div>
        )}

        {stage === "camera" && (
          <div className="space-y-3">
            <div className="relative flex min-h-[150px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-700/80 bg-[#0B1120] p-6">
              <div className="pointer-events-none absolute inset-3 grid grid-cols-3 grid-rows-3 opacity-20">
                <div className="border-b border-r border-slate-500/80" />
                <div className="border-b border-r border-slate-500/80" />
                <div className="border-b border-slate-500/80" />
                <div className="border-b border-r border-slate-500/80" />
                <div className="border-b border-r border-slate-500/80" />
                <div className="border-b border-slate-500/80" />
                <div className="border-r border-slate-500/80" />
                <div className="border-r border-slate-500/80" />
                <div />
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <Icon name="scan" className="mb-1 h-8 w-8 animate-pulse text-cta-green" />
                <span className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-slate-200">
                  {sections > 0 ? `SECTION ${sections} CAPTURED!` : "LINE UP YOUR RECEIPT"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={capture}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-[13px] font-extrabold text-slate-950 shadow-md transition hover:bg-emerald-400 active:scale-[0.98]"
            >
              <Icon name="camera" className="h-4 w-4" />
              <span>{sections > 0 ? "Retake Section" : "Capture Photo"}</span>
            </button>

            {sections > 0 && (
              <p className="pt-1 text-center text-[11px] font-medium text-slate-400">
                If your receipt is short, you&apos;re ready to upload!
              </p>
            )}
          </div>
        )}

        {stage === "file" && (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-[22px] border-[2px] border-dashed border-slate-700/80 bg-[#0B1120] p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-[#111C2E] text-slate-300">
                <Icon name="file-image" className="h-8 w-8" />
              </div>
              <h4 className="mt-4 text-[15px] font-extrabold tracking-[-0.02em] text-white">
                {fileSelected ? "Screenshot Ready to Process" : "Select Screenshot from Photo Library"}
              </h4>
              <p className="mt-1 text-[11px] text-slate-400">
                {fileSelected
                  ? "Receipt image attached and ready for diagnostics."
                  : "Dutchie / Jane digital receipt captures"}
              </p>

              {!fileSelected && (
                <button
                  type="button"
                  onClick={selectScreenshot}
                  className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1B75D0] py-3 text-[13px] font-extrabold text-white shadow-md transition hover:bg-[#2E86E4]"
                >
                  <Icon name="image" className="h-4 w-4" />
                  <span>Select &amp; Process Screenshot</span>
                </button>
              )}

              {fileSelected && (
                <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-center">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-300">
                    Screenshot attached
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {stage === "scanning" && (
          <div className="space-y-3 rounded-2xl border border-slate-700 bg-[#0B1120] p-5 text-center">
            <div className="mx-auto flex h-10 w-10 animate-spin items-center justify-center rounded-full border border-cta-green/40 bg-cta-green/10 text-cta-green">
              <Icon name="loader-2" className="h-5 w-5" />
            </div>
            <div>
              <h5 className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-white/90">
                ANALYZING RECEIPT
              </h5>
              <p className="mt-2 font-mono text-[11px] text-slate-400">{scanDetail}</p>
            </div>
          </div>
        )}

        <div className="pt-1">
          <button
            type="button"
            disabled={!ready || stage === "scanning"}
            onClick={runDiagnostics}
            className={
              ready && stage !== "scanning"
                ? actionButtonClass
                : "w-full cursor-not-allowed rounded-xl bg-[#111C2E] py-3 text-[13px] font-extrabold text-slate-500"
            }
          >
            {ctaLabel}
          </button>
          <p className="sr-only">
            Scanning {deal.title} at {deal.storeName}
          </p>
        </div>
      </div>
    </BottomSheet>
  );
}
