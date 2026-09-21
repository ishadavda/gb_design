"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/shared/ui/Icon";

/**
 * The card that drops in to confirm the SMS went out, then retracts.
 *
 * The prototype printed the passcode in here because it had no way to send one.
 * A real code arrives on the phone, so this only says that it is on its way -
 * putting a code on screen would defeat the point of sending it.
 *
 * `passcode` is the one exception, and it is the prototype's situation again:
 * under ONBOARDING_MODE=stub no text message exists, so the code has to be
 * readable somewhere or the screen is a dead end.
 */
export function SmsAlertBanner({ passcode }: { passcode?: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const enter = window.setTimeout(() => setShown(true), 100);
    const leave = window.setTimeout(() => setShown(false), 5500);

    return () => {
      window.clearTimeout(enter);
      window.clearTimeout(leave);
    };
  }, []);

  return (
    <div
      className={`absolute inset-x-4 top-4 z-50 mx-auto flex max-w-xl transform items-start gap-3 rounded-2xl border border-border-light bg-white p-3.5 shadow-xl transition-transform duration-500 ${
        shown ? "translate-y-0" : "-translate-y-40"
      }`}
    >
      <div className="flex shrink-0 items-center justify-center rounded-xl bg-teal-tint p-2">
        <Icon name="message-square" className="h-4 w-4 text-teal" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate">
            Greenback Secure OTP
          </span>
          <span className="text-[10px] text-slate">just now</span>
        </div>
        <p className="mt-0.5 text-xs text-navy">
          {passcode ? (
            <>
              Your passcode is <span className="font-extrabold tracking-widest text-claire">{passcode}</span>
              . Welcome!
            </>
          ) : (
            <>
              Your passcode is on its way by{" "}
              <span className="font-extrabold text-claire">SMS</span>. Welcome!
            </>
          )}
        </p>
      </div>
    </div>
  );
}
