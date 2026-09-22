"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { useToast } from "@/shared/ui/Toast";
import { DeleteAccountSheet } from "./DeleteAccountSheet";

/**
 * Log out, delete account, app version.
 *
 * Logging out returns to onboarding after the toast, as the prototype does. It
 * does not clear a session, because clearing one would mean touching auth, which
 * this port deliberately leaves alone.
 */
export function AccountFooter() {
  const router = useRouter();
  const showToast = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  return (
    <div className="mx-3.5 mb-2 mt-4">
      <button
        type="button"
        onClick={() => {
          showToast("Logged out of Greenback Cash. Redirecting...", "info");
          timer.current = window.setTimeout(() => router.push("/onboarding"), 1200);
        }}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-xs font-extrabold text-navy shadow-[0_1px_0_rgba(15,23,42,0.02)] transition hover:bg-slate-50 active:scale-[0.98]"
      >
        <Icon name="log-out" className="h-4 w-4 text-navy" />
        <span>Log Out of Greenback Cash</span>
      </button>

      <button
        type="button"
        onClick={() => setDeleteOpen(true)}
        className="my-2 mx-auto block cursor-pointer text-center text-xs font-bold tracking-tight text-navy transition hover:underline"
      >
        Delete Account
      </button>

      <p className="mt-2.5 text-center text-[10px] font-medium uppercase tracking-[0.15em] text-slate-500">
        App Version 2.4.0 (2026) • CPG Clearinghouse Network
      </p>

      <DeleteAccountSheet open={deleteOpen} onClose={() => setDeleteOpen(false)} />
    </div>
  );
}
