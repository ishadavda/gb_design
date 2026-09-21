"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/shared/ui/Icon";
import { useReceiptScanner } from "./ReceiptScannerProvider";

/**
 * The five-tab bar. Four are routes; Scan is not - it opens the receipt sheet
 * over whatever screen you are on, which is why it is a button and not a link.
 *
 * Active state comes from the URL rather than from a variable the way the
 * prototype tracked it: there is no state to get out of step with the address
 * bar, and a deep link lands with the right tab lit.
 */
const TABS: { href: string; icon: IconName; label: string }[] = [
  { href: "/home", icon: "home", label: "Home" },
  { href: "/cashout", icon: "coins", label: "Cash Out" },
  { href: "/deals", icon: "tag", label: "Deals" },
  { href: "/account", icon: "user", label: "Account" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { openScanner } = useReceiptScanner();

  // A product page opened from Deals keeps Deals lit, as the prototype did.
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label="Primary"
      className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border-light bg-white px-1 py-2 shadow-lg"
    >
      <Tab {...TABS[0]!} active={isActive(TABS[0]!.href)} />

      <button
        type="button"
        onClick={() => openScanner()}
        className="flex flex-1 cursor-pointer flex-col items-center gap-0.5 text-[9px] font-bold text-slate transition hover:text-navy"
      >
        <span className="flex h-7 w-9 items-center justify-center rounded-lg">
          <Icon name="scan-line" className="h-4 w-4 text-slate" />
        </span>
        <span>Scan</span>
      </button>

      {TABS.slice(1).map((tab) => (
        <Tab key={tab.href} {...tab} active={isActive(tab.href)} />
      ))}
    </nav>
  );
}

function Tab({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: IconName;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex flex-1 cursor-pointer flex-col items-center gap-0.5 text-[9px] transition ${
        active ? "font-extrabold text-teal" : "font-bold text-slate hover:text-navy"
      }`}
    >
      <span
        className={`flex h-7 w-9 items-center justify-center rounded-lg ${active ? "bg-teal-tint" : ""}`}
      >
        <Icon name={icon} className={`h-4 w-4 ${active ? "text-teal" : "text-slate"}`} />
      </span>
      <span>{label}</span>
    </Link>
  );
}
