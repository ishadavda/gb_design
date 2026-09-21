"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  icon: "map-pin" | "coins" | "sparkles" | "shield-check";
  tone: string;
  read: boolean;
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "deal",
    title: "Twenty Twenty Flower Deal Nearby!",
    body: "Bud & Rita's Niles nearby! Tap to view your $5.00 pass and claim $5.00 back.",
    time: "2 min ago",
    icon: "map-pin",
    tone: "bg-amber-100 text-amber-600 border-amber-200",
    read: false,
  },
  {
    id: "rebate",
    title: "Rebate Credited +$5.00!",
    body: "Your itemized receipt for Tonic Citrus Fizz was verified. $5.00 added to your ledger balance.",
    time: "1 hour ago",
    icon: "coins",
    tone: "bg-emerald-100 text-emerald-600 border-emerald-200",
    read: false,
  },
  {
    id: "bonus",
    title: "Exclusive Weekend Bonus Drop!",
    body: "Graffiti pre-rolls are now offering double cash back ($4.00) at Sunnyside Chicago.",
    time: "Yesterday",
    icon: "sparkles",
    tone: "bg-teal-100 text-teal border-teal-200",
    read: true,
  },
  {
    id: "security",
    title: "Phone Verification Complete",
    body: "Your account security check-in for +1 (312) 555-0192 is active and verified.",
    time: "3 days ago",
    icon: "shield-check",
    tone: "bg-blue-100 text-blue-600 border-blue-200",
    read: true,
  },
];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  function markAllRead() {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  }

  function toggleRead(id: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: !notification.read } : notification,
      ),
    );
  }

  function deleteNotification(id: string) {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Notifications"
        className="relative flex size-8 items-center justify-center rounded-full p-1.5 text-navy transition hover:bg-slate-100 md:size-[4.25rem]"
      >
        <Icon name="bell" className="h-5 w-5 md:h-7 md:w-7" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-alert-red ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close Notifications"
            onClick={() => setOpen(false)}
            className="min-h-0 flex-1 cursor-default"
          />
          <section className="flex max-h-[82%] h-[82%] w-full flex-col rounded-t-[28px] border-t border-border-light bg-white p-5 text-navy shadow-2xl">
            <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-slate-300" />

            <div className="flex shrink-0 items-center justify-between border-b border-border-light pb-3">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-extrabold leading-tight">Notifications</h3>
                <span
                  className={`rounded-lg border px-2 py-0.5 text-[10px] font-extrabold ${
                    unreadCount ? "border-alert-red text-alert-red" : "border-slate-200 text-slate-500"
                  }`}
                >
                  {unreadCount ? `${unreadCount} New` : "0 Unread"}
                </span>
              </div>
              <button
                type="button"
                onClick={markAllRead}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-navy"
              >
                <Icon name="check-check" className="h-3.5 w-3.5 text-cta-green" />
                Mark all read
              </button>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto py-3 no-scrollbar">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 rounded-xl border p-3 transition ${
                    notification.read
                      ? "border-border-light/80 bg-white opacity-75"
                      : "border-cta-green bg-white"
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${notification.tone}`}>
                    <Icon name={notification.icon} className="h-4 w-4" />
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleRead(notification.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-1.5">
                      <h4 className="flex min-w-0 items-center gap-1.5 truncate text-xs font-extrabold">
                        {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-alert-red" />}
                        {notification.title}
                      </h4>
                      <span className="shrink-0 text-[9.5px] font-semibold text-slate-400">
                        {notification.time}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] font-medium leading-snug text-slate-600">
                      {notification.body}
                    </p>
                  </button>

                  <div className="flex shrink-0 items-center gap-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => toggleRead(notification.id)}
                      aria-label={notification.read ? "Mark unread" : "Mark read"}
                      className="rounded-lg border border-cta-green/30 bg-white p-1.5 text-cta-green"
                    >
                      <Icon name={notification.read ? "rotate-ccw" : "check"} className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteNotification(notification.id)}
                      aria-label="Delete notification"
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500"
                    >
                      <Icon name="trash-2" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
