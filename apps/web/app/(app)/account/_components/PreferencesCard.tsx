"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { useToast } from "@/shared/ui/Toast";
import { NotificationPreferencesSheet } from "./NotificationPreferencesSheet";

/**
 * The three double opt-in consents.
 *
 * Local state mirrors the consent controls until a preference service is wired.
 */
const PREFERENCES = [
  {
    id: "sms",
    title: "SMS Local Deal Alerts",
    description: "Daily text updates for discounts near Chicago",
    toast: "SMS deal alerts preference updated",
    enabled: false,
  },
  {
    id: "email",
    title: "Email Receipt Statements",
    description: "Weekly statements and cashout confirmations",
    toast: "Email statements preference updated",
    enabled: true,
  },
  {
    id: "clearinghouse",
    title: "Clearinghouse Data Controller",
    description: "Authorize Greenback Cash as independent record keeper",
    toast: "Clearinghouse data consent updated",
    enabled: true,
  },
];

export function PreferencesCard() {
  const showToast = useToast();
  const [preferences, setPreferences] = useState(
    Object.fromEntries(PREFERENCES.map((preference) => [preference.id, preference.enabled])) as Record<
      string,
      boolean
    >,
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  function togglePreference(id: string, toast: string) {
    setPreferences((current) => ({ ...current, [id]: !current[id] }));
    showToast(toast, "info");
  }

  return (
    <div className="mx-3.5 mt-3 rounded-2xl border border-border-light bg-white p-4">
      <div className="flex items-center gap-2 border-b border-border-light pb-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-light bg-slate-page text-[#1D7EE8]">
          <Icon name="bell" className="h-4 w-4" />
        </span>
        <div>
          <h4 className="text-sm font-extrabold text-navy">
            Notification &amp; Privacy Preferences
          </h4>
          <p className="text-xs font-medium text-slate">Double opt-in permissions</p>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {PREFERENCES.map((preference, index) => (
          <label
            key={preference.id}
            className={`flex cursor-pointer items-start justify-between gap-3 ${
              index === 0 ? "" : "border-t border-border-light/60 pt-2.5"
            }`}
          >
            <div className="flex-1">
              <span className="block text-sm font-bold text-navy">{preference.title}</span>
              <span className="mt-1 block text-xs leading-relaxed text-slate">
                {preference.description}
              </span>
            </div>
            <button
              type="button"
              aria-pressed={preferences[preference.id]}
              aria-label={`${preference.title} ${preferences[preference.id] ? "enabled" : "disabled"}`}
              onClick={() => togglePreference(preference.id, preference.toast)}
              className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border transition ${
                preferences[preference.id]
                  ? "border-[#2E7D32] bg-[#2E7D32] text-white"
                  : "border-slate-500 bg-white text-transparent"
              }`}
            >
              <Icon name="check" className="h-3 w-3" />
            </button>
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="group mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 border-t border-border-light pt-3 text-sm font-extrabold text-[#00A8D6] transition hover:text-black"
      >
        <Icon name="bell" className="h-4 w-4 transition group-hover:text-black" />
        Preview Notification &amp; Opt-Out Prompt
      </button>

      <NotificationPreferencesSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
