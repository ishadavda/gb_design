"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BottomSheet } from "@/shared/ui/BottomSheet";
import { Icon } from "@/shared/ui/Icon";
import { useToast } from "@/shared/ui/Toast";

/**
 * Delete Account.
 *
 * Nothing is deleted - no account service is wired in and the brief is explicit
 * that the data layer stays untouched - so confirming spins, says what it would
 * have done, and returns to onboarding, exactly as the approved screen does.
 */
export function DeleteAccountSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const showToast = useToast();
  const [deleting, setDeleting] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (open) setDeleting(false);

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [open]);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      panelClassName="max-h-[90%] overflow-y-auto no-scrollbar rounded-t-[28px] border-t border-slate-700/70 bg-[#101626] p-5 text-white"
    >
      <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-slate-700" />

      <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-alert-red/40 bg-alert-red/20 text-alert-red">
            <Icon name="alert-triangle" className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-extrabold leading-tight text-white">Delete Account?</h3>
            <p className="text-[10px] font-medium text-slate-400">Permanent action warning</p>
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

      <div className="my-4 flex items-start gap-3">
        <p className="text-xs font-medium leading-relaxed text-slate-200">
          Are you sure you want to permanently delete your account? This action cannot be undone,
          and all your data may be permanently removed.
        </p>
      </div>

      <div className="flex gap-2.5 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 cursor-pointer rounded-xl bg-slate-800 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-300 transition hover:bg-slate-700 active:scale-[0.98]"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={() => {
            setDeleting(true);
            showToast("Account permanently deleted. Redirecting...", "error");
            timer.current = window.setTimeout(() => {
              onClose();
              router.push("/onboarding");
            }, 1200);
          }}
          className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-alert-red py-3.5 text-xs font-extrabold text-white shadow-md transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-wait"
        >
          {deleting ? (
            <>
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Deleting...</span>
            </>
          ) : (
            <>
              <Icon name="trash-2" className="h-4 w-4 shrink-0" />
              <span>Delete Account</span>
            </>
          )}
        </button>
      </div>
    </BottomSheet>
  );
}
