"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

/**
 * The sheet that rises from the bottom of the phone frame.
 *
 * Six of them in the approved screens - receipt upload, edit profile, cash out,
 * dispute, delete account, verification - all with the same scrim, the same
 * slide and the same tap-outside-to-dismiss. Only the panel differs, so only the
 * panel is passed in.
 *
 * It is always mounted and moved with a transform rather than added and removed,
 * because an element that does not exist has nowhere to slide from. `fixed` keeps
 * the scrim and panel attached to the viewport instead of the scrollable page.
 *
 * Escape closes it. The prototype had no keyboard path out of a sheet; on a real
 * device with a keyboard attached, that is a trap.
 */
export function BottomSheet({
  open,
  onClose,
  panelClassName = "",
  children,
}: {
  open: boolean;
  onClose: () => void;
  panelClassName?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm transition-all duration-300 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className="w-full flex-1 cursor-default"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`w-full transform shadow-2xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        } ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
