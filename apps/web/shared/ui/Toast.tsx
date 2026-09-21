"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

/**
 * The floating in-app toast, and the way any screen asks for one.
 *
 * The prototype called a global `showInAppToast(message, type)` from anywhere on
 * the page. A context is the same affordance without the global: the provider
 * owns the single toast element the design calls for - one at a time, replacing
 * whatever was showing - and `useToast()` hands out the trigger.
 *
 * It lives in shared/ui because five routes raise toasts. It knows nothing about
 * what they are for.
 */

const VISIBLE_MS = 3500;

export type ToastTone = "success" | "error" | "info";

interface Toast {
  message: string;
  tone: ToastTone;
  /** Bumped on every call so the same message twice still re-triggers the timer. */
  key: number;
}

const ToastContext = createContext<((message: string, tone?: ToastTone) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const counter = useRef(0);

  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    counter.current += 1;
    setToast({ message, tone, key: counter.current });
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <ToastCard toast={toast} onExpire={() => setToast(null)} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const showToast = useContext(ToastContext);

  if (!showToast) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }

  return showToast;
}

const TONES: Record<ToastTone, { wrap: string; icon: IconName; iconClass: string }> = {
  success: {
    wrap: "bg-cta-green/20 text-cta-green",
    icon: "check-circle-2",
    iconClass: "size-4 text-cta-green",
  },
  error: {
    wrap: "bg-alert-red/20 text-alert-red",
    icon: "alert-circle",
    iconClass: "size-4 text-alert-red",
  },
  info: {
    wrap: "bg-teal-tint text-teal",
    icon: "info",
    iconClass: "size-4 text-teal",
  },
};

function ToastCard({ toast, onExpire }: { toast: Toast | null; onExpire: () => void }) {
  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(onExpire, VISIBLE_MS);

    return () => window.clearTimeout(timer);
  }, [toast, onExpire]);

  // Rendered even when empty: the design slides it in from above, and an element
  // that only appears on demand has nowhere to slide from.
  const tone = TONES[toast?.tone ?? "info"];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`absolute inset-x-4 top-4 z-50 mx-auto flex max-w-sm transform items-center gap-2.5 rounded-2xl border border-slate-700 bg-navy-hero p-3 shadow-xl transition-all duration-300 ${
        toast ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-32 opacity-0"
      }`}
    >
      <div className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${tone.wrap}`}>
        <Icon name={tone.icon} className={tone.iconClass} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-white">{toast?.message}</p>
      </div>
    </div>
  );
}
